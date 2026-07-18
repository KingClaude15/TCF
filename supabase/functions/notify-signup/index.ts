// Supabase Edge Function: notify-signup
// Deploy: supabase functions deploy notify-signup
// Secret:  supabase secrets set RESEND_API_KEY=...   (free key from resend.com)
//
// Emails the admin whenever a new account signs up and needs approval.
// Runs server-side, so unlike a client-side call to a third-party form
// service, it can't be silently blocked by the student's browser/ad-blocker.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_NOTIFY_EMAIL = 'fankyjoe216@gmail.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fullName, email } = await req.json()
    if (!email) throw new Error('Missing email')

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY secret is not set on this Edge Function')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // onboarding@resend.dev works out of the box with no domain setup,
        // as long as it only sends TO the email address you signed up with.
        from: 'TCF 41-Day Challenge <onboarding@resend.dev>',
        to: [ADMIN_NOTIFY_EMAIL],
        subject: 'Nouvelle inscription à approuver — TCF 41-Day Challenge',
        html: `
          <p><strong>${fullName || 'Un nouvel utilisateur'}</strong> (${email}) vient de créer un compte
          et attend ton approbation.</p>
          <p>Va dans le panneau admin → Utilisateurs pour l'approuver.</p>
        `,
      }),
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) throw new Error(`Resend API error: ${JSON.stringify(body)}`)

    return new Response(JSON.stringify({ ok: true, id: body?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('notify-signup error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
