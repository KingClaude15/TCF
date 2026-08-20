import { supabase } from '../lib/supabaseClient'

/**
 * Send a message to the AI Tutor (TCF specialist).
 * Calls the Supabase Edge Function `ai-tutor-chat`.
 *
 * Secrets (same as evaluate-essay):
 *   GROQ_API_KEY  (primary)
 *   GEMINI_API_KEY (optional fallback)
 *
 * Deploy: supabase functions deploy ai-tutor-chat
 *
 * @param {string} message
 * @param {Array<{role: string, content: string}>} history
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
        history: history.slice(-10),
      },
    })

    // Success payload
    if (data?.reply) {
      return { reply: data.reply }
    }

    // Structured error from function body (HTTP 200 with { error })
    if (data?.error) {
      return { reply: '', error: data.error }
    }

    // SDK non-2xx path — try to extract message
    if (error) {
      console.error('[aiChatService]', error)
      const msg =
        error.message ||
        error.context?.statusText ||
        'Impossible de contacter le tuteur IA. Réessaie dans un instant.'
      return { reply: '', error: msg }
    }

    return { reply: '', error: 'Réponse vide du serveur.' }
  } catch (err) {
    console.error('[aiChatService] unexpected', err)
    return {
      reply: '',
      error: 'Erreur réseau. Vérifie ta connexion et réessaie.',
    }
  }
}
