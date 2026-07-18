import { supabase } from '../lib/supabaseClient'

export async function listEarnedAchievements(userId) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*, achievement_catalog(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listCatalog() {
  const { data, error } = await supabase.from('achievement_catalog').select('*')
  if (error) throw error
  return data
}

async function award(userId, code) {
  // Ignores conflict if already earned (unique constraint on user_id, code)
  const { error } = await supabase.from('achievements').upsert(
    { user_id: userId, code },
    { onConflict: 'user_id,code', ignoreDuplicates: true }
  )
  if (error && error.code !== '23505') throw error
}

/**
 * Evaluate all achievement rules against fresh data and award any newly
 * unlocked badges. Safe to call after every meaningful mutation.
 */
export async function evaluateAchievements(userId, { profile, coResults, ceResults, progressRows }) {
  const newlyAwarded = []

  const streakMilestones = [
    [7, 'streak_7'],
    [14, 'streak_14'],
    [21, 'streak_21'],
  ]
  for (const [days, code] of streakMilestones) {
    if (profile.current_streak >= days || profile.longest_streak >= days) {
      await award(userId, code)
      newlyAwarded.push(code)
    }
  }

  if (progressRows.every((r) => r.is_complete)) {
    await award(userId, 'challenge_complete')
    newlyAwarded.push('challenge_complete')
  }

  if (coResults.some((r) => Number(r.score) >= Number(r.max_score || 39))) {
    await award(userId, 'co_perfect')
    newlyAwarded.push('co_perfect')
  }

  if (ceResults.some((r) => Number(r.score) >= Number(r.max_score || 39))) {
    await award(userId, 'ce_perfect')
    newlyAwarded.push('ce_perfect')
  }

  return newlyAwarded
}
