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
 * Submits the essay to the `evaluate-essay` Supabase Edge Function, which
 * securely calls OpenAI server-side and writes the ai_feedback row.
 */
export async function submitForEvaluation({ submissionId, prompt, essay, topicNumber, taskType, minWords, maxWords }) {
  const { data, error } = await supabase.functions.invoke('evaluate-essay', {
    body: { submissionId, prompt, essay, topicNumber, taskType, minWords, maxWords },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data.feedback
}

export function computeAverageEeScore(submissions) {
  const scored = submissions
    .map((s) => s.ai_feedback?.[0]?.estimated_score)
    .filter((v) => typeof v === 'number')
  if (!scored.length) return null
  return Number((scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1))
}
