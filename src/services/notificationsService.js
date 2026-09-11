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
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
}

/**
 * Subscribes to new notifications for this user in real time.
 * Returns an unsubscribe function.
 *
 * IMPORTANT: each call must use a UNIQUE channel name. Reusing
 * `notifications-${userId}` while NotificationBell is already subscribed
 * causes: "cannot add postgres_changes callbacks after subscribe()".
 */
export function subscribeToNotifications(userId, onInsert) {
  if (!userId) return () => {}

  const channelName = `notifications-${userId}-${Math.random().toString(36).slice(2, 10)}`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        try {
          onInsert(payload.new)
        } catch (err) {
          console.error('notifications onInsert handler error:', err)
        }
      }
    )
    .subscribe()

  return () => {
    try {
      supabase.removeChannel(channel)
    } catch {
      // ignore cleanup races
    }
  }
}
