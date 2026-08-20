// Supabase Edge Function: ai-tutor-chat
// Deploy: supabase functions deploy ai-tutor-chat
//
// Secrets (same as evaluate-essay / evaluate-eo):
//   GROQ_API_KEY   (primary)
//   GEMINI_API_KEY (optional fallback)
//
// Returns HTTP 200 with { reply } or { error } so the client always
// receives a readable message (avoids the generic "non-2xx" SDK error).

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

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let payload: { message?: string; history?: unknown[] }
    try {
      payload = await req.json()
    } catch {
      return jsonResponse({ error: 'Corps de requête invalide (JSON attendu).' })
    }

    const message = payload?.message
    const history = payload?.history

    if (!message || typeof message !== 'string' || !message.trim()) {
      return jsonResponse({ error: 'Message manquant.' })
    }

    const groqKey = Deno.env.get('GROQ_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')

    if (!groqKey && !geminiKey) {
      return jsonResponse({
        error:
          'Aucun fournisseur IA configuré. Dans le terminal : supabase secrets set GROQ_API_KEY=gsk_... puis redéploie la fonction.',
      })
    }

    const safeHistory = (Array.isArray(history) ? history : [])
      .slice(-10)
      .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 4000),
      }))

    let reply: string | null = null
    const errors: string[] = []

    // ── 1. Groq (primary) ──────────────────────────────────────────────────
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

        const text = await res.text()
        if (res.ok) {
          try {
            const json = JSON.parse(text)
            reply = json.choices?.[0]?.message?.content?.trim() || null
            if (!reply) errors.push('Groq a répondu sans contenu.')
          } catch {
            errors.push('Réponse Groq illisible.')
          }
        } else {
          // Surface useful Groq errors (invalid key, quota, model…)
          let detail = text.slice(0, 300)
          try {
            const j = JSON.parse(text)
            detail = j?.error?.message || j?.message || detail
          } catch { /* keep raw */ }
          errors.push(`Groq ${res.status}: ${detail}`)
          console.error('[ai-tutor-chat] Groq error', res.status, detail)
        }
      } catch (err) {
        const msg = (err as Error).name === 'AbortError'
          ? 'Groq timeout (45s)'
          : ((err as Error).message || String(err))
        errors.push(msg)
        console.error('[ai-tutor-chat] Groq exception', msg)
      }
    }

    // ── 2. Gemini fallback ─────────────────────────────────────────────────
    if (!reply && geminiKey) {
      try {
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

        const text = await res.text()
        if (res.ok) {
          try {
            const json = JSON.parse(text)
            reply = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
            if (!reply) errors.push('Gemini a répondu sans contenu.')
          } catch {
            errors.push('Réponse Gemini illisible.')
          }
        } else {
          let detail = text.slice(0, 300)
          try {
            const j = JSON.parse(text)
            detail = j?.error?.message || detail
          } catch { /* keep raw */ }
          errors.push(`Gemini ${res.status}: ${detail}`)
          console.error('[ai-tutor-chat] Gemini error', res.status, detail)
        }
      } catch (err) {
        const msg = (err as Error).name === 'AbortError'
          ? 'Gemini timeout (45s)'
          : ((err as Error).message || String(err))
        errors.push(msg)
        console.error('[ai-tutor-chat] Gemini exception', msg)
      }
    }

    if (!reply) {
      // Always HTTP 200 so supabase.functions.invoke puts the body in `data`
      // and the UI can show a precise message instead of "non-2xx".
      const hint = errors.length
        ? errors.join(' | ')
        : 'Aucun fournisseur n’a répondu.'
      return jsonResponse({
        error:
          'Le tuteur IA n’a pas pu répondre. Vérifie que GROQ_API_KEY (ou GEMINI_API_KEY) est bien défini dans Supabase Secrets, puis redéploie. Détail : ' +
          hint.slice(0, 400),
      })
    }

    return jsonResponse({ reply })
  } catch (err) {
    console.error('[ai-tutor-chat] unexpected', err)
    return jsonResponse({
      error: (err as Error).message || 'Erreur serveur inattendue.',
    })
  }
})
