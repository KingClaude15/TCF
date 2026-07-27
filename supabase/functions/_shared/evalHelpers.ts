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
 * Groq's free tier (verified directly against console.groq.com/docs/rate-limits):
 *   llama-3.3-70b-versatile : 30 RPM / 1,000 RPD / 12K TPM / 100K TPD
 *   whisper-large-v3        : 20 RPM / 2,000 RPD / 25MB direct upload
 * Both are meaningfully more generous than Gemini's free tier for this
 * workload, and — critically — are a COMPLETELY SEPARATE quota from
 * Gemini's. Using Groq as primary and Gemini as fallback means a
 * submission only fails if both providers are exhausted/down at the same
 * moment, not just one.
 */
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const GROQ_TEXT_MODEL = 'llama-3.3-70b-versatile'
const GROQ_WHISPER_MODEL = 'whisper-large-v3'

export function classifyGroqError(status, bodyText) {
  if (status === 429) return 'quota' // daily/per-minute cap hit — fall back, don't retry the same provider
  if (status >= 500) return 'overload' // transient — one quick retry is worth it before falling back
  return 'other'
}

/** Text-only grading call to Groq's OpenAI-compatible chat endpoint. */
async function callGroqChat(groqKey, systemPrompt, userText, { timeoutMs = 45000 } = {}) {
  const attempt = async () => {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GROQ_TEXT_MODEL,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userText },
          ],
        }),
        signal: controller.signal,
      })
      if (res.ok) return { ok: true, json: await res.json() }
      const errText = await res.text()
      return { ok: false, status: res.status, kind: classifyGroqError(res.status, errText), rawText: errText }
    } finally {
      clearTimeout(t)
    }
  }

  let result = await attempt()
  if (!result.ok && result.kind === 'overload') {
    await new Promise((r) => setTimeout(r, 2000))
    result = await attempt()
  }
  return result
}

/**
 * Grades text (EE essay, or an EO transcript) with Groq first, falling
 * back to Gemini (with its own responseSchema-based structured output) if
 * Groq is exhausted, overloaded, or errors for any other reason. Returns
 * { ok, provider, parsed } on success, or { ok: false, kind, rawText } if
 * BOTH providers failed — mirroring callGeminiWithPolicy's return shape so
 * existing caller code barely changes.
 */
export async function gradeTextWithFallback({ systemPrompt, userText, groqKey, geminiKey, geminiUrl, responseSchema }) {
  if (groqKey) {
    const groqResult = await callGroqChat(groqKey, systemPrompt, userText)
    if (groqResult.ok) {
      const rawText = groqResult.json.choices?.[0]?.message?.content
      if (rawText) {
        try {
          return { ok: true, provider: 'groq', parsed: JSON.parse(rawText) }
        } catch (e) {
          console.error('gradeTextWithFallback: Groq returned invalid JSON, falling back to Gemini:', e.message)
        }
      } else {
        console.error('gradeTextWithFallback: Groq returned no content, falling back to Gemini')
      }
    } else {
      console.error('gradeTextWithFallback: Groq failed, kind=', groqResult.kind, '— falling back to Gemini')
    }
  }

  if (!geminiKey) {
    return { ok: false, kind: 'other', rawText: 'Groq failed and no GEMINI_API_KEY is configured as fallback.' }
  }

  const geminiResult = await callGeminiWithPolicy(geminiUrl, {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseSchema },
  })
  if (!geminiResult.ok) return geminiResult

  const rawText = geminiResult.json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) return { ok: false, kind: 'other', rawText: 'Gemini returned no content (after Groq fallback)' }
  return { ok: true, provider: 'gemini', parsed: JSON.parse(rawText) }
}

/**
 * Transcribes audio with Groq Whisper (fast, generous 2,000/day free
 * quota, purpose-built for this). Returns { ok, provider: 'groq',
 * transcript } on success, or { ok: false } if Groq isn't configured or
 * fails — in which case the caller should fall back to sending the audio
 * directly to Gemini's multimodal endpoint (transcription + grading
 * combined in one call, the original pipeline), since that doesn't need a
 * separate transcript step at all.
 */
export async function transcribeWithGroq(groqKey, audioBlob, mimeType, { timeoutMs = 45000 } = {}) {
  if (!groqKey) return { ok: false, kind: 'other', rawText: 'No GROQ_API_KEY configured' }

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const form = new FormData()
    form.append('file', audioBlob, `recording.${mimeType.includes('webm') ? 'webm' : 'wav'}`)
    form.append('model', GROQ_WHISPER_MODEL)
    form.append('language', 'fr') // TCF Canada is always French — pins accuracy and speed
    form.append('response_format', 'json')

    const res = await fetch(GROQ_TRANSCRIBE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${groqKey}` },
      body: form,
      signal: controller.signal,
    })
    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, status: res.status, kind: classifyGroqError(res.status, errText), rawText: errText }
    }
    const json = await res.json()
    if (!json.text) return { ok: false, kind: 'other', rawText: 'Groq Whisper returned no transcript' }
    return { ok: true, provider: 'groq', transcript: json.text }
  } catch (err) {
    return { ok: false, kind: 'other', rawText: err.message }
  } finally {
    clearTimeout(t)
  }
}
/**
 * Returns the user's currently in-progress evaluation (if any) across
 * BOTH ee_submissions and eo_submissions — they now share Groq's quota
 * too (in addition to Gemini's), so a lock on one module still has to
 * cover the other.
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
