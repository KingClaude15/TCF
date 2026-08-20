// Supabase Edge Function: ai-tutor-chat
// Deploy: supabase functions deploy ai-tutor-chat
//
// Secrets:
//   GROQ_API_KEY   (primary)
//   GEMINI_API_KEY (optional fallback)
//
// Tries several current model IDs so a free-tier or renamed model
// does not break the chat.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Tu es un tuteur expert du TCF Canada (Test de Connaissance du Français).
Tu aides les candidats à préparer les épreuves CO, CE, EE et EO.
Réponds toujours en français, de façon claire, structurée et pédagogique.

FORMATAGE (important pour l'affichage) :
- Utilise le markdown simple : **gras**, listes à puces (- ), listes numérotées (1. ), titres courts (## ).
- Pour un plan d'action, préfère des listes numérotées ou des puces, PAS des tableaux avec des |.
- Si tu utilises un tableau, garde-le court (3 colonnes max) et bien formé.
- Aère le texte avec des sauts de ligne entre les sections.
- Donne des exemples concrets et des tips méthodologiques.

Si on te demande d'évaluer un texte, donne un niveau CECR estimé et des axes d'amélioration.
Reste concis mais complet (150-350 mots max sauf si l'utilisateur demande plus de détails).
N'invente pas de faits. Si tu n'es pas sûr, dis-le clairement.`

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Tried in order — first that works wins
const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-20b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama3-8b-8192',
]

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

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
          'Aucun fournisseur IA configuré. Définis GROQ_API_KEY (ou GEMINI_API_KEY) dans Supabase Secrets, puis redéploie.',
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

    // ── 1. Groq — try several models ───────────────────────────────────────
    if (groqKey) {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: 'user', content: message.trim() },
      ]

      for (const model of GROQ_MODELS) {
        if (reply) break
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 40000)

          const res = await fetch(GROQ_CHAT_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
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
              if (reply) {
                console.log('[ai-tutor-chat] Groq OK with model', model)
              } else {
                errors.push(`Groq ${model}: empty content`)
              }
            } catch {
              errors.push(`Groq ${model}: invalid JSON`)
            }
          } else {
            let detail = text.slice(0, 200)
            try {
              const j = JSON.parse(text)
              detail = j?.error?.message || detail
            } catch { /* keep */ }
            errors.push(`Groq ${model}: ${res.status} ${detail}`)
            // 404 model → try next; 401/403 key → stop Groq loop
            if (res.status === 401 || res.status === 403) break
          }
        } catch (err) {
          const msg = (err as Error).name === 'AbortError' ? 'timeout' : ((err as Error).message || String(err))
          errors.push(`Groq ${model}: ${msg}`)
        }
      }
    }

    // ── 2. Gemini fallback ─────────────────────────────────────────────────
    if (!reply && geminiKey) {
      const contents = [
        ...safeHistory.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: message.trim() }] },
      ]

      for (const model of GEMINI_MODELS) {
        if (reply) break
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 40000)
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`

          const res = await fetch(url, {
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
              if (reply) {
                console.log('[ai-tutor-chat] Gemini OK with model', model)
              } else {
                errors.push(`Gemini ${model}: empty content`)
              }
            } catch {
              errors.push(`Gemini ${model}: invalid JSON`)
            }
          } else {
            let detail = text.slice(0, 200)
            try {
              const j = JSON.parse(text)
              detail = j?.error?.message || detail
            } catch { /* keep */ }
            errors.push(`Gemini ${model}: ${res.status} ${detail}`)
            if (res.status === 400 && /API key/i.test(detail)) break
          }
        } catch (err) {
          const msg = (err as Error).name === 'AbortError' ? 'timeout' : ((err as Error).message || String(err))
          errors.push(`Gemini ${model}: ${msg}`)
        }
      }
    }

    if (!reply) {
      return jsonResponse({
        error:
          'Le tuteur IA n’a pas pu répondre avec les modèles disponibles. Détail : ' +
          errors.slice(0, 5).join(' | ').slice(0, 500),
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
