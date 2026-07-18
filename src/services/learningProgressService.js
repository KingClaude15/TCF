import { supabase } from '../lib/supabaseClient'

/**
 * Loads all persisted progress for one item type as a plain map:
 *   { [itemKey]: 'known' | 'review' }
 * Used to hydrate <FlashcardDeck> on mount instead of starting blank
 * every time the Learning Center remounts.
 */
export async function loadItemProgress(userId, itemType = 'flashcard') {
  const { data, error } = await supabase
    .from('learning_item_progress')
    .select('item_key, status')
    .eq('user_id', userId)
    .eq('item_type', itemType)
  if (error) throw error
  return Object.fromEntries((data ?? []).map((row) => [row.item_key, row.status]))
}

/**
 * Upserts a single card/drill's status. Called every time the student taps
 * "Je savais" / "À revoir" — small enough to fire-and-forget from the UI,
 * but callers should still catch/report failures (see FlashcardDeck).
 */
export async function setItemProgress(userId, itemKey, status, itemType = 'flashcard') {
  const { error } = await supabase
    .from('learning_item_progress')
    .upsert(
      { user_id: userId, item_type: itemType, item_key: itemKey, status },
      { onConflict: 'user_id,item_type,item_key' }
    )
  if (error) throw error
}
