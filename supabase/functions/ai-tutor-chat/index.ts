// Supabase Edge Function: ai-tutor-chat
// Deploy: supabase functions deploy ai-tutor-chat
// Secret: supabase secrets set OPENAI_API_KEY=sk-...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.56.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const SYSTEM_PROMPT = `Tu es un tuteur expert du TCF Canada (Test de Connaissance du Français).
Tu aides les candidats à préparer les épreuves CO, CE, EE et EO.
Réponds toujours en français, de façon claire, structurée et pédagogique.
Donne des exemples concrets, des corrections, des tips méthodologiques.
Si on te demande d'évaluer un texte, donne un niveau CECR estimé et des axes d'amélioration.
Reste concis mais complet (150-350 mots max sauf si l'utilisateur demande plus de détails).`

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { message, history = [] } = await req.json()

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message manquant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    })

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || ""),
      })),
      { role: "user", content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    })

    const reply = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse."

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: err.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
