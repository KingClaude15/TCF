// Supabase Edge Function: evaluate-eo
// Deploy: supabase functions deploy evaluate-essay evaluate-eo  (both — they
// share supabase/functions/_shared/evalHelpers.ts)
// Secrets: supabase secrets set GROQ_API_KEY=...    (free, no card — console.groq.com/keys)
//          supabase secrets set GEMINI_API_KEY=...  (free — aistudio.google.com)
//
// PIPELINE: transcription and grading are two separate steps here, not one
// multimodal call — this is more reliable, not just cheaper:
//   1. Transcribe with Groq Whisper (whisper-large-v3, French pinned) —
//      fast, purpose-built, and a 2,000/day free quota independent of
//      anything text-related.
//   2. Grade the resulting TEXT transcript via gradeTextWithFallback
//      (Groq llama-3.3-70b-versatile first, Gemini text-only fallback).
// If Whisper itself is unreachable (Groq not configured, quota exhausted,
// or erroring), this falls all the way back to the original single-call
// Gemini pipeline that sends audio directly to a multimodal model and
// gets transcript + grading back together — see gradeViaGeminiAudio().
// Either GROQ_API_KEY or GEMINI_API_KEY alone is enough for this function
// to work; having both adds resilience and is the recommended setup.
//
// See evaluate-essay/index.ts for the full architecture note on why this
// responds immediately and evaluates in the background — audio evaluation
// is if anything more likely to be slow, so the same fix matters even more
// here.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { gradeTextWithFallback, transcribeWithGroq, callGeminiWithPolicy, findActiveEvaluation, friendlyEvalErrorMessage } from '../_shared/evalHelpers.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TASK_RULES: Record<number, string> = {
  1: `TÂCHE 1 — Entretien dirigé, SANS préparation (~2 minutes attendues).
Le candidat doit se présenter ou répondre à une question simple avec des phrases complètes, un ton naturel et une prononciation compréhensible. À ce niveau, on évalue surtout l'aisance de base, la clarté, et la capacité à parler sans trop d'hésitations sur un sujet familier.`,
  2: `TÂCHE 2 — Poser des questions pour obtenir des informations, AVEC 2 minutes de préparation avant de parler (~2-3 minutes de parole attendues).
Le candidat a préparé une série de questions sur la situation donnée (ex : louer un appartement, s'inscrire à un cours) et doit maintenant les POSER À VOIX HAUTE de façon hiérarchisée — des questions générales vers les plus précises. Évalue : la pertinence et la précision des questions posées par rapport à la situation, leur nombre (idéalement 8-10+), leur formulation grammaticalement correcte (inversion, est-ce que, intonation interrogative), et une progression logique. Ce n'est PAS un récit ni une réponse à une question — c'est le candidat qui doit interroger. Si le candidat raconte une histoire au lieu de poser des questions, c'est un manquement grave à signaler.`,
  3: `TÂCHE 3 — Expression d'un point de vue sur UN SEUL sujet, SANS préparation (~3-4 minutes attendues).
Le candidat doit réagir immédiatement et spontanément à la question/affirmation donnée, avec une position personnelle claire, structurée (introduction, au moins un argument développé avec explication et exemple, conclusion), et des connecteurs logiques (En effet, De plus, Cependant, En conclusion). Contrairement à l'EE tâche 3, il n'y a PAS deux points de vue opposés à présenter — seulement l'opinion personnelle du candidat sur le sujet posé.`,
}

function eeEoScoreToCecr(score: number): string {
  if (score >= 18) return 'C2'
  if (score >= 14) return 'C1'
  if (score >= 10) return 'B2'
  if (score >= 6) return 'B1'
  if (score >= 2) return 'A2'
  if (score >= 1) return 'A1'
  return 'A1 non atteint'
}

function buildAudioSystemPrompt(taskType: number, maxSeconds: number) {
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

/**
 * Used for the primary pipeline: Groq Whisper has already produced the
 * transcript, so this grades TEXT rather than asking the model to also
 * listen to audio. Deliberately does NOT ask for a "transcript" field back
 * — we already have the real one from Whisper, and asking a text model to
 * faithfully reproduce a whole transcript verbatim is a pointless place
 * for it to introduce errors.
 *
 * IMPORTANT CAVEAT: grading from a transcript alone means pronunciation
 * can only be assessed indirectly (via disfluency markers Whisper may
 * capture, like repeated words or filler sounds transcribed as "euh") —
 * true audio-level pronunciation quality isn't visible to a text-only
 * grader. This is the honest trade-off of the faster/cheaper pipeline;
 * the full-audio Gemini fallback path (used when Whisper itself is
 * unavailable) doesn't have this limitation.
 */
function buildTranscriptSystemPrompt(taskType: number, maxSeconds: number) {
  const taskRule = TASK_RULES[taskType] || TASK_RULES[1]
  return `Tu es un examinateur CERTIFIÉ du TCF Canada, expert en évaluation d'Expression Orale (EO) selon le CECRL (A1 à C2) et le barème officiel de France Éducation International.

CONSIGNE DE SÉVÉRITÉ : Note avec autant de rigueur qu'un examinateur réel. Un discours qui se lit bien une fois transcrit mais qui est plein d'hésitations, d'erreurs grammaticales ou hors-sujet ne doit PAS recevoir un score généreux.

${taskRule}

Durée maximale attendue pour cette tâche : environ ${maxSeconds} secondes. Une réponse transcrite beaucoup trop courte (quelques mots seulement) doit être sévèrement pénalisée dans task_achievement_feedback.

Tu reçois la TRANSCRIPTION TEXTUELLE de la réponse orale du candidat (obtenue par un outil de reconnaissance vocale — les hésitations, répétitions et faux départs éventuels sont conservés dans la transcription et sont des indices utiles sur l'aisance à l'oral). Évalue-la selon ces critères CECRL (pour estimated_score /20) :
1. Adéquation au sujet et à la consigne
2. Aisance et fluidité déductibles de la transcription (hésitations, répétitions, reprises visibles dans le texte)
3. Étendue et précision du vocabulaire
4. Correction grammaticale à l'oral (conjugaison, accords, syntaxe)
5. Cohérence et organisation du discours (connecteurs, structure logique)

Note : tu ne peux pas juger la prononciation directement à partir d'une transcription texte — pour pronunciation_feedback, indique explicitement que ce point n'a pas pu être évalué directement et base-toi uniquement sur les indices indirects disponibles (mots mal reconnus pouvant indiquer une prononciation peu claire, par exemple), sans inventer de jugement que la transcription ne permet pas de fonder.

Retourne UNIQUEMENT un objet JSON valide (aucun texte avant/après, aucun markdown) avec exactement cette forme :

{
  "cefr_level": "B2",
  "estimated_score": 14.5,
  "fluency_feedback": "string détaillé en français sur le débit, les hésitations, les pauses (déduits de la transcription)",
  "pronunciation_feedback": "string en français précisant que l'évaluation se base sur une transcription et non l'audio direct",
  "grammar_feedback": "string détaillé en français",
  "vocabulary_feedback": "string détaillé en français",
  "coherence_feedback": "string détaillé en français sur la structure et la logique du discours",
  "recommendations": "conseils personnalisés, concrets et actionnables en français pour progresser vers le niveau supérieur"
}

estimated_score est sur 20, aligné sur le barème officiel TCF Canada EO. Sois précis, technique, et exigeant — pas complaisant. Si la transcription est vide ou ne contient aucune réponse pertinente au sujet, mets estimated_score à 0 et explique pourquoi dans coherence_feedback.`
}

const AUDIO_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    transcript: { type: 'STRING' },
    cefr_level: { type: 'STRING' },
    estimated_score: { type: 'NUMBER' },
    fluency_feedback: { type: 'STRING' },
    pronunciation_feedback: { type: 'STRING' },
    grammar_feedback: { type: 'STRING' },
    vocabulary_feedback: { type: 'STRING' },
    coherence_feedback: { type: 'STRING' },
    recommendations: { type: 'STRING' },
  },
  required: [
    'transcript', 'cefr_level', 'estimated_score', 'fluency_feedback', 'pronunciation_feedback',
    'grammar_feedback', 'vocabulary_feedback', 'coherence_feedback', 'recommendations',
  ],
}

// No `transcript` field — the Whisper-first pipeline already has the real
// transcript before this grading call ever happens.
const TEXT_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    cefr_level: { type: 'STRING' },
    estimated_score: { type: 'NUMBER' },
    fluency_feedback: { type: 'STRING' },
    pronunciation_feedback: { type: 'STRING' },
    grammar_feedback: { type: 'STRING' },
    vocabulary_feedback: { type: 'STRING' },
    coherence_feedback: { type: 'STRING' },
    recommendations: { type: 'STRING' },
  },
  required: [
    'cefr_level', 'estimated_score', 'fluency_feedback', 'pronunciation_feedback',
    'grammar_feedback', 'vocabulary_feedback', 'coherence_feedback', 'recommendations',
  ],
}

/** Fallback path: send audio directly to Gemini (transcribe + grade in one multimodal call) — used only when Groq Whisper itself couldn't be reached at all. */
async function gradeViaGeminiAudio({ audioBase64, mimeType, systemPrompt, promptText, geminiKey }) {
  const result = await callGeminiWithPolicy(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
    {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }, { inline_data: { mime_type: mimeType, data: audioBase64 } }],
        },
      ],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseSchema: AUDIO_RESPONSE_SCHEMA },
    },
    { timeoutMs: 90000 }
  )
  if (!result.ok) return result
  const rawText = result.json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) return { ok: false, kind: 'other', rawText: 'Gemini returned no content' }
  return { ok: true, provider: 'gemini-audio', parsed: JSON.parse(rawText) }
}

async function runEvaluationInBackground(admin, { submissionId, userId, sujetNumber, audioUrl, prompt, topicNumber, taskType, maxSeconds, groqKey, geminiKey }) {
  const linkPath = `/eo/${sujetNumber}`
  try {
    const audioRes = await fetch(audioUrl)
    if (!audioRes.ok) throw new Error(`Could not fetch audio recording (status ${audioRes.status})`)
    const mimeType = audioRes.headers.get('content-type') || 'audio/webm'
    const audioBlob = await audioRes.blob()

    let result

    // Primary pipeline: transcribe with Groq Whisper, then grade the text
    // (Groq llama first, Gemini text-only as its own fallback — see
    // gradeTextWithFallback). This is two independent quotas away from a
    // single point of failure.
    const transcription = groqKey ? await transcribeWithGroq(groqKey, audioBlob, mimeType) : { ok: false }

    if (transcription.ok) {
      console.log('evaluate-eo: transcribed via Groq Whisper, grading transcript for submission', submissionId)
      const systemPrompt = buildTranscriptSystemPrompt(Number(taskType), Number(maxSeconds))
      const userText = `Sujet EO #${topicNumber} :\n"""${prompt}"""\n\nVoici la transcription de la réponse orale du candidat :\n"""${transcription.transcript}"""`

      const gradingResult = await gradeTextWithFallback({
        systemPrompt,
        userText,
        groqKey,
        geminiKey,
        geminiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
        responseSchema: TEXT_RESPONSE_SCHEMA,
      })

      result = gradingResult.ok
        ? { ok: true, provider: gradingResult.provider, parsed: { ...gradingResult.parsed, transcript: transcription.transcript } }
        : gradingResult
    } else {
      // Whisper itself unreachable/unconfigured — fall all the way back
      // to the original single-call Gemini audio pipeline, which doesn't
      // need Groq at all.
      console.log('evaluate-eo: Groq Whisper unavailable, falling back to full Gemini audio pipeline for submission', submissionId)
      if (!geminiKey) {
        result = { ok: false, kind: 'other', rawText: 'Groq Whisper failed and no GEMINI_API_KEY is configured as fallback.' }
      } else {
        const audioBytes = new Uint8Array(await audioBlob.arrayBuffer())
        let binary = ''
        const CHUNK_SIZE = 8192
        for (let i = 0; i < audioBytes.length; i += CHUNK_SIZE) {
          binary += String.fromCharCode(...audioBytes.subarray(i, i + CHUNK_SIZE))
        }
        const audioBase64 = btoa(binary)
        result = await gradeViaGeminiAudio({
          audioBase64,
          mimeType,
          systemPrompt: buildAudioSystemPrompt(Number(taskType), Number(maxSeconds)),
          promptText: `Sujet EO #${topicNumber} :\n"""${prompt}"""\n\nVoici l'enregistrement audio du candidat à transcrire et évaluer :`,
          geminiKey,
        })
      }
    }

    if (!result.ok) {
      const friendly = friendlyEvalErrorMessage(result.kind, result.rawText)
      console.error('evaluate-eo: all providers failed, kind=', result.kind, result.rawText)
      await admin.from('eo_submissions').update({ status: 'error', error_message: friendly }).eq('id', submissionId)
      await admin.from('notifications').insert({
        user_id: userId, type: 'eval_error', title: `Sujet EO ${sujetNumber} — échec de l'évaluation`, body: friendly, link: linkPath,
      })
      return
    }

    const parsed = result.parsed
    console.log('evaluate-eo: graded via', result.provider, 'for submission', submissionId)

    const { error: insertErr } = await admin.from('eo_feedback').insert({
      submission_id: submissionId,
      transcript: parsed.transcript,
      cefr_level: eeEoScoreToCecr(Number(parsed.estimated_score)),
      estimated_score: parsed.estimated_score,
      fluency_feedback: parsed.fluency_feedback,
      pronunciation_feedback: parsed.pronunciation_feedback,
      grammar_feedback: parsed.grammar_feedback,
      vocabulary_feedback: parsed.vocabulary_feedback,
      coherence_feedback: parsed.coherence_feedback,
      recommendations: parsed.recommendations,
    })
    if (insertErr) throw insertErr

    await admin.from('eo_submissions').update({ status: 'evaluated' }).eq('id', submissionId)

    await admin.from('notifications').insert({
      user_id: userId,
      type: 'eval_success',
      title: `Sujet EO ${sujetNumber} — résultats disponibles`,
      body: `Ta correction est prête : ${parsed.estimated_score}/20 (${eeEoScoreToCecr(Number(parsed.estimated_score))}).`,
      link: linkPath,
    })
  } catch (err) {
    console.error('evaluate-eo background error:', err.message, err.stack)
    const friendly = friendlyEvalErrorMessage('other', err.message)
    await admin.from('eo_submissions').update({ status: 'error', error_message: friendly }).eq('id', submissionId)
    await admin.from('notifications').insert({
      user_id: userId, type: 'eval_error', title: `Sujet EO ${sujetNumber} — échec de l'évaluation`, body: friendly, link: linkPath,
    })
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

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

    const { submissionId, audioUrl, prompt, topicNumber, taskType = 1, maxSeconds = 120 } = await req.json()
    if (!audioUrl) throw new Error('Missing audioUrl')

    const groqKey = Deno.env.get('GROQ_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!groqKey && !geminiKey) {
      throw new Error('No AI provider configured: set GROQ_API_KEY and/or GEMINI_API_KEY as Edge Function secrets')
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const sujetNumber = Math.floor(Number(topicNumber) / 10)

    const active = await findActiveEvaluation(admin, user.id, 'EO', sujetNumber)
    if (active) {
      return new Response(
        JSON.stringify({
          error: `Une correction ${active.kind} est déjà en cours (sujet ${active.sujetNumber}). Attends qu'elle se termine avant d'en soumettre une nouvelle.`,
          lockedSujet: active,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      )
    }

    await admin.from('eo_submissions')
      .update({ status: 'evaluating', evaluation_started_at: new Date().toISOString(), error_message: null })
      .eq('id', submissionId)

    const backgroundTask = runEvaluationInBackground(admin, {
      submissionId, userId: user.id, sujetNumber, audioUrl, prompt, topicNumber, taskType, maxSeconds, groqKey, geminiKey,
    })
    // deno-lint-ignore no-explicit-any
    const runtime = globalThis as any
    if (runtime.EdgeRuntime?.waitUntil) {
      runtime.EdgeRuntime.waitUntil(backgroundTask)
    } else {
      backgroundTask.catch((e) => console.error('background task error (no waitUntil):', e))
    }

    return new Response(JSON.stringify({ status: 'accepted', submissionId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 202,
    })
  } catch (err) {
    console.error('evaluate-eo error:', err.message, err.stack)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
