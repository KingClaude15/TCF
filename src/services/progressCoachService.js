/**
 * AI Progress Coach — pure, client-side analytics over already-fetched data
 * (co/ce results, ee submissions+feedback, daily progress, profile). No
 * network calls here, same philosophy as recommendationEngine.js.
 *
 * This is deliberately deterministic rather than another LLM call: trend
 * detection and readiness projection are simple enough to compute reliably
 * and instantly client-side, without adding another Edge Function, another
 * secret to configure, or a per-analysis API cost. The Learning Center /
 * evaluate-essay function remains the only place an LLM is actually called.
 *
 * -------------------------------------------------------------------------
 * WHAT "READINESS" MEANS HERE (read before changing the math):
 * Each module's readiness compares a *projected* score at the end of the
 * 41-day plan against a target:
 *   - EE target = profile.target_score directly (it's already "sur 20").
 *   - CO/CE target = profile.target_score / 20, applied as a percentage.
 *     There's no separate CO/CE target field in the schema, so this is an
 *     explicit approximation — it assumes a student aiming for 15/20 on EE
 *     is roughly aiming for 75% on CO/CE too. Good enough to flag "off
 *     track" vs "on track"; not a substitute for an official score
 *     conversion table.
 * -------------------------------------------------------------------------
 */

function average(nums) {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

/** Monday-of-the-week date string, used as a stable weekly bucket key. */
function weekKey(dateStr) {
  const d = new Date(dateStr)
  const day = (d.getUTCDay() + 6) % 7 // 0 = Monday
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() - day)
  return monday.toISOString().slice(0, 10)
}

/** Least-squares slope over evenly-spaced points (index = x). Units: per-index change. */
function linearSlope(values) {
  const n = values.length
  if (n < 2) return 0
  const xMean = (n - 1) / 2
  const yMean = average(values)
  let num = 0
  let den = 0
  values.forEach((y, x) => {
    num += (x - xMean) * (y - yMean)
    den += (x - xMean) ** 2
  })
  return den === 0 ? 0 : num / den
}

/**
 * Buckets rows by calendar week and returns weekly averages (as a
 * percentage of max, so CO/CE/EE are all comparable on a 0-100 scale)
 * plus the week-over-week trend slope and a simple direction label.
 */
export function weeklyTrend(rows, { dateKey = 'created_at', scoreKey = 'score', maxScoreKey = 'max_score', maxScore } = {}) {
  if (!rows?.length) return { weeks: [], slopePerWeek: 0, direction: 'insufficient_data', dataPoints: 0 }

  const buckets = {}
  rows.forEach((r) => {
    const date = r[dateKey]
    if (!date) return
    const key = weekKey(date)
    const max = maxScore ?? Number(r[maxScoreKey]) ?? 100
    const pct = (Number(r[scoreKey]) / max) * 100
    if (!buckets[key]) buckets[key] = []
    buckets[key].push(pct)
  })

  const weeks = Object.entries(buckets)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([week, vals]) => ({ week, avg: Number(average(vals).toFixed(1)), count: vals.length }))

  const slopePerWeek = linearSlope(weeks.map((w) => w.avg))
  const direction = weeks.length < 2 ? 'insufficient_data' : slopePerWeek > 1.5 ? 'up' : slopePerWeek < -1.5 ? 'down' : 'flat'

  return { weeks, slopePerWeek: Number(slopePerWeek.toFixed(2)), direction, dataPoints: rows.length }
}

/**
 * A module is "plateaued" if there's enough recent practice but the trend
 * has stayed essentially flat for several weeks — distinct from simply not
 * practicing enough to have a trend at all.
 */
export function detectPlateau(trend, { minWeeks = 3, thresholdPct = 1.5 } = {}) {
  if (trend.weeks.length < minWeeks) return false
  const recent = trend.weeks.slice(-minWeeks)
  const spread = Math.max(...recent.map((w) => w.avg)) - Math.min(...recent.map((w) => w.avg))
  return spread < thresholdPct && Math.abs(trend.slopePerWeek) < thresholdPct
}

function moduleReadiness({ label, trend, currentAvgPct, targetPct, weeksRemaining }) {
  if (currentAvgPct === null) {
    return { label, status: 'no_data', currentAvgPct: null, projectedPct: null, targetPct, trend }
  }
  const projectedPct = weeksRemaining === null
    ? currentAvgPct
    : Math.max(0, Math.min(100, currentAvgPct + trend.slopePerWeek * weeksRemaining))

  let status
  if (targetPct === null) status = 'no_target'
  else if (projectedPct >= targetPct + 3) status = 'ahead'
  else if (projectedPct >= targetPct - 3) status = 'on_track'
  else status = 'at_risk'

  return { label, status, currentAvgPct: Number(currentAvgPct.toFixed(1)), projectedPct: Number(projectedPct.toFixed(1)), targetPct, trend }
}

/**
 * The main entry point: builds per-module readiness + an overall status +
 * a short French narrative summary, from already-fetched challenge data.
 */
export function predictReadiness({ profile, progressRows = [], coResults = [], ceResults = [], eeSubmissions = [] }) {
  const daysCompleted = progressRows.filter((r) => r.is_complete).length
  const daysRemaining = 41 - daysCompleted

  // Estimate pace from real elapsed calendar time so the projection reflects
  // how fast this specific student actually moves, not a fixed assumption.
  const startDate = profile?.challenge_start_date ? new Date(profile.challenge_start_date) : null
  const weeksElapsed = startDate ? Math.max((Date.now() - startDate.getTime()) / (7 * 86400000), 1 / 7) : null
  const paceDaysPerWeek = startDate && daysCompleted > 0 ? daysCompleted / weeksElapsed : null
  const paceWeeksRemaining = paceDaysPerWeek && paceDaysPerWeek > 0 ? daysRemaining / paceDaysPerWeek : null

  // The student's actual exam date (if set) is the real deadline —
  // independent of how fast they're clearing the 41-day plan. Projections
  // should reflect whichever horizon is sooner: if the exam is in 3 weeks
  // but the student is on pace to finish the plan in 6, "3 weeks" is what
  // actually determines readiness, not the plan's own pace.
  const examDate = profile?.exam_date ? new Date(profile.exam_date) : null
  const daysUntilExam = examDate ? Math.ceil((examDate.getTime() - Date.now()) / 86400000) : null
  const weeksUntilExam = daysUntilExam !== null ? Math.max(daysUntilExam / 7, 0) : null

  const weeksRemaining =
    weeksUntilExam !== null && paceWeeksRemaining !== null
      ? Math.min(weeksUntilExam, paceWeeksRemaining)
      : weeksUntilExam !== null
      ? weeksUntilExam
      : paceWeeksRemaining

  const examIsSoonerThanPace = weeksUntilExam !== null && paceWeeksRemaining !== null && weeksUntilExam < paceWeeksRemaining

  const targetPct = profile?.target_score ? (profile.target_score / 20) * 100 : null
  const eeTargetPct = profile?.target_score ? (profile.target_score / 20) * 100 : null

  const coTrend = weeklyTrend(coResults)
  const ceTrend = weeklyTrend(ceResults)
  const eeRows = eeSubmissions
    .filter((s) => s.ai_feedback?.[0])
    .map((s) => ({ created_at: s.ai_feedback[0].created_at, score: s.ai_feedback[0].estimated_score }))
  const eeTrend = weeklyTrend(eeRows, { maxScore: 20 })

  const modules = {
    co: moduleReadiness({ label: 'CO', trend: coTrend, currentAvgPct: average(coResults.map((r) => (Number(r.score) / Number(r.max_score)) * 100)), targetPct, weeksRemaining }),
    ce: moduleReadiness({ label: 'CE', trend: ceTrend, currentAvgPct: average(ceResults.map((r) => (Number(r.score) / Number(r.max_score)) * 100)), targetPct, weeksRemaining }),
    ee: moduleReadiness({ label: 'EE', trend: eeTrend, currentAvgPct: average(eeRows.map((r) => (r.score / 20) * 100)), targetPct: eeTargetPct, weeksRemaining }),
  }

  const statuses = Object.values(modules).map((m) => m.status)
  let overallStatus
  if (statuses.every((s) => s === 'no_data')) overallStatus = 'insufficient_data'
  else if (statuses.some((s) => s === 'at_risk')) overallStatus = 'at_risk'
  else if (statuses.filter((s) => s === 'ahead').length >= 2) overallStatus = 'ahead'
  else overallStatus = 'on_track'

  return {
    daysCompleted,
    daysRemaining,
    paceDaysPerWeek: paceDaysPerWeek ? Number(paceDaysPerWeek.toFixed(1)) : null,
    weeksRemaining: weeksRemaining ? Number(weeksRemaining.toFixed(1)) : null,
    daysUntilExam,
    weeksUntilExam: weeksUntilExam !== null ? Number(weeksUntilExam.toFixed(1)) : null,
    examIsSoonerThanPace,
    modules,
    overallStatus,
    narrative: buildNarrative({ modules, overallStatus, daysCompleted, weeksRemaining, daysUntilExam, examIsSoonerThanPace }),
  }
}

function buildNarrative({ modules, overallStatus, daysCompleted, weeksRemaining, daysUntilExam, examIsSoonerThanPace }) {
  if (overallStatus === 'insufficient_data') {
    return "Pas encore assez de données pour une prédiction fiable. Complète quelques séries CO, CE et une correction EE pour débloquer ton analyse de préparation."
  }

  const withData = Object.values(modules).filter((m) => m.status !== 'no_data')
  const weakest = withData.reduce((a, b) => (a.projectedPct < b.projectedPct ? a : b), withData[0])
  const strongest = withData.reduce((a, b) => (a.projectedPct > b.projectedPct ? a : b), withData[0])

  let paceNote
  if (daysUntilExam !== null && examIsSoonerThanPace) {
    paceNote =
      daysUntilExam >= 0
        ? `Ton examen est prévu dans ${daysUntilExam} jour${daysUntilExam >= 2 ? 's' : ''} — plus tôt que ton rythme actuel ne le laisserait penser pour finir les 41 jours. Priorise le temps qu'il te reste.`
        : "La date d'examen renseignée est déjà passée — mets-la à jour dans ton profil si tu prépares une nouvelle session."
  } else if (weeksRemaining !== null) {
    paceNote = `À ton rythme actuel, il te reste environ ${weeksRemaining.toFixed(1)} semaine${weeksRemaining >= 2 ? 's' : ''} pour terminer les 41 jours.`
  } else {
    paceNote = "Complète quelques jours de plus pour qu'on puisse estimer ton rythme."
  }

  if (overallStatus === 'ahead') {
    return `Excellente trajectoire — tu es en avance sur ton objectif, notamment en ${strongest.label}. ${paceNote} Continue sur cette lancée.`
  }
  if (overallStatus === 'at_risk') {
    return `Ta progression en ${weakest.label} est actuellement en dessous de ton objectif visé (${weakest.projectedPct}% projeté vs ${Math.round(weakest.targetPct)}% visé). ${paceNote} Concentre tes prochaines séances sur ${weakest.label}.`
  }
  return `Tu es globalement sur la bonne voie vers ton objectif. ${paceNote} ${weakest.label} reste ton point le plus fragile — une série de plus par semaine y ferait une vraie différence.`
}

/**
 * Structured insight cards combining trend detection, plateau detection,
 * and consistency — the "coach's observations" list shown under the
 * headline readiness card.
 */
export function buildCoachInsights({ profile, progressRows = [], coResults = [], ceResults = [], eeSubmissions = [] }) {
  const insights = []

  const coTrend = weeklyTrend(coResults)
  const ceTrend = weeklyTrend(ceResults)
  const eeRows = eeSubmissions
    .filter((s) => s.ai_feedback?.[0])
    .map((s) => ({ created_at: s.ai_feedback[0].created_at, score: s.ai_feedback[0].estimated_score }))
  const eeTrend = weeklyTrend(eeRows, { maxScore: 20 })

  ;[
    { key: 'CO', trend: coTrend },
    { key: 'CE', trend: ceTrend },
    { key: 'EE', trend: eeTrend },
  ].forEach(({ key, trend }) => {
    if (trend.direction === 'up') {
      insights.push({ type: 'trend', tone: 'positive', title: `${key} en progression`, detail: `+${trend.slopePerWeek}%/semaine sur les dernières semaines. Ce qui fonctionne en ce moment mérite d'être répété.` })
    } else if (trend.direction === 'down') {
      insights.push({ type: 'trend', tone: 'warning', title: `${key} en baisse`, detail: `${trend.slopePerWeek}%/semaine sur les dernières semaines. Revois les séries récentes pour identifier ce qui a changé.` })
    } else if (detectPlateau(trend)) {
      insights.push({ type: 'plateau', tone: 'warning', title: `${key} stagne`, detail: `Tes scores ${key} n'évoluent presque plus depuis ${trend.weeks.length} semaines malgré la pratique. Essaie un niveau de difficulté différent ou une nouvelle stratégie.` })
    }
  })

  // Consistency: has the student been active in the last 7 days?
  const allDates = [
    ...coResults.map((r) => r.created_at),
    ...ceResults.map((r) => r.created_at),
    ...eeSubmissions.map((s) => s.updated_at || s.created_at),
  ].filter(Boolean)
  if (allDates.length) {
    const mostRecent = new Date(Math.max(...allDates.map((d) => new Date(d).getTime())))
    const daysSince = Math.floor((Date.now() - mostRecent.getTime()) / 86400000)
    if (daysSince >= 4) {
      insights.push({ type: 'consistency', tone: 'warning', title: 'Pas d\'activité récente', detail: `Ta dernière session remonte à ${daysSince} jours. La régularité compte autant que le volume pour progresser d'ici l'examen.` })
    }
  }

  return insights
}
