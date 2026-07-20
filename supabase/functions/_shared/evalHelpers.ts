// Shared by evaluate-essay and evaluate-eo. Deploy both functions together
// (supabase functions deploy evaluate-essay evaluate-eo) so this relative
// import resolves — this file is not a function itself (underscore-prefixed
// folders are skipped by `supabase functions deploy` when deploying "all").

/**
 * Classifies a Gemini API error so the caller knows whether retrying is
 * worthwhile.
 *  - 'quota'    → 429 RESOURCE_EXHAUSTED (daily/per-minute free-tier cap).
 *                 Retrying immediately NEVER helps and only wastes more of
 *                 the same quota — this is what was compounding the
 *                 original problem (a stuck submission kept re-consuming
 *                 the 20-requests/day budget).
 *  - 'overload' → 503 UNAVAILABLE ("high demand"). Genuinely transient —
 *                 one short retry is reasonable.
 *  - 'other'    → anything else (bad request, parsing, network, etc).
 */
export function classifyGeminiError(status, bodyText) {
  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(bodyText)) return 'quota'
  if (status === 503 || /UNAVAILABLE/i.test(bodyText)) return 'overload'
  return 'other'
}

export function friendlyEvalErrorMessage(kind, rawMessage) {
  if (kind === 'quota') {
    return "Le quota gratuit quotidien de l'IA d'évaluation est atteint. Réessaie plus tard (le quota se réinitialise chaque jour) ou contacte l'administrateur pour augmenter le quota."
  }
  if (kind === 'overload') {
    return "Le service d'évaluation IA est actuellement très sollicité. Réessaie dans quelques minutes."
  }
  return "Une erreur est survenue pendant l'évaluation. Réessaie dans quelques instants ou contacte le support si le problème persiste. Détail technique : " + (rawMessage || '').slice(0, 200)
}

/**
 * Calls the Gemini API, retrying once (after a short delay) only for
 * transient 'overload' errors. Quota errors ('quota') are never retried —
 * see classifyGeminiError above for why. Returns { ok, json, kind, rawText }.
 */
export async function callGeminiWithPolicy(url, body, { timeoutMs = 55000 } = {}) {
  const attempt = async () => {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (res.ok) {
        return { ok: true, json: await res.json() }
      }
      const errText = await res.text()
      return { ok: false, status: res.status, kind: classifyGeminiError(res.status, errText), rawText: errText }
    } finally {
      clearTimeout(t)
    }
  }

  let result = await attempt()
  if (!result.ok && result.kind === 'overload') {
    await new Promise((r) => setTimeout(r, 3000))
    result = await attempt()
  }
  return result
}

/**
 * Returns the user's currently in-progress evaluation (if any) across
 * BOTH ee_submissions and eo_submissions — they share the same Gemini API
 * key/quota, so a lock on one module has to cover the other too.
 *
 * `excludeKind`/`excludeSujetNumber` identify the sujet currently being
 * submitted: its own 2-3 tasks legitimately go to 'evaluating' together
 * within the same click, and must NOT lock each other out — only a
 * genuinely different sujet counts as "already in progress".
 *
 * Rows stuck in 'evaluating' for more than STALE_MINUTES are treated as
 * dead (self-healing: flipped to 'error' here rather than blocking
 * forever) instead of counting as an active lock.
 */
const STALE_MINUTES = 10

export async function findActiveEvaluation(admin, userId, excludeKind, excludeSujetNumber) {
  const staleBefore = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString()

  for (const [table, kind, urlBase] of [
    ['ee_submissions', 'EE', '/ee/'],
    ['eo_submissions', 'EO', '/eo/'],
  ]) {
    const { data: rows } = await admin
      .from(table)
      .select('id, topic_number, evaluation_started_at')
      .eq('user_id', userId)
      .eq('status', 'evaluating')
    if (!rows?.length) continue

    for (const row of rows) {
      const sujetNumber = Math.floor(row.topic_number / 10)
      if (kind === excludeKind && sujetNumber === excludeSujetNumber) continue // same sujet's other tasks — not a lock

      const started = row.evaluation_started_at
      if (started && started < staleBefore) {
        // Self-heal: this one has been "evaluating" too long — the
        // background task almost certainly crashed or the platform
        // recycled it without finishing. Don't let it block forever.
        await admin
          .from(table)
          .update({ status: 'error', error_message: 'Expiré : aucune réponse reçue après 10 minutes.' })
          .eq('id', row.id)
        await admin.from('notifications').insert({
          user_id: userId,
          type: 'eval_error',
          title: `Sujet ${kind} — évaluation expirée`,
          body: "L'évaluation a pris trop de temps et a été annulée. Tu peux resoumettre.",
          link: `${urlBase}${sujetNumber}`,
        })
        continue
      }
      return { table, kind, submissionId: row.id, sujetNumber }
    }
  }
  return null
}
