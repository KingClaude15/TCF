import { supabase } from '../lib/supabaseClient'

const STALE_MINUTES = 10

/**
 * Returns { kind: 'EE'|'EO', sujetNumber, submissionId, link } if the user
 * has a DIFFERENT evaluation currently in progress (status = 'evaluating',
 * started less than STALE_MINUTES ago), otherwise null. Pass the sujet
 * currently open (excludeKind/excludeSujetNumber) so its own in-flight
 * tasks aren't reported as a lock against themselves.
 *
 * Used to disable "Soumettre le sujet" and show a banner *before* the
 * student wastes a click — the evaluate-essay/evaluate-eo edge functions
 * enforce the same rule server-side with a 409 as the source of truth.
 */
export async function getActiveEvaluation(userId, excludeKind, excludeSujetNumber) {
  const staleBefore = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString()

  const [{ data: eeRows }, { data: eoRows }] = await Promise.all([
    supabase
      .from('ee_submissions')
      .select('id, topic_number, evaluation_started_at')
      .eq('user_id', userId)
      .eq('status', 'evaluating'),
    supabase
      .from('eo_submissions')
      .select('id, topic_number, evaluation_started_at')
      .eq('user_id', userId)
      .eq('status', 'evaluating'),
  ])

  const isFresh = (r) => !r.evaluation_started_at || r.evaluation_started_at >= staleBefore
  const notExcluded = (kind) => (r) => !(kind === excludeKind && Math.floor(r.topic_number / 10) === excludeSujetNumber)

  const activeEe = (eeRows || []).filter(notExcluded('EE')).find(isFresh)
  if (activeEe) {
    const sujetNumber = Math.floor(activeEe.topic_number / 10)
    return { kind: 'EE', sujetNumber, submissionId: activeEe.id, link: `/ee/${sujetNumber}` }
  }

  const activeEo = (eoRows || []).filter(notExcluded('EO')).find(isFresh)
  if (activeEo) {
    const sujetNumber = Math.floor(activeEo.topic_number / 10)
    return { kind: 'EO', sujetNumber, submissionId: activeEo.id, link: `/eo/${sujetNumber}` }
  }

  return null
}
