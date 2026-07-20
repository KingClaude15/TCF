// Supabase Edge Function: delete-account
// Deploy: supabase functions deploy delete-account
//
// Lets an authenticated user permanently delete their OWN account. Deleting
// the auth.users row cascades to every table referencing it (profiles,
// co_results, ce_results, ee_submissions, ai_feedback, eo_submissions,
// eo_feedback, daily_progress, achievements, learning_item_progress — all
// declared `on delete cascade`), so this one call cleans up the database.
// Storage objects (recorded audio) are NOT covered by DB cascades, so we
// best-effort clean those up too before deleting the account.
//
// This function never accepts a target user id from the request body — it
// only ever deletes the account matching the caller's own JWT. There is no
// path for deleting someone else's account here (that's a separate,
// admin-only concern handled by admin-users).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STORAGE_BUCKETS = ['eo-recordings']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error('Unauthorized')

    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    // Best-effort storage cleanup — never block account deletion on this.
    for (const bucket of STORAGE_BUCKETS) {
      try {
        const { data: files } = await admin.storage.from(bucket).list(user.id)
        if (files?.length) {
          const paths = files.map((f) => `${user.id}/${f.name}`)
          await admin.storage.from(bucket).remove(paths)
        }
      } catch (storageErr) {
        console.error('delete-account: storage cleanup failed for bucket', bucket, storageErr.message)
      }
    }

    const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id)
    if (deleteErr) throw deleteErr

    console.log('delete-account: deleted user', user.id)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('delete-account error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
