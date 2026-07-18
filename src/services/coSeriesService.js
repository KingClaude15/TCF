import { supabase } from '../lib/supabaseClient'

const TABLE = 'co_series'

export async function listPublishedCoSeries() {
  const { data, error } = await supabase.from(TABLE).select('*').eq('is_published', true).order('series_number')
  if (error) throw error
  return data
}

export async function listAllCoSeries() {
  const { data, error } = await supabase.from(TABLE).select('*').order('series_number')
  if (error) throw error
  return data
}

export async function getCoSeries(seriesNumber) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('series_number', Number(seriesNumber)).maybeSingle()
  if (error) throw error
  return data
}

export async function createCoSeries(payload) {
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateCoSeries(id, payload) {
  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCoSeries(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function getNextCoSeriesNumber() {
  const { data, error } = await supabase.from(TABLE).select('series_number').order('series_number', { ascending: false }).limit(1)
  if (error) throw error
  return (data?.[0]?.series_number ?? 0) + 1
}
