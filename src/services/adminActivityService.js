import { supabase } from '../lib/supabaseClient'
import { listAllUsers } from './adminService'

/**
 * Merges co_results + ce_results + ee_submissions (with ai_feedback) across
 * ALL users into one flat, sortable activity feed for the admin panel.
 *
 * Note on the join: co_results/ce_results/ee_submissions reference
 * auth.users(id), not public.profiles(id) directly, so PostgREST can't
 * auto-embed profile names via `.select('*, profiles(...)')` here. Instead
 * we fetch the user list once (already available via the admin-users Edge
 * Function) and merge by user_id client-side — simpler than adding a new
 * FK/migration just for this, and just as fast at this data scale.
 */
export async function listAllActivity() {
  const [users, coRes, ceRes, eeRes] = await Promise.all([
    listAllUsers(),
    supabase.from('co_results').select('*').order('created_at', { ascending: false }),
    supabase.from('ce_results').select('*').order('created_at', { ascending: false }),
    supabase.from('ee_submissions').select('*, ai_feedback(*)').order('created_at', { ascending: false }),
  ])
  if (coRes.error) throw coRes.error
  if (ceRes.error) throw ceRes.error
  if (eeRes.error) throw eeRes.error

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const coActivity = coRes.data.map((r) => ({
    id: `co-${r.id}`,
    userId: r.user_id,
    user: userMap[r.user_id],
    module: 'CO',
    label: `Série ${r.series_number}`,
    dayNumber: r.day_number,
    score: Number(r.score),
    maxScore: Number(r.max_score),
    scoreLabel: `${r.score}/${r.max_score}`,
    difficulty: r.difficulty,
    date: r.created_at,
  }))

  const ceActivity = ceRes.data.map((r) => ({
    id: `ce-${r.id}`,
    userId: r.user_id,
    user: userMap[r.user_id],
    module: 'CE',
    label: `Série ${r.series_number}`,
    dayNumber: r.day_number,
    score: Number(r.score),
    maxScore: Number(r.max_score),
    scoreLabel: `${r.score}/${r.max_score}`,
    difficulty: r.difficulty,
    date: r.created_at,
  }))

  const eeActivity = eeRes.data
    .filter((s) => s.ai_feedback?.[0])
    .map((s) => {
      const fb = s.ai_feedback[0]
      return {
        id: `ee-${s.id}`,
        userId: s.user_id,
        user: userMap[s.user_id],
        module: 'EE',
        label: `Sujet ${Math.floor(s.topic_number / 10)} — tâche ${s.topic_number % 10}`,
        dayNumber: s.day_number,
        score: Number(fb.estimated_score),
        maxScore: 20,
        scoreLabel: `${fb.estimated_score}/20 (${fb.cefr_level ?? '—'})`,
        difficulty: null,
        date: s.submitted_at || fb.created_at,
      }
    })

  return [...coActivity, ...ceActivity, ...eeActivity].sort((a, b) => new Date(b.date) - new Date(a.date))
}
