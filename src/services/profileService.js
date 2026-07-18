import { supabase } from '../lib/supabaseClient'

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Recomputes current_streak / longest_streak / last_active_date based on
 * daily_progress rows and writes the result back onto the profile.
 * Call this after any completion-changing mutation (CO/CE/EE save).
 */
export async function recalculateStreak(userId) {
  const { data: progress, error } = await supabase
    .from('daily_progress')
    .select('day_number, is_complete, completed_at')
    .eq('user_id', userId)
    .order('day_number', { ascending: true })
  if (error) throw error

  const completedDays = progress.filter((p) => p.is_complete)
  let currentStreak = 0
  let longestStreak = 0
  let running = 0
  let prevDay = null

  for (const day of progress) {
    if (day.is_complete) {
      running = prevDay === day.day_number - 1 ? running + 1 : 1
      longestStreak = Math.max(longestStreak, running)
      prevDay = day.day_number
    }
  }

  // current streak = trailing consecutive completed days ending at the
  // highest completed day number
  if (completedDays.length) {
    const sorted = [...completedDays].sort((a, b) => b.day_number - a.day_number)
    currentStreak = 1
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].day_number - sorted[i + 1].day_number === 1) currentStreak++
      else break
    }
  }

  return updateProfile(userId, {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_active_date: new Date().toISOString().slice(0, 10),
  })
}
