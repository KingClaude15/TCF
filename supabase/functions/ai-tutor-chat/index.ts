// Supabase Edge Function: ai-tutor-chat
// Deploy: supabase functions deploy ai-tutor-chat
//
// Uses the SAME secrets as evaluate-essay / evaluate-eo:
//   supabase secrets set GROQ_API_KEY=gsk_...     (primary — free, console.groq.com/keys)
//   supabase secrets set GEMINI_API_KEY=AIza...   (optional fallback — aistudio.google.com)
//
// Either key alone is enough. Having both adds resilience.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Tu es un tuteur expert du TCF Canada (Test de Connaissance du Français).
Tu aides les candidats à préparer les épreuves CO, CE, EE et EO.
Réponds toujours en français, de façon claire, structurée et pédagogique.
Donne des exemples concrets, des corrections, des tips méthodologiques.
Si on te demande d'évaluer un texte, donne un niveau CECR estimé et des axes d'amélioration.
Reste concis mais complet (150-350 mots max sauf si l'utilisateur demande plus de détails).
N'invente pas de faits. Si tu n'es pas sûr, dis-le clairement.`

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message manquant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const groqKey = Deno.env.get('GROQ_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if (!groqKey && !geminiKey) {
      return new Response(
        JSON.stringify({
          error: 'Aucun fournisseur IA configuré. Définis GROQ_API_KEY et/ou GEMINI_API_KEY dans les secrets Supabase.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Build conversation messages (last 10 turns max)
    const safeHistory = (Array.isArray(history) ? history : [])
      .slice(-10)
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 4000),
      }))

    let reply: string | null = null
    let lastError = ''

    // ── 1. Try Groq first ──────────────────────────────────────────────────
    if (groqKey) {
      try {
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...safeHistory,
          { role: 'user', content: message.trim() },
        ]

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 45000)

        const res = await fetch(GROQ_CHAT_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 900,
            messages,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (res.ok) {
          const json = await res.json()
          reply = json.choices?.[0]?.message?.content?.trim() || null
        } else {
          lastError = await res.text()
          console.error('[ai-tutor-chat] Groq error', res.status, lastError)
        }
      } catch (err) {
        lastError = (err as Error).message || String(err)
        console.error('[ai-tutor-chat] Groq exception', lastError)
      }
    }

    // ── 2. Fallback to Gemini if Groq failed or is not configured ──────────
    if (!reply && geminiKey) {
      try {
        // Gemini uses a different message format
        const contents = [
          ...safeHistory.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          { role: 'user', parts: [{ text: message.trim() }] },
        ]

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 45000)

        const res = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 900,
            },
          }),
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (res.ok) {
          const json = await res.json()
          reply = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
        } else {
          lastError = await res.text()
          console.error('[ai-tutor-chat] Gemini error', res.status, lastError)
        }
      } catch (err) {
        lastError = (err as Error).message || String(err)
        console.error('[ai-tutor-chat] Gemini exception', lastError)
      }
    }

    if (!reply) {
      return new Response(
        JSON.stringify({
          error:
            'Le tuteur IA est temporairement indisponible (quota ou surcharge). Réessaie dans quelques minutes.',
          detail: lastError.slice(0, 200),
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[ai-tutor-chat] unexpected', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message || 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
