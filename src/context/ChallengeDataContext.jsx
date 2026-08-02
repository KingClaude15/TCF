import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { getProfile, recalculateStreak } from '../services/profileService'
import { getAllDailyProgress, computeOverallCompletion, computeActiveDay } from '../services/progressService'
import { listCoResults, computeAverage as coAvg } from '../services/coService'
import { listCeResults, computeAverage as ceAvg } from '../services/ceService'
import { listEeSubmissions, computeAverageEeScore } from '../services/eeService'
import { listEoSubmissions, computeAverageEoScore } from '../services/eoService'
import { evaluateAchievements } from '../services/achievementsService'

/**
 * ChallengeDataContext
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS — the auto-refresh bug, definitively fixed:
 *
 * Previously `useChallengeData` was a plain hook. Every page that called it
 * got its own independent instance. When React navigates to a new page it
 * unmounts the old component and mounts the new one. The new component calls
 * the hook for the first time → the hook's `useEffect` fires → `setState`
 * sets `loading: true` → the page renders its skeleton/spinner → data arrives
 * → spinner disappears. To the user this looks exactly like the page
 * "auto-refreshing" on every navigation.
 *
 * SOLUTION: lift the data into a React context that lives above the router.
 * The context is mounted once when the app starts and never unmounts during
 * navigation. Data is fetched exactly once when the user logs in. Every page
 * reads the same shared state — so navigating never triggers a new fetch,
 * never sets loading:true, and never shows a spinner. Pages see the data
 * instantly because it was already there.
 *
 * `refresh()` is still exposed for pages that need to re-fetch after a
 * mutation (e.g. after submitting an EE). Those explicit refreshes are
 * intentional and do set `loading: true` momentarily — but that is only
 * when the user has just changed something, not on every navigation.
 *
 * `useChallengeData()` (in hooks/useChallengeData.js) now simply reads from
 * this context, so every page file works exactly as before with no changes.
 */

const ChallengeDataContext = createContext(undefined)

const INITIAL = {
  loading: true,
  error: null,
  profile: null,
  progressRows: [],
  coResults: [],
  ceResults: [],
  eeSubmissions: [],
  eoSubmissions: [],
}

export function ChallengeDataProvider({ children }) {
  const { user } = useAuth()
  const userIdRef = useRef(user?.id ?? null)
  userIdRef.current = user?.id ?? null

  const [state, setState] = useState(INITIAL)

  // `refresh` is stable — its identity never changes between renders.
  // It reads userId from the ref so it never needs to list it as a dep.
  // Pages can call it freely after mutations without fear of stale closures.
  const refresh = useCallback(async () => {
    const userId = userIdRef.current
    if (!userId) {
      setState({ ...INITIAL, loading: false })
      return
    }

    // Only set loading:true on the very first load (when we have no data yet).
    // On subsequent explicit refreshes (after a mutation), update silently in
    // the background so the page stays visible while new data arrives.
    setState(prev => ({
      ...prev,
      loading: prev.profile === null, // true only on first load
      error: null,
    }))

    try {
      const [profile, progressRows, coResults, ceResults, eeSubmissions, eoSubmissions] =
        await Promise.all([
          getProfile(userId),
          getAllDailyProgress(userId),
          listCoResults(userId),
          listCeResults(userId),
          listEeSubmissions(userId),
          listEoSubmissions(userId),
        ])

      // Fire-and-forget side effects — don't block the state update
      Promise.all([
        recalculateStreak(userId),
        evaluateAchievements(userId, { profile, coResults, ceResults, progressRows }),
      ])
        .then(() => getProfile(userId))
        .then(freshProfile =>
          setState(prev => ({ ...prev, profile: freshProfile }))
        )
        .catch(() => {}) // non-critical — base data already set below

      setState({
        loading: false,
        error: null,
        profile,
        progressRows,
        coResults,
        ceResults,
        eeSubmissions,
        eoSubmissions,
      })
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }, []) // stable forever

  // Fetch once when the user's identity changes (login / logout).
  // Primitive string → no spurious re-runs from object identity changes.
  const userId = user?.id ?? null
  useEffect(() => {
    if (userId) {
      refresh()
    } else {
      // Logged out — clear all data immediately
      setState({ ...INITIAL, loading: false })
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps
  // Note: `refresh` is intentionally omitted from deps — it is stable (empty
  // dep array) so including it would be harmless, but ESLint would warn about
  // exhaustive-deps. The eslint-disable above silences that. If you prefer,
  // you can add `refresh` to the dep array; the behaviour is identical.

  const completionPct = computeOverallCompletion(state.progressRows)
  const activeDay     = computeActiveDay(state.progressRows)
  const coAverage     = coAvg(state.coResults)
  const ceAverage     = ceAvg(state.ceResults)
  const eeAverage     = computeAverageEeScore(state.eeSubmissions)
  const eoAverage     = computeAverageEoScore(state.eoSubmissions)

  const value = {
    ...state,
    refresh,
    completionPct,
    activeDay,
    coAverage,
    ceAverage,
    eeAverage,
    eoAverage,
  }

  return (
    <ChallengeDataContext.Provider value={value}>
      {children}
    </ChallengeDataContext.Provider>
  )
}

export function useChallengeDataContext() {
  const ctx = useContext(ChallengeDataContext)
  if (ctx === undefined) {
    throw new Error('useChallengeDataContext must be used within ChallengeDataProvider')
  }
  return ctx
}
