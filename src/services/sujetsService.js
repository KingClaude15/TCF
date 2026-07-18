import { supabase } from '../lib/supabaseClient'

const TASK_BOUNDS = {
  1: { min: 60, max: 120 },
  2: { min: 120, max: 150 },
  3: { min: 120, max: 180 },
}

/** Students only ever see published sujets (enforced again by RLS). */
export async function listPublishedSujets() {
  const { data, error } = await supabase
    .from('ee_sujets')
    .select('*')
    .eq('is_published', true)
    .order('sujet_number', { ascending: true })
  if (error) throw error
  return data
}

/** Admins see everything, published or not. */
export async function listAllSujets() {
  const { data, error } = await supabase
    .from('ee_sujets')
    .select('*')
    .order('sujet_number', { ascending: true })
  if (error) throw error
  return data
}

export async function getSujetByNumber(sujetNumber) {
  const { data, error } = await supabase
    .from('ee_sujets')
    .select('*')
    .eq('sujet_number', Number(sujetNumber))
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createSujet(payload) {
  const { data, error } = await supabase.from('ee_sujets').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateSujet(id, payload) {
  const { data, error } = await supabase.from('ee_sujets').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSujet(id) {
  const { error } = await supabase.from('ee_sujets').delete().eq('id', id)
  if (error) throw error
}

export async function getNextSujetNumber() {
  const { data, error } = await supabase
    .from('ee_sujets')
    .select('sujet_number')
    .order('sujet_number', { ascending: false })
    .limit(1)
  if (error) throw error
  return (data?.[0]?.sujet_number ?? 0) + 1
}

/** Normalizes a DB sujet row into the 3 tasks the workspace UI consumes. */
export function sujetToTasks(sujet) {
  if (!sujet) return []
  return [
    {
      taskType: 1,
      taskLabel: 'Tâche 1 — Message',
      prompt: sujet.tache1_prompt,
      minWords: sujet.tache1_min ?? TASK_BOUNDS[1].min,
      maxWords: sujet.tache1_max ?? TASK_BOUNDS[1].max,
    },
    {
      taskType: 2,
      taskLabel: 'Tâche 2 — Article / compte rendu',
      prompt: sujet.tache2_prompt,
      minWords: sujet.tache2_min ?? TASK_BOUNDS[2].min,
      maxWords: sujet.tache2_max ?? TASK_BOUNDS[2].max,
    },
    {
      taskType: 3,
      taskLabel: 'Tâche 3 — Texte argumentatif',
      prompt:
        `${sujet.tache3_theme} : pour ou contre ?\n\n` +
        `Partie 1 : présentez les deux opinions avec vos propres mots (40 à 60 mots).\n` +
        `Partie 2 : donnez votre position sur le thème général (80 à 120 mots).\n\n` +
        `Document 1 :\n${sujet.tache3_doc1}\n\nDocument 2 :\n${sujet.tache3_doc2}`,
      minWords: sujet.tache3_min ?? TASK_BOUNDS[3].min,
      maxWords: sujet.tache3_max ?? TASK_BOUNDS[3].max,
    },
  ]
}

/** Encodes (sujetNumber, taskType) into the single topic_number column ee_submissions uses. */
export function encodeTopicNumber(sujetNumber, taskType) {
  return Number(sujetNumber) * 10 + Number(taskType)
}
