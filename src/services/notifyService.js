import { supabase } from '../lib/supabaseClient'

// Notifies the admin of a new signup via the notify-signup Supabase Edge
// Function (which sends the email server-side through Resend). This never
// blocks signup — a failure here is logged but swallowed.
export async function notifyAdminNewSignup({ fullName, email }) {
  try {
    const { data, error } = await supabase.functions.invoke('notify-signup', {
      body: { fullName, email },
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    console.log('[notifyAdminNewSignup] sent', data)
  } catch (err) {
    console.error('[notifyAdminNewSignup] failed', err)
  }
}
