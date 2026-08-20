import { supabase } from '../lib/supabaseClient'

/**
 * Send a message to the AI Tutor (TCF specialist).
 * Calls the Supabase Edge Function `ai-tutor-chat`.
 *
 * Deploy the function with:
 *   supabase functions deploy ai-tutor-chat
 *
 * And set OPENAI_API_KEY as a secret:
 *   supabase secrets set OPENAI_API_KEY=sk-...
 *
 * @param {string} message - User question
 * @param {Array<{role: string, content: string}>} history - Previous messages (optional)
 * @returns {Promise<{reply: string, error?: string}>}
 */
export async function askAiTutor(message, history = []) {
  if (!message?.trim()) {
    return { reply: '', error: 'Message vide' }
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-tutor-chat', {
      body: {
        message: message.trim(),
        history: history.slice(-10), // keep last 10 turns for context
      },
    })

    if (error) {
      console.error('[aiChatService]', error)
      return {
        reply: '',
        error: error.message || 'Impossible de contacter le tuteur IA. Réessaie dans un instant.',
      }
    }

    // Edge function returns { reply: "..." } or { error: "..." }
    if (data?.error) {
      return { reply: '', error: data.error }
    }

    return { reply: data?.reply || 'Désolé, je n’ai pas pu générer de réponse.' }
  } catch (err) {
    console.error('[aiChatService] unexpected', err)
    return {
      reply: '',
      error: 'Erreur réseau. Vérifie ta connexion et réessaie.',
    }
  }
}
