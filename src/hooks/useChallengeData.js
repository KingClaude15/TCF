import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProfile, recalculateStreak } from '../services/profileService'
import { getAllDailyProgress, computeOverallCompletion, computeActiveDay } from '../services/progressService'
import { listCoResults, computeAverage as coAvg } from '../services/coService'
import { listCeResults, computeAverage as ceAvg } from '../services/ceService'
import { listEeSubmissions, computeAverageEeScore } from '../services/eeService'
import { listEoSubmissions, computeAverageEoScore } from '../services/eoService'
import { evaluateAchievements } from '../services/achievementsService'

/**
 * useChallengeData — stable data layer for the whole app.
 *
 * FIX — auto-refresh on navigation (was: every page navigation triggered a
 * full re-fetch):
 *
 * Root cause: Supabase's `onAuthStateChange` fires a TOKEN_REFRESHED event
 * on every navigation (it refreshes the JWT in the background). Each fire
 * called `setUser(session?.user)` in AuthContext with a *new object*, even
 * though the user identity hadn't changed. Because `useChallengeData`'s
 * `refresh` useCallback listed `[user]` as a dependency, every new object
 * reference produced a new `refresh` function, which triggered the
 * `useEffect([refresh])` — causing a full re-fetch on every page visit.
 *
 * Fix: track the user by `user.id` (a primitive string) instead of the
 * `user` object. We use a ref to store the userId so `refresh` never needs
 * to list it as a dependency, breaking the cascade entirely. The initial
 * fetch is still triggered by `useEffect([userId])` — so it runs once when
 * the user logs in and never again just because the JWT was silently
 * refreshed. Manual calls to `refresh()` still work exactly as before.
 */
export function useChallengeData() {
  const { user } = useAuth()

  // Store userId as a ref so refresh() is stable — no userId in its dep array
  const userIdRef = useRef(user?.id)
  userIdRef.current = user?.id

  const [state, setState] = useState({
    loading: true,
    error: null,
    profile: null,
    progressRows: [],
    coResults: [],
    ceResults: [],
    eeSubmissions: [],
    eoSubmissions: [],
  })

  // refresh is now stable across renders — it reads userId from the ref
  // instead of closing over the `user` object. This means its identity
  // never changes between renders, so nothing re-runs just because
  // AuthContext created a new user object for the same session.
  const refresh = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [profile, progressRows, coResults, ceResults, eeSubmissions, eoSubmissions] = await Promise.all([
        getProfile(userId),
        getAllDailyProgress(userId),
        listCoResults(userId),
        listCeResults(userId),
        listEeSubmissions(userId),
        listEoSubmissions(userId),
      ])

      await recalculateStreak(userId)
      await evaluateAchievements(userId, { profile, coResults, ceResults, progressRows })
      const freshProfile = await getProfile(userId)

      setState({
        loading: false,
        error: null,
        profile: freshProfile,
        progressRows,
        coResults,
        ceResults,
        eeSubmissions,
        eoSubmissions,
      })
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }))
    }
  }, []) // ← no dependencies — stable forever, reads userId from ref

  // Only re-fetch when the *identity* of the logged-in user changes
  // (login / logout / account switch), NOT on every token refresh.
  const userId = user?.id ?? null
  useEffect(() => {
    refresh()
  }, [userId]) // ← primitive string, stable across token refreshes

  const completionPct = computeOverallCompletion(state.progressRows)
  const activeDay     = computeActiveDay(state.progressRows)
  const coAverage     = coAvg(state.coResults)
  const ceAverage     = ceAvg(state.ceResults)
  const eeAverage     = computeAverageEeScore(state.eeSubmissions)
  const eoAverage     = computeAverageEoScore(state.eoSubmissions)

  return { ...state, refresh, completionPct, activeDay, coAverage, ceAverage, eeAverage, eoAverage }
}
