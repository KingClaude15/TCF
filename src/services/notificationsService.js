import { supabase } from '../lib/supabaseClient'

export async function listNotifications(userId, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  if (error) throw error
}

/**
 * Subscribes to new notifications for this user in real time (evaluation
 * results/errors land here as soon as the background evaluation finishes,
 * even if the student has navigated away from the sujet they submitted).
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(userId, onInsert) {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
