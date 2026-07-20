import { supabase } from '../lib/supabaseClient'

const BUCKET = 'eo-recordings'

export async function listEoSubmissions(userId) {
  const { data, error } = await supabase
    .from('eo_submissions')
    .select('*, eo_feedback(*)')
    .eq('user_id', userId)
    .order('topic_number', { ascending: true })
  if (error) throw error
  return data
}

export async function getEoSubmission(userId, topicNumber) {
  const { data, error } = await supabase
    .from('eo_submissions')
    .select('*, eo_feedback(*)')
    .eq('user_id', userId)
    .eq('topic_number', topicNumber)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Uploads the recorded answer (a Blob from MediaRecorder) to private storage. */
async function uploadRecording(userId, topicNumber, blob) {
  const path = `${userId}/${topicNumber}-${Date.now()}.webm`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'audio/webm',
    upsert: true,
  })
  if (error) throw error
  return path
}

/**
 * Uploads a recording immediately after the student stops recording, as a
 * 'draft' — before final submission/evaluation. This is what makes a
 * recording survive a page refresh or switching tasks: the audio itself
 * lives in Storage from the moment it's recorded, not just in memory.
 */
export async function saveDraftRecording({ userId, topicNumber, prompt, dayNumber, audioBlob, durationSeconds }) {
  const audioPath = await uploadRecording(userId, topicNumber, audioBlob)
  const { data, error } = await supabase
    .from('eo_submissions')
    .upsert(
      {
        user_id: userId,
        topic_number: topicNumber,
        prompt,
        audio_path: audioPath,
        duration_seconds: durationSeconds,
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
 * Uploads the recording and kicks off evaluation via the `evaluate-eo`
 * Edge Function, which responds almost immediately with
 * { status: 'accepted' } — the actual transcription + scoring happens in
 * the background. See submitForEvaluation in eeService.js for the same
 * pattern and why it changed.
 */
export async function submitRecording({
  userId,
  topicNumber,
  prompt,
  taskType,
  dayNumber,
  audioBlob,
  durationSeconds,
  existingAudioPath,
}) {
  const audioPath = existingAudioPath || (await uploadRecording(userId, topicNumber, audioBlob))

  const { data: submission, error: upsertError } = await supabase
    .from('eo_submissions')
    .upsert(
      {
        user_id: userId,
        topic_number: topicNumber,
        prompt,
        audio_path: audioPath,
        duration_seconds: durationSeconds,
        day_number: dayNumber,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_number' }
    )
    .select()
    .single()
  if (upsertError) throw upsertError

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(audioPath, 60 * 10) // 10 minutes — plenty for the edge function to fetch it
  if (signError) throw signError

  const { data, error } = await supabase.functions.invoke('evaluate-eo', {
    body: {
      submissionId: submission.id,
      audioUrl: signed.signedUrl,
      prompt,
      topicNumber,
      taskType,
    },
  })
  if (error) {
    let message = error.message
    try {
      const body = await error.context?.json()
      if (body?.error) message = body.error
    } catch {
      // response wasn't JSON — fall back to the generic error message
    }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data // { status: 'accepted', submissionId }
}

export function computeAverageEoScore(submissions) {
  const scored = submissions
    .map((s) => s.eo_feedback?.[0]?.estimated_score)
    .filter((v) => typeof v === 'number')
  if (!scored.length) return null
  return Number((scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(1))
}

/** Wipes a sujet's submissions (all 3 tâches) so the student can retake it. */
export async function retakeEoSujet(userId, topicNumbers) {
  const { error } = await supabase
    .from('eo_submissions')
    .delete()
    .eq('user_id', userId)
    .in('topic_number', topicNumbers)
  if (error) throw error
}
