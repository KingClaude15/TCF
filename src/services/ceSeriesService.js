import { supabase } from '../lib/supabaseClient'

const TABLE = 'ce_series'

export async function listPublishedCeSeries() {
  const { data, error } = await supabase.from(TABLE).select('*').eq('is_published', true).order('series_number')
  if (error) throw error
  return data
}

export async function listAllCeSeries() {
  const { data, error } = await supabase.from(TABLE).select('*').order('series_number')
  if (error) throw error
  return data
}

export async function getCeSeries(seriesNumber) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('series_number', Number(seriesNumber)).maybeSingle()
  if (error) throw error
  return data
}

export async function createCeSeries(payload) {
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCeSeries(id, payload) {
  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCeSeries(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function getNextCeSeriesNumber() {
  const { data, error } = await supabase.from(TABLE).select('series_number').order('series_number', { ascending: false }).limit(1)
  if (error) throw error
  return (data?.[0]?.series_number ?? 0) + 1
}
