import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, recalculateStreak } from '../services/profileService'
import { getAllDailyProgress, computeOverallCompletion, computeActiveDay } from '../services/progressService'
import { listCoResults, computeAverage as coAvg } from '../services/coService'
import { listCeResults, computeAverage as ceAvg } from '../services/ceService'
import { listEeSubmissions, computeAverageEeScore } from '../services/eeService'
import { evaluateAchievements } from '../services/achievementsService'

/**
 * Loads and memoizes everything the dashboard/statistics/recommendations
 * pages need. Call `refresh()` after any mutation elsewhere in the app.
 */
export function useChallengeData() {
  const { user } = useAuth()
  const [state, setState] = useState({
    loading: true,
    error: null,
    profile: null,
    progressRows: [],
    coResults: [],
    ceResults: [],
    eeSubmissions: [],
  })

  const refresh = useCallback(async () => {
    if (!user) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [profile, progressRows, coResults, ceResults, eeSubmissions] = await Promise.all([
        getProfile(user.id),
        getAllDailyProgress(user.id),
        listCoResults(user.id),
        listCeResults(user.id),
        listEeSubmissions(user.id),
      ])

      // Keep streaks fresh, then re-fetch achievements eligibility
      await recalculateStreak(user.id)
      await evaluateAchievements(user.id, { profile, coResults, ceResults, progressRows })
      const freshProfile = await getProfile(user.id)

      setState({
        loading: false,
        error: null,
        profile: freshProfile,
        progressRows,
        coResults,
        ceResults,
        eeSubmissions,
      })
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const completionPct = computeOverallCompletion(state.progressRows)
  const activeDay = computeActiveDay(state.progressRows)
  const coAverage = coAvg(state.coResults)
  const ceAverage = ceAvg(state.ceResults)
  const eeAverage = computeAverageEeScore(state.eeSubmissions)

  return { ...state, refresh, completionPct, activeDay, coAverage, ceAverage, eeAverage }
}
