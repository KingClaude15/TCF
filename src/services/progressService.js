import { supabase } from '../lib/supabaseClient'

export async function getAllDailyProgress(userId) {
  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .order('day_number', { ascending: true })
  if (error) throw error
  return data
}

export async function getDayProgress(userId, dayNumber) {
  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('day_number', dayNumber)
    .single()
  if (error) throw error
  return data
}

/**
 * The day new work should be attributed to: the first not-yet-complete day,
 * or the last day (41) once everything is done. This is computed fresh from
 * `daily_progress` every time rather than trusting a cached column, so it
 * can never drift out of sync with what's actually been completed — it's
 * always exactly "wherever the student really is."
 */
export function computeActiveDay(progressRows) {
  if (!progressRows?.length) return 1
  const next = progressRows.find((r) => !r.is_complete)
  return next ? next.day_number : progressRows[progressRows.length - 1].day_number
}

/** Lightweight fetch+compute for pages that don't already have progressRows loaded (quiz-taking flows). */
export async function getActiveDay(userId) {
  const rows = await getAllDailyProgress(userId)
  return computeActiveDay(rows)
}

export async function markDayModule(userId, dayNumber, moduleKey) {
  // moduleKey is one of 'co_done' | 'ce_done' | 'ee_done' | 'eo_done'
  const patch = { [moduleKey]: true }
  const { data, error } = await supabase
    .from('daily_progress')
    .update(patch)
    .eq('user_id', userId)
    .eq('day_number', dayNumber)
    .select()
    .single()
  if (error) throw error

  if (data.is_complete && !data.completed_at) {
    await supabase
      .from('daily_progress')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', data.id)
  }

  // Auto-advance: once this day's CO+CE+EE are all done, push the cached
  // `profiles.current_day` forward so Dashboard/Profile/Admin displays stay
  // in sync too. The `.lt` guard means this can only ever move forward —
  // it never regresses current_day if it's already ahead (e.g. the student
  // is catching up on a previously-skipped earlier day).
  if (data.is_complete) {
    const nextDay = Math.min(41, dayNumber + 1)
    await supabase.from('profiles').update({ current_day: nextDay }).eq('id', userId).lt('current_day', nextDay)
  }

  return data
}

export function computeOverallCompletion(progressRows) {
  if (!progressRows?.length) return 0
  const done = progressRows.filter((r) => r.is_complete).length
  return Math.round((done / progressRows.length) * 100)
}
