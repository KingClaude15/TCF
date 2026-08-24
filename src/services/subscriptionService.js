import { supabase } from '../lib/supabaseClient'

/** Free EE evaluations (submitted/evaluated, not pure drafts) before paywall */
export const FREE_EE_LIMIT = 5

/** Default weekly plan */
export const WEEKLY_PLAN = {
  id: 'weekly',
  name: 'Accès semaine',
  amount: 2500,
  currency: 'XAF',
  durationDays: 7,
  label: '2 500 FCFA / 7 jours',
}

/** Payment instructions — change numbers to your real MoMo / Orange lines */
export const PAYMENT_INFO = {
  mtn: {
    label: 'MTN Mobile Money',
    number: '6XX XX XX XX', // ← replace with your number
    name: 'TCF Challenge',
  },
  orange: {
    label: 'Orange Money',
    number: '6XX XX XX XX', // ← replace with your number
    name: 'TCF Challenge',
  },
}

/**
 * Count EE submissions that consumed a free slot (submitted or evaluated).
 */
export async function countUsedEeEvaluations(userId) {
  const { count, error } = await supabase
    .from('ee_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['submitted', 'evaluating', 'evaluated', 'error'])

  if (error) throw error
  return count ?? 0
}

/**
 * True if user may submit another EE for AI correction.
 */
export function hasActiveSubscription(profile) {
  if (!profile) return false
  if (profile.role === 'admin' || profile.role === 'super_admin') return true
  if (profile.subscription_status === 'active' && profile.paid_until) {
    return new Date(profile.paid_until) > new Date()
  }
  return false
}

export async function getEeAccessState(userId, profile) {
  if (hasActiveSubscription(profile)) {
    return {
      allowed: true,
      reason: 'subscribed',
      used: 0,
      limit: FREE_EE_LIMIT,
      remaining: null,
      paidUntil: profile.paid_until,
    }
  }

  const used = await countUsedEeEvaluations(userId)
  const remaining = Math.max(0, FREE_EE_LIMIT - used)
  return {
    allowed: remaining > 0,
    reason: remaining > 0 ? 'free_quota' : 'quota_exhausted',
    used,
    limit: FREE_EE_LIMIT,
    remaining,
    paidUntil: profile?.paid_until || null,
  }
}

export async function createPaymentRequest(userId, { operator, referenceCode }) {
  const { data, error } = await supabase
    .from('payment_requests')
    .insert({
      user_id: userId,
      amount: WEEKLY_PLAN.amount,
      currency: WEEKLY_PLAN.currency,
      plan: WEEKLY_PLAN.id,
      duration_days: WEEKLY_PLAN.durationDays,
      operator: operator || 'other',
      reference_code: referenceCode || null,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) throw error

  // Mark profile as pending payment (does not unlock yet)
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'pending',
      payment_note: referenceCode || null,
    })
    .eq('id', userId)

  return data
}

export async function listMyPaymentRequests(userId) {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function listPendingPayments() {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function listAllPayments() {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data || []
}

/**
 * Admin: approve payment → extend paid_until by duration_days from now (or from current paid_until if still active).
 */
export async function approvePayment(requestId, adminUserId) {
  const { data: req, error: fetchErr } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  if (fetchErr) throw fetchErr
  if (req.status !== 'pending') throw new Error('Cette demande n’est plus en attente.')

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, paid_until, subscription_status')
    .eq('id', req.user_id)
    .single()
  if (pErr) throw pErr

  const now = new Date()
  const base =
    profile.paid_until && new Date(profile.paid_until) > now
      ? new Date(profile.paid_until)
      : now
  const paidUntil = new Date(base.getTime() + (req.duration_days || 7) * 24 * 60 * 60 * 1000)

  const { error: upReq } = await supabase
    .from('payment_requests')
    .update({
      status: 'approved',
      reviewed_by: adminUserId,
      reviewed_at: now.toISOString(),
    })
    .eq('id', requestId)
  if (upReq) throw upReq

  const { error: upProf } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      paid_until: paidUntil.toISOString(),
    })
    .eq('id', req.user_id)
  if (upProf) throw upProf

  return { paidUntil: paidUntil.toISOString() }
}

export async function rejectPayment(requestId, adminUserId, adminNote) {
  const { data: req, error: fetchErr } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  if (fetchErr) throw fetchErr

  const { error: upReq } = await supabase
    .from('payment_requests')
    .update({
      status: 'rejected',
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      admin_note: adminNote || null,
    })
    .eq('id', requestId)
  if (upReq) throw upReq

  // If no other active period, set back to free/expired
  const { data: profile } = await supabase
    .from('profiles')
    .select('paid_until')
    .eq('id', req.user_id)
    .single()

  const stillActive = profile?.paid_until && new Date(profile.paid_until) > new Date()
  await supabase
    .from('profiles')
    .update({
      subscription_status: stillActive ? 'active' : 'free',
    })
    .eq('id', req.user_id)

  return true
}
