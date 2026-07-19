// Supabase Edge Function: evaluate-eo
// Deploy: supabase functions deploy evaluate-eo
// Secret:  supabase secrets set GEMINI_API_KEY=...   (same key as evaluate-essay)
//
// Fetches the student's recorded audio from private storage (via a
// short-lived signed URL created by the client), sends it directly to
// Gemini (native audio understanding — no separate transcription step),
// and asks for both a transcript and a full CECR-aligned evaluation.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TASK_RULES: Record<number, string> = {
  1: `TÂCHE 1 — Entretien / présentation informelle (réponse courte, ~30-60 secondes attendues).
Le candidat doit se présenter ou répondre à une question simple avec des phrases complètes, un ton naturel et une prononciation compréhensible. À ce niveau, on évalue surtout l'aisance de base, la clarté, et la capacité à parler sans trop d'hésitations sur un sujet familier.`,
  2: `TÂCHE 2 — Récit / description (~1-2 minutes attendues).
Le candidat doit raconter une expérience ou décrire une situation de façon organisée (introduction, déroulement chronologique ou logique, conclusion), avec des connecteurs (d'abord, ensuite, enfin) et suffisamment de détails concrets. Le débit doit rester fluide, sans blancs prolongés.`,
  3: `TÂCHE 3 — Prise de position / débat (~2-3 minutes attendues).
Le candidat doit réagir à deux points de vue opposés puis défendre une position personnelle claire, avec au moins un argument développé (affirmation + explication + exemple) et une structure audible (introduction, développement, conclusion). C'est la tâche la plus exigeante : vérifier la précision du vocabulaire abstrait/argumentatif et la fluidité sur une durée plus longue.`,
}

// Official EE/EO (/20 scale) → CECR level — see evaluate-essay/index.ts for sourcing notes.
function eeEoScoreToCecr(score: number): string {
  if (score >= 18) return 'C2'
  if (score >= 14) return 'C1'
  if (score >= 10) return 'B2'
  if (score >= 6) return 'B1'
  if (score >= 2) return 'A2'
  if (score >= 1) return 'A1'
  return 'A1 non atteint'
}

function buildSystemPrompt(taskType: number, maxSeconds: number) {
  const taskRule = TASK_RULES[taskType] || TASK_RULES[1]
  return `Tu es un examinateur CERTIFIÉ du TCF Canada, expert en évaluation d'Expression Orale (EO) selon le CECRL (A1 à C2) et le barème officiel de France Éducation International.

CONSIGNE DE SÉVÉRITÉ : Note avec autant de rigueur qu'un examinateur réel. Une réponse "sympathique à écouter" mais pleine d'hésitations, d'erreurs grammaticales à l'oral ou hors-sujet ne doit PAS recevoir un score généreux.

${taskRule}

Durée maximale attendue pour cette tâche : environ ${maxSeconds} secondes. Une réponse beaucoup trop courte (silence, quelques mots seulement) doit être sévèrement pénalisée dans task_achievement_feedback.

Écoute l'audio fourni et évalue-le selon ces critères CECRL (pour estimated_score /20) :
1. Adéquation au sujet et à la consigne
2. Aisance et fluidité (débit, hésitations, pauses, reprises)
3. Prononciation et intelligibilité (dans la mesure où l'audio le permet d'évaluer)
4. Étendue et précision du vocabulaire
5. Correction grammaticale à l'oral (conjugaison, accords, syntaxe)
6. Cohérence et organisation du discours (connecteurs, structure logique)

Retourne UNIQUEMENT un objet JSON valide (aucun texte avant/après, aucun markdown) avec exactement cette forme :

{
  "transcript": "transcription complète et fidèle de ce que dit le candidat",
  "cefr_level": "B2",
  "estimated_score": 14.5,
  "fluency_feedback": "string détaillé en français sur le débit, les hésitations, les pauses",
  "pronunciation_feedback": "string détaillé en français sur la prononciation et l'intelligibilité",
  "grammar_feedback": "string détaillé en français",
  "vocabulary_feedback": "string détaillé en français",
  "coherence_feedback": "string détaillé en français sur la structure et la logique du discours",
  "recommendations": "conseils personnalisés, concrets et actionnables en français pour progresser vers le niveau supérieur"
}

estimated_score est sur 20, aligné sur le barème officiel TCF Canada EO. Sois précis, technique, et exigeant — pas complaisant. Si l'audio est vide, inaudible, ou ne contient aucune réponse pertinente au sujet, mets estimated_score à 0 et explique pourquoi dans task_achievement equivalent (utilise coherence_feedback pour ce cas).`
}

serve(async (req) => {
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
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) throw new Error(`Unauthorized: ${userErr?.message ?? 'no user'}`)
    console.log('evaluate-eo: authenticated user', user.id)

    const { submissionId, audioUrl, prompt, topicNumber, taskType = 1, maxSeconds = 120 } = await req.json()
    if (!audioUrl) throw new Error('Missing audioUrl')

    // Fetch the recording ourselves and inline it as base64 — simpler and
    // more reliable than Gemini's separate File API for short clips.
    const audioRes = await fetch(audioUrl)
    if (!audioRes.ok) throw new Error(`Could not fetch audio recording (status ${audioRes.status})`)
    const audioBuffer = await audioRes.arrayBuffer()
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
    const mimeType = audioRes.headers.get('content-type') || 'audio/webm'

    console.log('evaluate-eo: audio fetched, bytes=', audioBuffer.byteLength, 'taskType=', taskType)

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error('GEMINI_API_KEY secret is not set on this Edge Function')

    const systemPrompt = buildSystemPrompt(Number(taskType), Number(maxSeconds))

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: 'user',
              parts: [
                { text: `Sujet EO #${topicNumber} :\n"""${prompt}"""\n\nVoici l'enregistrement audio du candidat à transcrire et évaluer :` },
                { inline_data: { mime_type: mimeType, data: audioBase64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    console.log('evaluate-eo: Gemini responded with status', geminiRes.status)

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini API error: ${errText}`)
    }

    const completion = await geminiRes.json()
    const rawText = completion.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) throw new Error('Gemini returned no content: ' + JSON.stringify(completion))
    const parsed = JSON.parse(rawText)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: feedback, error: insertErr } = await admin
      .from('eo_feedback')
      .insert({
        submission_id: submissionId,
        transcript: parsed.transcript,
        cefr_level: eeEoScoreToCecr(Number(parsed.estimated_score)),
        estimated_score: parsed.estimated_score,
        fluency_feedback: parsed.fluency_feedback,
        pronunciation_feedback: parsed.pronunciation_feedback,
        grammar_feedback: parsed.grammar_feedback,
        vocabulary_feedback: parsed.vocabulary_feedback,
        coherence_feedback: parsed.coherence_feedback,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    await admin
      .from('eo_submissions')
      .update({ status: 'evaluated' })
      .eq('id', submissionId)

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('evaluate-eo error:', err.message, err.stack)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
