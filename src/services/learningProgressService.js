import { supabase } from '../lib/supabaseClient'

const LS_PREFIX = 'tcf_learning_progress:'

function lsKey(userId, itemType) {
  return `${LS_PREFIX}${userId}:${itemType}`
}

function readLocal(userId, itemType) {
  try {
    const raw = localStorage.getItem(lsKey(userId, itemType))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocal(userId, itemType, map) {
  try {
    localStorage.setItem(lsKey(userId, itemType), JSON.stringify(map))
  } catch {
    // ignore quota errors
  }
}

/**
 * Loads progress map { [itemKey]: status }.
 * Tries Supabase first; falls back to localStorage so lessons still work
 * if the table / RLS is missing.
 */
export async function loadItemProgress(userId, itemType = 'flashcard') {
  if (!userId) return {}
  try {
    const { data, error } = await supabase
      .from('learning_item_progress')
      .select('item_key, status')
      .eq('user_id', userId)
      .eq('item_type', itemType)
    if (error) throw error
    const map = Object.fromEntries((data ?? []).map((row) => [row.item_key, row.status]))
    // Keep a local mirror so offline / failed saves still hydrate next visit
    writeLocal(userId, itemType, { ...readLocal(userId, itemType), ...map })
    return { ...readLocal(userId, itemType), ...map }
  } catch (err) {
    console.warn('[learningProgress] load from Supabase failed, using localStorage', err?.message || err)
    return readLocal(userId, itemType)
  }
}

/**
 * Upserts one item. Always writes localStorage; also tries Supabase.
 * Returns { ok, remote, errorMessage }.
 */
export async function setItemProgress(userId, itemKey, status, itemType = 'flashcard') {
  if (!userId || !itemKey) {
    return { ok: false, remote: false, errorMessage: 'Utilisateur ou clé manquant' }
  }

  // Local first — never lose progress in the UI
  const local = readLocal(userId, itemType)
  local[itemKey] = status
  writeLocal(userId, itemType, local)

  try {
    const { error } = await supabase.from('learning_item_progress').upsert(
      {
        user_id: userId,
        item_type: itemType,
        item_key: itemKey,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,item_type,item_key' }
    )
    if (error) throw error
    return { ok: true, remote: true, errorMessage: null }
  } catch (err) {
    const msg = err?.message || err?.error_description || String(err)
    console.warn('[learningProgress] Supabase save failed:', msg)
    // Local save succeeded — treat as soft success so the student isn't blocked
    return {
      ok: true,
      remote: false,
      errorMessage: msg,
    }
  }
}
