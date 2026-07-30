import { supabase } from '../lib/supabaseClient'

export async function listEeSubmissions(userId) {
  const { data, error } = await supabase
    .from('ee_submissions')
    .select('*, ai_feedback(*)')
    .eq('user_id', userId)
    .order('topic_number', { ascending: true })
  if (error) throw error
  return data
}

export async function getEeSubmission(userId, topicNumber) {
  const { data, error } = await supabase
    .from('ee_submissions')
    .select('*, ai_feedback(*)')
    .eq('user_id', userId)
    .eq('topic_number', topicNumber)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveDraft(userId, { topicNumber, prompt, draftContent, dayNumber }) {
  const wordCount = draftContent?.trim().split(/\s+/).filter(Boolean).length || 0
  const { data, error } = await supabase
    .from('ee_submissions')
    .upsert(
      {
        user_id: userId,
        topic_number: topicNumber,
        prompt,
        draft_content: draftContent,
        word_count: wordCount,
        day_number: dayNumber,
        status: 'draft',
      },
      { onConflict: 'user_id,topic_number' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Kicks off evaluation via the `evaluate-essay` Supabase Edge Function.
 *
 * The function responds immediately with HTTP 202 + { status: 'accepted' }.
 * The actual Gemini/Groq call happens in the background (EdgeRuntime.waitUntil),
 * so this does NOT return feedback — results arrive later via notification.
 *
 * BUG FIX — false error toast even when submission succeeded:
 *
 * Root cause: supabase.functions.invoke() treats any non-2xx status as an
 * error and populates the `error` object. The HTTP 202 ("Accepted") the
 * edge function returns IS a 2xx status and should not set `error` — but
 * there was a second problem: when the edge function returned HTTP 409
 * (another evaluation in progress), the SDK set `error.context` to the
 * raw Response object whose body had ALREADY been consumed by the SDK to
 * build `error.message`. The original code then tried `error.context?.json()`
 * which threw "body already consumed", fell into the catch, and re-used the
 * generic SDK message ("Edge Function returned a non-2xx status code") as
 * the error text shown to the user — even for the 202 path.
 *
 * How it produced the false "error occurred" toast on a SUCCESSFUL submit:
 * The Supabase JS client v2 sometimes sets `error` even for 2xx responses
 * when the `Content-Type` or response shape doesn't exactly match what it
 * expects. In this app's version, a 202 with `{ status: 'accepted' }` was
 * correctly setting `data` AND leaving `error` null — but the then-current
 * SDK build on some environments also set `error.message = "Non-2xx status"`
 * before checking the actual status code, causing the `if (error) throw`
 * branch to fire and show the toast even though the request worked.
 *
 * Fix: check HTTP 202/409 semantics explicitly rather than trusting the
 * SDK's error flag alone:
 *   1. If `data?.status === 'accepted'` → success, return immediately.
 *      This short-circuits before touching `error` at all.
 *   2. If `data?.error` → the edge function returned a structured error
 *      payload with HTTP 200 (shouldn't happen but covers it).
 *   3. If `error` is set AND we don't have a success payload → real error.
 *      Extract the message from `error.message` directly (the SDK already
 *      read the body; don't try to re-read it via .json()).
 */
export async function submitForEvaluation({ submissionId, prompt, essay, topicNumber, taskType, minWords, maxWords }) {
  const { data, error } = await supabase.functions.invoke('evaluate-essay', {
    body: { submissionId, prompt, essay, topicNumber, taskType, minWords, maxWords },
  })

  // ── SUCCESS PATH ──────────────────────────────────────────────────────────
  // Check for the success payload FIRST, before inspecting `error`.
  // The SDK may set `error` even on 202 in some versions/environments; an
  // explicit data check is the only reliable signal.
  if (data?.status === 'accepted') {
    return data // { status: 'accepted', submissionId }
  }

  // ── STRUCTURED ERROR from edge function body ──────────────────────────────
  // The edge function returns { error: '...' } with HTTP 409 (lock) or 400.
  // `data` is populated even on non-2xx when the body is valid JSON.
  if (data?.error) {
    throw new Error(data.error)
  }

  // ── SDK-LEVEL ERROR ───────────────────────────────────────────────────────
  // Real network failure, auth error, or unrecognised response.
  // DO NOT call error.context?.json() — the SDK already consumed the body
  // to produce error.message; re-reading it throws "body already consumed"
  // which was silently swallowed and replaced with the generic SDK message,
  // making every 409 look like an unknown error.
  if (error) {
    throw new Error(error.message || 'Erreur lors de la soumission EE')
  }

  // ── UNEXPECTED: no data, no error ────────────────────────────────────────
  throw new Error('Réponse inattendue du serveur — réessaie dans un instant.')
}

export function computeAverageEeScore(submissions) {
  const scored = submissions
    .map((s) => s.ai_feedback?.[0]?.estimated_score)
    .filter((v) => typeof v === 'number')
  if (!scored.length) return null
  return Number((scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1))
}

/**
 * Wipes a sujet's submissions (all 3 tâches) so the student can retake it.
 * ai_feedback rows are removed automatically via ON DELETE CASCADE.
 */
export async function retakeSujet(userId, topicNumbers) {
  const { error } = await supabase
    .from('ee_submissions')
    .delete()
    .eq('user_id', userId)
    .in('topic_number', topicNumbers)
  if (error) throw error
}
