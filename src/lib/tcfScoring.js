// Official TCF Canada scoring constants.
//
// Sources (verified July 2026):
// - CO/CE structure (39 MCQ, 35min/60min, /699 scale, progressive difficulty
//   weighting): France Éducation International's "Manuel du candidat TCF
//   Canada" (afsf.com) + Wikipedia "Test de connaissance du français".
// - Per-question weight table (sums to exactly 699 over 39 questions):
//   Wikipedia, citing France Éducation International.
// - CO/CE score → CECR level bands (100-199=A1 ... 600-699=C2):
//   afsf.com / tcf-canada_nclc.pdf, formationstcfcanada.com.
// - EE/EO (/20) → CECR level bands: Ministère de l'Immigration du Québec
//   "Tableau de correspondance entre les pointages" (cdn-contenu.quebec.ca),
//   cross-checked against France Compétences' TCF IRN barème (0=A1 non
//   atteint, 1=A1, 2-5=A2, 6-9=B1, 10-13=B2, 14-17=C1, 18-20=C2).

// Question 1-39 → points, in order. Verified to sum to exactly 699.
export const CO_CE_QUESTION_WEIGHTS = [
  ...Array(4).fill(3), // Q1-4:   3 pts each  = 12
  ...Array(6).fill(9), // Q5-10:  9 pts each  = 54
  ...Array(9).fill(15), // Q11-19: 15 pts each = 135
  ...Array(10).fill(21), // Q20-29: 21 pts each = 210
  ...Array(6).fill(26), // Q30-35: 26 pts each = 156
  ...Array(4).fill(33), // Q36-39: 33 pts each = 132
] // total = 699, length = 39

export const CO_CE_MAX_POINTS = 699

/**
 * Converts a set of correct/incorrect answers into the official-style
 * weighted point score. `correctFlags` is an array of booleans, one per
 * question, IN THE ORDER the questions were presented (TCF Canada orders
 * questions by increasing difficulty, so position in the array maps to
 * position in the official weight table).
 *
 * For a full 39-question series this reproduces the exact official /699
 * score. For a shorter practice series (this app's "séries" are often
 * shorter drills, not full exam simulations), the same official per-position
 * weights are used for however many questions exist, then scaled so the
 * result is still expressed on the familiar /699 scale — an honest estimate
 * rather than a literal official score.
 */
export function computeWeightedPoints(correctFlags) {
  const n = correctFlags.length
  if (!n) return { points: 0, maxPoints: 0, isOfficialLength: false }

  const weights = CO_CE_QUESTION_WEIGHTS.slice(0, n)
  const maxRaw = weights.reduce((a, b) => a + b, 0)
  const earnedRaw = weights.reduce((sum, w, i) => sum + (correctFlags[i] ? w : 0), 0)

  const isOfficialLength = n === 39
  // Scale to /699 so every series — regardless of length — is comparable
  // on the same familiar scale.
  const points = isOfficialLength ? earnedRaw : Math.round((earnedRaw / maxRaw) * CO_CE_MAX_POINTS)

  return { points, maxPoints: CO_CE_MAX_POINTS, isOfficialLength }
}

/** Official CO/CE band → CECR level (score is on the /699 scale). */
export function coCeScoreToCecr(points) {
  if (points >= 600) return 'C2'
  if (points >= 500) return 'C1'
  if (points >= 400) return 'B2'
  if (points >= 300) return 'B1'
  if (points >= 200) return 'A2'
  if (points >= 100) return 'A1'
  return 'A1 non atteint'
}

/** Official EE/EO band → CECR level (score is on the /20 scale). */
export function eeEoScoreToCecr(score20) {
  const s = Number(score20)
  if (s >= 18) return 'C2'
  if (s >= 14) return 'C1'
  if (s >= 10) return 'B2'
  if (s >= 6) return 'B1'
  if (s >= 2) return 'A2'
  if (s >= 1) return 'A1'
  return 'A1 non atteint'
}
