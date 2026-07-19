import { useEffect, useState, useCallback } from 'react'
import { Timer } from 'lucide-react'
import clsx from 'clsx'

const DEFAULT_DURATION_SECONDS = 60 * 60

/**
 * Shared exam countdown. Persists start time in localStorage under `storageKey`
 * so the timer survives page refreshes/navigation between tasks and stays
 * accurate (based on wall-clock elapsed time, not a naive setInterval count).
 *
 * `armed` gates everything: the countdown does not read or write
 * localStorage, and does not tick, until `armed` becomes true. This is
 * deliberate — previously the timer started (and persisted a start time)
 * the instant this component mounted, i.e. the instant a student merely
 * opened a sujet to look at it. If they came back more than 60 minutes
 * later without ever having written anything, the stored timestamp already
 * looked expired, causing an immediate false "Temps écoulé", an auto-submit
 * of empty content, and the workspace silently closing the sujet out from
 * under them. The parent now only sets `armed` true once the student has
 * actually typed something, so the clock reflects real writing time.
 */
export default function ExamTimer({ storageKey, armed = true, onExpire, durationSeconds = DEFAULT_DURATION_SECONDS }) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const [expired, setExpired] = useState(false)

  const getStartTime = useCallback(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) return Number(stored)
    const now = Date.now()
    localStorage.setItem(storageKey, String(now))
    return now
  }, [storageKey])

  useEffect(() => {
    if (!armed) return

    const startTime = getStartTime()

    function tick() {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, durationSeconds - elapsed)
      setSecondsLeft(remaining)
      if (remaining === 0) {
        setExpired(true)
        onExpire?.()
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [armed, getStartTime, onExpire, durationSeconds])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isLow = armed && secondsLeft <= Math.min(5 * 60, Math.floor(durationSeconds / 4))

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold tabular-nums',
        expired
          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
          : isLow
          ? 'animate-pulse bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
          : !armed
          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
          : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
      )}
      title={!armed ? "Le chrono démarre dès que tu commences à écrire" : undefined}
    >
      <Timer size={16} />
      {expired ? 'Temps écoulé' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
    </div>
  )
}

export function clearExamTimer(storageKey) {
  localStorage.removeItem(storageKey)
}
