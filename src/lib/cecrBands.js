// Mirrors eeEoScoreToCecr() in supabase/functions/evaluate-essay/index.ts
// and evaluate-eo/index.ts exactly — same /20 thresholds — so a sujet's
// summary band shown here always agrees with what the backend already
// computed per task. Keep these two in sync if the official barème changes.
export function scoreToCecr(score) {
  if (score >= 18) return 'C2'
  if (score >= 14) return 'C1'
  if (score >= 10) return 'B2'
  if (score >= 6) return 'B1'
  if (score >= 2) return 'A2'
  if (score >= 1) return 'A1'
  return 'A1 non atteint'
}

export const CEFR_BAND_STYLES = {
  C2: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  C1: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  B2: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  B1: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  A2: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  A1: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'A1 non atteint': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

/**
 * A sujet's "band score" is the average of its 3 tasks' estimated_score
 * (each already /20), rounded to 1 decimal — the summary the student sees
 * once all 3 tâches of a sujet have been evaluated. Returns null unless
 * all 3 scores are present, so partial attempts never show a misleading
 * summary.
 */
export function computeSujetBandScore(taskScores) {
  if (!taskScores || taskScores.length !== 3 || taskScores.some((s) => typeof s !== 'number')) return null
  const avg = taskScores.reduce((a, b) => a + b, 0) / 3
  const rounded = Math.round(avg * 10) / 10
  return { score: rounded, cefr: scoreToCecr(rounded) }
}
