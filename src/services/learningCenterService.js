/**
 * Learning Center analysis — pure functions over already-fetched EE
 * submissions (each with its joined ai_feedback row). No network calls here;
 * this just reshapes historical correction data into study material.
 */

function allFeedback(eeSubmissions) {
  return eeSubmissions.map((s) => s.ai_feedback?.[0]).filter(Boolean)
}

const CATEGORY_LABELS = {
  grammaire: 'Grammaire',
  conjugaison: 'Conjugaison',
  orthographe: 'Orthographe',
  syntaxe: 'Syntaxe',
  lexique: 'Lexique',
  structure: 'Structure',
  registre: 'Registre',
  autre: 'Autre',
}

export function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat
}

/** Groups every recorded mistake across all submissions by category. */
export function mistakesByCategory(eeSubmissions) {
  const groups = {}
  allFeedback(eeSubmissions).forEach((fb) => {
    ;(fb.mistakes || []).forEach((m) => {
      const cat = m.category || 'autre'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(m)
    })
  })
  return groups
}

/** The categories the student struggles with most, sorted by frequency. */
export function topWeakCategories(eeSubmissions, limit = 5) {
  const groups = mistakesByCategory(eeSubmissions)
  return Object.entries(groups)
    .map(([category, mistakes]) => ({ category, count: mistakes.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Deduplicated vocabulary flashcards (basic -> advanced word/phrase pairs)
 * pulled from every submission's vocabulary_suggestions, most recent first.
 */
export function buildFlashcards(eeSubmissions, limit = 30) {
  const seen = new Set()
  const cards = []
  const sorted = [...eeSubmissions].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))

  for (const sub of sorted) {
    const fb = sub.ai_feedback?.[0]
    if (!fb) continue
    for (const v of fb.vocabulary_suggestions || []) {
      const key = `${v.basic}=>${v.advanced}`.toLowerCase()
      if (seen.has(key) || !v.basic || !v.advanced) continue
      seen.add(key)
      cards.push({ ...v, key })
      if (cards.length >= limit) return cards
    }
  }
  return cards
}

/**
 * Deduplicated sentence-correction drills (original -> correction pairs)
 * pulled from every submission's mistakes list, most recent first.
 */
export function buildCorrectionDrills(eeSubmissions, limit = 25) {
  const seen = new Set()
  const drills = []
  const sorted = [...eeSubmissions].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))

  for (const sub of sorted) {
    const fb = sub.ai_feedback?.[0]
    if (!fb) continue
    for (const m of fb.mistakes || []) {
      const key = `${m.original}=>${m.correction}`.toLowerCase()
      if (seen.has(key) || !m.original || !m.correction) continue
      seen.add(key)
      drills.push(m)
      if (drills.length >= limit) return drills
    }
  }
  return drills
}

/**
 * A short, actionable weekly focus statement built from the current weak
 * categories — distinct from (and complementary to) the Recommendations
 * page, which looks at CO/CE/EE scores and missed days, not error patterns.
 */
export function buildWeeklyFocus(eeSubmissions) {
  const weak = topWeakCategories(eeSubmissions, 2)
  if (weak.length === 0) {
    return "Pas encore assez de corrections enregistrées pour définir un focus. Soumets quelques tâches EE d'abord."
  }
  const labels = weak.map((w) => categoryLabel(w.category)).join(' et ')
  return `Cette semaine, concentre-toi sur : ${labels}. Ce sont tes catégories d'erreurs les plus fréquentes dans tes ${eeSubmissions.filter((s) => s.ai_feedback?.[0]).length} dernières corrections.`
}
