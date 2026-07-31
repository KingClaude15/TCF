import { supabase } from '../lib/supabaseClient'

/**
 * Returns the caller's own active sessions. Each row's exact shape
 * depends on whatever columns auth.sessions happens to have (see the
 * migration for why) — treat every field except `id`/`created_at` as
 * possibly absent.
 */
export async function listMySessions() {
  const { data, error } = await supabase.rpc('list_my_sessions')
  if (error) throw error
  return data ?? []
}

/** Revokes one specific session by id. No-ops silently if it's already gone or isn't yours. */
export async function revokeSession(sessionId) {
  const { error } = await supabase.rpc('revoke_my_session', { target_session_id: sessionId })
  if (error) throw error
}

/**
 * Signs out every session EXCEPT the one currently in use, via Supabase's
 * own documented `scope: 'others'` — the officially supported mechanism
 * for "log me out everywhere else", rather than looping revokeSession()
 * over every row ourselves.
 */
export async function signOutOtherSessions() {
  const { error } = await supabase.auth.signOut({ scope: 'others' })
  if (error) throw error
}

/**
 * Reads the `session_id` claim out of the current access token so the UI
 * can mark "this device" in the list. This only decodes the token's own
 * already-trusted payload client-side — no verification needed, since
 * it's the browser's own current, already-authenticated session.
 */
export function getCurrentSessionId(accessToken) {
  if (!accessToken) return null
  try {
    const payload = accessToken.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json.session_id ?? null
  } catch {
    return null
  }
}
