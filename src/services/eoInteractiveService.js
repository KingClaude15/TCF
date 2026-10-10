import { supabase } from '../lib/supabaseClient'

/**
 * One turn of EO Tâche 2 interactive role-play.
 * @param {{ sujetPrompt: string, userMessage: string, history: {role:string, content:string}[] }} args
 * @returns {Promise<string>} AI reply text
 */
export async function fetchInteractiveReply({ sujetPrompt, userMessage, history }) {
  const { data, error } = await supabase.functions.invoke('eo-interactive-turn', {
    body: {
      sujetPrompt,
      userMessage,
      history: (history || []).slice(-12),
    },
  })

  if (error) {
    const msg =
      data?.error ||
      error.message ||
      'La conversation interactive est indisponible pour le moment.'
    throw new Error(msg)
  }
  if (data?.error) {
    throw new Error(data.error)
  }
  if (!data?.reply) {
    throw new Error('Réponse IA vide.')
  }
  return String(data.reply).trim()
}
