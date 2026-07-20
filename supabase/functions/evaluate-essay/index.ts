// Supabase Edge Function: evaluate-essay
// Deploy: supabase functions deploy evaluate-essay evaluate-eo  (both — they
// share supabase/functions/_shared/evalHelpers.ts)
// Secret:  supabase secrets set GEMINI_API_KEY=...   (free key from aistudio.google.com)
//
// This function is the ONLY place the Gemini key is used. The React app
// never sees it — it calls this function via supabase.functions.invoke().
//
// ARCHITECTURE NOTE (why this looks different from a typical edge function):
// The whole Gemini round-trip used to happen inside the request the client
// awaits, which produced 504 Gateway Timeouts once it ran past the
// platform's ~150s limit, and gave students no way to know a slow/failed
// call was even happening. This version responds in well under a second
// (as soon as the submission is marked "evaluating") and does the actual
// evaluation in the background via EdgeRuntime.waitUntil, writing the
// result (or a clear error) to the database and a notification row for
// the client to pick up. See _shared/evalHelpers.ts for the quota-aware
// retry policy — 429 (daily free-tier quota) is never retried, since
// retrying only burns more of the same limited quota.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { callGeminiWithPolicy, findActiveEvaluation, friendlyEvalErrorMessage } from '../_shared/evalHelpers.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TASK_RULES: Record<number, string> = {
  1: `TÂCHE 1 — Message descriptif/explicatif (60–120 mots attendus).
Exigences structurelles à vérifier strictement :
- Formule d'appel/salutation adaptée au destinataire et à la relation (tu/vous cohérent du début à la fin).
- Une introduction qui répond clairement à "pourquoi j'écris ce message".
- Un développement organisé en 2-3 points reliés par des connecteurs logiques (Tout d'abord, Ensuite, Enfin...), chaque point apportant une information ET un commentaire/conséquence — un simple listing de faits sans commentaire est une faiblesse à sanctionner.
- Une formule de clôture cohérente avec le ton du message et une signature.
- Respect du statut du destinataire précisé dans la consigne (ami, propriétaire, collègue, etc.) : un registre inadapté (trop familier pour un propriétaire, trop formel pour un ami proche) doit être signalé dans task_achievement_feedback et pénaliser le score.`,
  2: `TÂCHE 2 — Article de blog / compte rendu d'expérience (120–150 mots attendus).
Exigences structurelles à vérifier strictement :
- Titre accrocheur sous forme de phrase nominale (sans verbe conjugué) — absence de titre ou titre avec verbe conjugué = défaut à signaler.
- Salutation d'ouverture adaptée à un lectorat de blog.
- Introduction répondant à qui/quoi/quand/où de façon concise.
- Développement narratif structuré en paragraphes distincts avec connecteurs temporels/logiques (Tout d'abord, Plus tard, Enfin), racontant à la première personne ce qui a été fait/vu/ressenti, avec des détails précis et un jugement (apprécié ou non) sur chaque élément.
- Une recommandation explicite aux lecteurs en lien avec l'expérience.
- Clôture avec formule de politesse et signature.`,
  3: `TÂCHE 3 — Texte argumentatif à partir de deux documents (120–180 mots attendus).
Exigences structurelles à vérifier STRICTEMENT — c'est la tâche la plus techniquement exigeante :
- Titre optionnel sous forme de phrase nominale.
- PARTIE 1 (40-60 mots) : reformulation fidèle et FIDÈLE DANS SES PROPRES MOTS des deux documents — un candidat qui recopie de larges portions du texte source au lieu de reformuler doit être sévèrement pénalisé sur task_achievement_feedback, car c'est exactement ce que l'examen interdit.
- PARTIE 2 (80-120 mots) : une position personnelle CLAIREMENT exprimée (pas de "on pourrait dire que..." évasif), au moins un argument principal développé (affirmation + explication + conséquence + exemple concret), idéalement une nuance ou limite, et une structure avec connecteurs logiques explicites (En effet, De plus, Cependant, En conclusion).
- Vérifier que le total Partie 1 + Partie 2 respecte 120-180 mots ET que chaque partie respecte individuellement sa fourchette (40-60 puis 80-120) — un déséquilibre entre les deux parties est une faiblesse réelle à l'examen.`,
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

function buildSystemPrompt(taskType: number, minWords: number, maxWords: number) {
  const taskRule = TASK_RULES[taskType] || TASK_RULES[1]
  return `Tu es un examinateur CERTIFIÉ du TCF Canada (Test de Connaissance du Français), expert en évaluation d'Expression Écrite (EE) selon le CECRL (A1 à C2) et le barème officiel de France Éducation International.

CONSIGNE DE SÉVÉRITÉ : Tu dois noter avec AU MOINS autant de rigueur qu'un examinateur réel, si possible plus strict. Ne sois jamais complaisant. Un texte "sympathique à lire" mais truffé d'erreurs de conjugaison ou de structure ne doit PAS recevoir un score généreux. Applique les mêmes exigences qu'un correcteur officiel : concordance des temps, accords, registre de langue adapté, respect strict du format de la tâche.

${taskRule}

VÉRIFICATION DU NOMBRE DE MOTS (obligatoire) :
Cette rédaction attend entre ${minWords} et ${maxWords} mots. Compte le nombre de mots réel du texte du candidat. Si le texte est en dessous du minimum, cela doit être signalé explicitement dans task_achievement_feedback comme un manquement grave (un texte trop court ne peut pas développer suffisamment les idées demandées et l'examen réel pénalise fortement ce cas). Si le texte dépasse largement le maximum, signale aussi que les candidats sont pénalisés pour un texte hors-format à l'examen réel.

CRITÈRES D'ÉVALUATION CECRL (à appliquer pour estimated_score /20) :
1. Adéquation au sujet et à la consigne (le candidat répond-il vraiment à ce qui est demandé ?)
2. Cohérence et cohésion (structure logique, connecteurs, paragraphes)
3. Étendue et précision du vocabulaire
4. Correction grammaticale (conjugaison, accords, syntaxe)
5. Registre de langue adapté au destinataire/contexte

Retourne UNIQUEMENT un objet JSON valide (aucun texte avant/après, aucun markdown) avec exactement cette forme :

{
  "cefr_level": "B2",
  "estimated_score": 14.5,
  "grammar_feedback": "string détaillé en français",
  "vocabulary_feedback": "string détaillé en français",
  "organization_feedback": "string détaillé en français, doit explicitement commenter le respect de la structure attendue pour cette tâche précise",
  "task_achievement_feedback": "string détaillé en français, doit explicitement mentionner le nombre de mots réel vs attendu et tout écart au format",
  "mistakes": [
    { "original": "string", "correction": "string", "explanation": "string", "category": "grammaire|conjugaison|orthographe|syntaxe|lexique|structure|registre" }
  ],
  "corrected_version": "le texte entièrement corrigé, en conservant autant que possible les idées originales du candidat",
  "model_answer": "une réponse modèle de niveau C2 pour le même sujet, respectant scrupuleusement la structure et le nombre de mots attendus pour cette tâche",
  "vocabulary_suggestions": [
    { "basic": "string", "advanced": "string", "context": "string" }
  ],
  "recommendations": "conseils personnalisés, concrets et actionnables en français pour progresser vers le niveau supérieur"
}

estimated_score est sur 20, aligné sur le barème officiel TCF Canada EE. Sois précis, technique, et exigeant — pas complaisant.`
}

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    cefr_level: { type: 'STRING' },
    estimated_score: { type: 'NUMBER' },
    grammar_feedback: { type: 'STRING' },
    vocabulary_feedback: { type: 'STRING' },
    organization_feedback: { type: 'STRING' },
    task_achievement_feedback: { type: 'STRING' },
    mistakes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          original: { type: 'STRING' },
          correction: { type: 'STRING' },
          explanation: { type: 'STRING' },
          category: { type: 'STRING' },
        },
        required: ['original', 'correction', 'explanation', 'category'],
      },
    },
    corrected_version: { type: 'STRING' },
    model_answer: { type: 'STRING' },
    vocabulary_suggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          basic: { type: 'STRING' },
          advanced: { type: 'STRING' },
          context: { type: 'STRING' },
        },
        required: ['basic', 'advanced', 'context'],
      },
    },
    recommendations: { type: 'STRING' },
  },
  required: [
    'cefr_level', 'estimated_score', 'grammar_feedback', 'vocabulary_feedback',
    'organization_feedback', 'task_achievement_feedback', 'mistakes',
    'corrected_version', 'model_answer', 'vocabulary_suggestions', 'recommendations',
  ],
}

/** The actual Gemini call + persistence, run in the background AFTER the
 * client already has its 202 response. Never throws — every path either
 * writes an 'evaluated' or an 'error' row plus a notification. */
async function runEvaluationInBackground(admin, { submissionId, userId, sujetNumber, prompt, essay, topicNumber, taskType, minWords, maxWords, geminiKey }) {
  const linkPath = `/ee/${sujetNumber}`
  try {
    const wordCount = essay.trim().split(/\s+/).filter(Boolean).length
    const systemPrompt = buildSystemPrompt(Number(taskType), Number(minWords), Number(maxWords))

    const result = await callGeminiWithPolicy(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: 'user',
            parts: [{
              text: `Sujet EE #${topicNumber} (${wordCount} mots comptés automatiquement dans le texte du candidat) :\n"""${prompt}"""\n\nTexte du candidat à évaluer:\n"""${essay}"""`,
            }],
          },
        ],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
      }
    )

    if (!result.ok) {
      const friendly = friendlyEvalErrorMessage(result.kind, result.rawText)
      console.error('evaluate-essay: Gemini failed, kind=', result.kind, result.rawText)
      await admin.from('ee_submissions').update({ status: 'error', error_message: friendly }).eq('id', submissionId)
      await admin.from('notifications').insert({
        user_id: userId, type: 'eval_error', title: `Sujet EE ${sujetNumber} — échec de l'évaluation`, body: friendly, link: linkPath,
      })
      return
    }

    const rawText = result.json.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) throw new Error('Gemini returned no content')
    const parsed = JSON.parse(rawText)

    const { error: insertErr } = await admin.from('ai_feedback').insert({
      submission_id: submissionId,
      user_id: userId,
      cefr_level: eeEoScoreToCecr(Number(parsed.estimated_score)),
      estimated_score: parsed.estimated_score,
      grammar_feedback: parsed.grammar_feedback,
      vocabulary_feedback: parsed.vocabulary_feedback,
      organization_feedback: parsed.organization_feedback,
      task_achievement_feedback: parsed.task_achievement_feedback,
      mistakes: parsed.mistakes ?? [],
      corrected_version: parsed.corrected_version,
      model_answer: parsed.model_answer,
      vocabulary_suggestions: parsed.vocabulary_suggestions ?? [],
      recommendations: parsed.recommendations,
      raw_response: parsed,
    })
    if (insertErr) throw insertErr

    await admin.from('ee_submissions')
      .update({ status: 'evaluated', final_content: essay, submitted_at: new Date().toISOString() })
      .eq('id', submissionId)

    await admin.from('notifications').insert({
      user_id: userId,
      type: 'eval_success',
      title: `Sujet EE ${sujetNumber} — résultats disponibles`,
      body: `Ta correction est prête : ${parsed.estimated_score}/20 (${eeEoScoreToCecr(Number(parsed.estimated_score))}).`,
      link: linkPath,
    })
  } catch (err) {
    console.error('evaluate-essay background error:', err.message, err.stack)
    const friendly = friendlyEvalErrorMessage('other', err.message)
    await admin.from('ee_submissions').update({ status: 'error', error_message: friendly }).eq('id', submissionId)
    await admin.from('notifications').insert({
      user_id: userId, type: 'eval_error', title: `Sujet EE ${sujetNumber} — échec de l'évaluation`, body: friendly, link: linkPath,
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

    const { submissionId, prompt, essay, topicNumber, taskType = 1, minWords = 60, maxWords = 120 } = await req.json()
    if (!essay || essay.trim().length < 20) throw new Error('Essay is too short to evaluate')

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) throw new Error('GEMINI_API_KEY secret is not set on this Edge Function')

    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const sujetNumber = Math.floor(Number(topicNumber) / 10)

    // Refuse to start a second evaluation while a DIFFERENT sujet is
    // already in flight — this is the actual fix for "a stuck sujet keeps
    // using my quota": without this, every new submission (or every
    // retry) fires another Gemini call on top of an already-running one,
    // against the same small daily quota. This sujet's own other tasks
    // (submitted together in the same click) are explicitly excluded.
    const active = await findActiveEvaluation(admin, user.id, 'EE', sujetNumber)
    if (active) {
      return new Response(
        JSON.stringify({
          error: `Une correction ${active.kind} est déjà en cours (sujet ${active.sujetNumber}). Attends qu'elle se termine avant d'en soumettre une nouvelle.`,
          lockedSujet: active,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      )
    }

    await admin.from('ee_submissions')
      .update({ status: 'evaluating', evaluation_started_at: new Date().toISOString(), error_message: null })
      .eq('id', submissionId)

    const backgroundTask = runEvaluationInBackground(admin, {
      submissionId, userId: user.id, sujetNumber, prompt, essay, topicNumber, taskType, minWords, maxWords, geminiKey,
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
    console.error('evaluate-essay error:', err.message, err.stack)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
