// Supabase Edge Function: admin-users
// Deploy: supabase functions deploy admin-users
//
// Handles privileged user-management actions (list all users, create a
// user manually, approve/suspend, change role, delete). Every action first
// verifies the CALLER is an admin/super_admin by checking their own
// profile row — only then does it use the service-role client to act on
// other users' data, since the anon/RLS client can't do that safely.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser()
    if (callerErr || !caller) throw new Error('Unauthorized')

    const admin = createClient(supabaseUrl, serviceKey)

    const { data: callerProfile, error: profileErr } = await admin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()
    if (profileErr || !callerProfile) throw new Error('Caller profile not found')
    const callerIsAdmin = ['admin', 'super_admin'].includes(callerProfile.role)
    const callerIsSuperAdmin = callerProfile.role === 'super_admin'
    if (!callerIsAdmin) throw new Error('Forbidden: admin access required')

    const { action, ...params } = await req.json()

    if (action === 'list') {
      const { data: profiles, error } = await admin
        .from('profiles')
        .select('id, full_name, email, role, status, current_day, current_streak, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return json({ users: profiles })
    }

    if (action === 'create') {
      const { email, password, fullName, role = 'student' } = params
      if (!email || !password) throw new Error('Email and password are required')
      if (['admin', 'super_admin'].includes(role) && !callerIsSuperAdmin) {
        throw new Error('Only a super_admin can create admin accounts')
      }
      const { data: created, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })
      if (error) throw error
      // The trigger auto-creates the profile as a pending student; if the
      // admin wants a different role or wants it pre-approved, patch it now.
      await admin
        .from('profiles')
        .update({ role, status: 'approved' })
        .eq('id', created.user.id)
      return json({ success: true })
    }

    if (action === 'setStatus') {
      const { userId, status } = params
      if (!['pending', 'approved', 'suspended'].includes(status)) throw new Error('Invalid status')
      const { error } = await admin.from('profiles').update({ status }).eq('id', userId)
      if (error) throw error
      return json({ success: true })
    }

    if (action === 'setRole') {
      const { userId, role } = params
      if (!['student', 'moderator', 'admin', 'super_admin'].includes(role)) throw new Error('Invalid role')
      if (['admin', 'super_admin'].includes(role) && !callerIsSuperAdmin) {
        throw new Error('Only a super_admin can grant admin roles')
      }
      if (userId === caller.id && !callerIsSuperAdmin) {
        throw new Error('You cannot change your own role')
      }
      const { error } = await admin.from('profiles').update({ role }).eq('id', userId)
      if (error) throw error
      return json({ success: true })
    }

    if (action === 'delete') {
      const { userId } = params
      if (userId === caller.id) throw new Error('You cannot delete your own account')
      const { data: target } = await admin.from('profiles').select('role').eq('id', userId).single()
      if (target && ['admin', 'super_admin'].includes(target.role) && !callerIsSuperAdmin) {
        throw new Error('Only a super_admin can delete an admin account')
      }
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) throw error
      return json({ success: true })
    }

    throw new Error(`Unknown action: ${action}`)
  } catch (err) {
    console.error('admin-users error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}
