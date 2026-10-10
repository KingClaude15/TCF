// Supabase Edge Function: eo-interactive-turn
// Deploy: supabase functions deploy eo-interactive-turn
// Secrets: GROQ_API_KEY (primary), GEMINI_API_KEY (fallback)
//
// Role-play for EO Tâche 2 only: AI = interlocuteur answering the candidate's questions.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'llama3-8b-8192',
]
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
]

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function buildSystemPrompt(sujetPrompt: string) {
  return `Tu joues le rôle de l'INTERLOCUTEUR dans un entraînement TCF Canada — Expression Orale, Tâche 2 (poser des questions).

CONSIGNE DU SUJET (situation donnée au candidat) :
---
${sujetPrompt || '(situation non précisée)'}
---

RÈGLES :
1. Tu n'es PAS l'examinateur qui note. Tu es la personne à qui le candidat pose des questions (collègue, responsable, ami, agent, etc. selon la consigne).
2. Réponds UNIQUEMENT en français, à l'oral naturel (phrases courtes, 1 à 3 phrases max).
3. Donne des informations utiles et cohérentes avec la situation, sans tout dévoiler d'un coup — encourage le candidat à poser d'autres questions.
4. Si la question est hors sujet, recentre poliment sur la situation.
5. Si le message du candidat est vide, inaudible ou hors français, demande poliment de reformuler.
6. Ne donne PAS de correction grammaticale pendant le dialogue (sauf si on te le demande explicitement en fin de session).
7. Ne révèle pas que tu es une IA. Reste dans ton personnage.
8. Pas de markdown, pas de listes à puces : texte oral simple pour synthèse vocale.`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let payload: {
      sujetPrompt?: string
      userMessage?: string
      history?: { role: string; content: string }[]
    }
    try {
      payload = await req.json()
    } catch {
      return jsonResponse({ error: 'JSON invalide.' }, 400)
    }

    const userMessage = String(payload?.userMessage || '').trim()
    if (!userMessage) {
      return jsonResponse({ error: 'Message utilisateur manquant.' }, 400)
    }

    const sujetPrompt = String(payload?.sujetPrompt || '').slice(0, 4000)
    const systemPrompt = buildSystemPrompt(sujetPrompt)

    const safeHistory = (Array.isArray(payload?.history) ? payload.history : [])
      .slice(-12)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content).slice(0, 1500),
      }))

    const groqKey = Deno.env.get('GROQ_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!groqKey && !geminiKey) {
      return jsonResponse({
        error: 'Aucun fournisseur IA configuré (GROQ_API_KEY ou GEMINI_API_KEY).',
      }, 503)
    }

    let reply: string | null = null
    const errors: string[] = []

    if (groqKey) {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...safeHistory,
        { role: 'user', content: userMessage },
      ]
      for (const model of GROQ_MODELS) {
        if (reply) break
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 35000)
          const res = await fetch(GROQ_CHAT_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: 0.7,
              max_tokens: 220,
            }),
            signal: controller.signal,
          })
          clearTimeout(timeout)
          if (!res.ok) {
            errors.push(`groq:${model}:${res.status}`)
            continue
          }
          const json = await res.json()
          const text = json?.choices?.[0]?.message?.content
          if (text && String(text).trim()) {
            reply = String(text).trim()
          }
        } catch (e) {
          errors.push(`groq:${model}:${(e as Error).message}`)
        }
      }
    }

    if (!reply && geminiKey) {
      for (const model of GEMINI_MODELS) {
        if (reply) break
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`
          const contents = [
            ...safeHistory.map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            { role: 'user', parts: [{ text: userMessage }] },
          ]
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: { temperature: 0.7, maxOutputTokens: 220 },
            }),
          })
          if (!res.ok) {
            errors.push(`gemini:${model}:${res.status}`)
            continue
          }
          const json = await res.json()
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text && String(text).trim()) {
            reply = String(text).trim()
          }
        } catch (e) {
          errors.push(`gemini:${model}:${(e as Error).message}`)
        }
      }
    }

    if (!reply) {
      return jsonResponse({
        error: 'Impossible de générer une réponse pour le moment. Réessaie.',
        details: errors.slice(0, 5),
      }, 502)
    }

    // Strip markdown-ish for TTS
    reply = reply
      .replace(/\*\*/g, '')
      .replace(/^#+\s*/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .trim()

    return jsonResponse({ reply })
  } catch (e) {
    console.error('eo-interactive-turn', e)
    return jsonResponse({ error: (e as Error).message || 'Erreur serveur' }, 500)
  }
})
