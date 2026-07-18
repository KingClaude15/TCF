/**
 * Pure, client-side recommendation engine. Takes already-fetched data
 * (CO/CE results, EE submissions + feedback, daily progress) and produces
 * a prioritized list of actionable study recommendations. No network calls
 * here — keep it fast and testable.
 */

function average(nums) {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function trend(nums) {
  // naive slope over the last N points: positive = improving
  if (nums.length < 2) return 0
  const first = average(nums.slice(0, Math.ceil(nums.length / 2)))
  const second = average(nums.slice(Math.ceil(nums.length / 2)))
  return second - first
}

export function buildRecommendations({ coResults = [], ceResults = [], eeSubmissions = [], progressRows = [] }) {
  const recs = []

  const coScores = coResults.map((r) => Number(r.score))
  const ceScores = ceResults.map((r) => Number(r.score))
  const eeScores = eeSubmissions
    .map((s) => s.ai_feedback?.[0]?.estimated_score)
    .filter((v) => typeof v === 'number')

  const coAvg = average(coScores)
  const ceAvg = average(ceScores)
  const eeAvg = average(eeScores)

  // 1. Lowest-performing section gets top priority
  const sections = [
    { key: 'CO', avg: coAvg, max: 39 },
    { key: 'CE', avg: ceAvg, max: 39 },
    { key: 'EE', avg: eeAvg, max: 20 },
  ].filter((s) => s.avg !== null)

  if (sections.length) {
    const weakest = sections.reduce((a, b) => (a.avg / a.max < b.avg / b.max ? a : b))
    recs.push({
      priority: 'high',
      category: weakest.key,
      title: `Concentre-toi sur ${weakest.key} aujourd'hui`,
      detail: `Ta moyenne ${weakest.key} (${weakest.avg.toFixed(1)}/${weakest.max}) est ton point le plus faible. Fais une série supplémentaire aujourd'hui.`,
    })
  }

  // 2. Progress trend detection
  const coTrend = trend(coScores)
  const ceTrend = trend(ceScores)
  const eeTrend = trend(eeScores)
  if (coTrend < -1) {
    recs.push({
      priority: 'medium',
      category: 'CO',
      title: 'Tes scores CO baissent',
      detail: 'Revois les stratégies de prise de notes pendant l\u2019écoute et refais une série récente en difficulté "medium".',
    })
  }
  if (ceTrend < -1) {
    recs.push({
      priority: 'medium',
      category: 'CE',
      title: 'Tes scores CE baissent',
      detail: 'Entraîne-toi à repérer les mots-clés et les connecteurs logiques avant de répondre.',
    })
  }
  if (eeTrend > 0.5) {
    recs.push({
      priority: 'low',
      category: 'EE',
      title: 'Belle progression en EE !',
      detail: 'Continue sur cette lancée : essaie un sujet plus complexe pour te challenger.',
    })
  }

  // 3. Recurring EE mistakes (category frequency)
  const mistakeCategories = {}
  eeSubmissions.forEach((s) => {
    const mistakes = s.ai_feedback?.[0]?.mistakes || []
    mistakes.forEach((m) => {
      const cat = m.category || 'autre'
      mistakeCategories[cat] = (mistakeCategories[cat] || 0) + 1
    })
  })
  const topMistake = Object.entries(mistakeCategories).sort((a, b) => b[1] - a[1])[0]
  if (topMistake && topMistake[1] >= 2) {
    recs.push({
      priority: 'high',
      category: 'EE',
      title: `Erreur récurrente : ${topMistake[0]}`,
      detail: `Cette catégorie d'erreur apparaît ${topMistake[1]} fois dans tes copies récentes. Révise ce point de grammaire avant ta prochaine rédaction.`,
    })
  }

  // 4. Missed challenge days
  const missedDays = progressRows.filter((r) => {
    if (r.is_complete) return false
    // A day is "missed" if it's earlier than the user's current day and incomplete
    return r.day_number < (progressRows.find((p) => !p.is_complete)?.day_number ?? 999)
  })
  if (missedDays.length > 0) {
    recs.push({
      priority: 'medium',
      category: 'Calendar',
      title: `${missedDays.length} jour(s) manqué(s)`,
      detail: 'Rattrape les jours en retard avant de continuer pour garder une préparation cohérente.',
    })
  }

  // Sort by priority
  const order = { high: 0, medium: 1, low: 2 }
  return recs.sort((a, b) => order[a.priority] - order[b.priority])
}
