import { supabase } from '../lib/supabaseClient'

const TABLE = 'ce_results'

export async function listCeResults(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('series_number', { ascending: true })
  if (error) throw error
  return data
}

export async function upsertCeResult(userId, payload) {
  // payload: { series_number, score, max_score, time_taken_seconds, difficulty, notes, day_number }
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id,series_number' })
    .select()
    .single()
  if (error) throw error
  return data
}

export function computeAverage(results) {
  if (!results?.length) return null
  const total = results.reduce((sum, r) => sum + Number(r.score), 0)
  return Number((total / results.length).toFixed(1))
}

export function identifyWeakAreas(results, { threshold = 0.6 } = {}) {
  // Flags series where score/max_score is below threshold
  return results
    .filter((r) => Number(r.score) / Number(r.max_score || 39) < threshold)
    .sort((a, b) => Number(a.score) - Number(b.score))
}
