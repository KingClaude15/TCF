import { useEffect, useRef, useCallback } from 'react'

/**
 * Calls `onIdle` after `timeoutMs` with no user activity.
 * Optionally calls `onWarn` once when `timeoutMs - warnBeforeMs` elapses.
 * Activity listeners reset both timers.
 *
 * @param {object} options
 * @param {boolean} options.enabled
 * @param {number} options.timeoutMs - total idle time before logout
 * @param {number} [options.warnBeforeMs] - warn this long before timeout (0 = no warn)
 * @param {() => void} options.onIdle
 * @param {() => void} [options.onWarn]
 * @param {() => void} [options.onActivity] - fired when user becomes active again after warn
 */
export function useIdleTimeout({
  enabled,
  timeoutMs,
  warnBeforeMs = 0,
  onIdle,
  onWarn,
  onActivity,
}) {
  const onIdleRef = useRef(onIdle)
  const onWarnRef = useRef(onWarn)
  const onActivityRef = useRef(onActivity)
  const idleTimerRef = useRef(null)
  const warnTimerRef = useRef(null)
  const warnedRef = useRef(false)

  useEffect(() => {
    onIdleRef.current = onIdle
    onWarnRef.current = onWarn
    onActivityRef.current = onActivity
  }, [onIdle, onWarn, onActivity])

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current)
      warnTimerRef.current = null
    }
  }, [])

  const startTimers = useCallback(() => {
    clearTimers()
    if (!enabled || timeoutMs <= 0) return

    const warnAt = warnBeforeMs > 0 && warnBeforeMs < timeoutMs ? timeoutMs - warnBeforeMs : null

    if (warnAt != null) {
      warnTimerRef.current = setTimeout(() => {
        warnedRef.current = true
        onWarnRef.current?.()
      }, warnAt)
    }

    idleTimerRef.current = setTimeout(() => {
      onIdleRef.current?.()
    }, timeoutMs)
  }, [enabled, timeoutMs, warnBeforeMs, clearTimers])

  const reset = useCallback(() => {
    if (!enabled) return
    if (warnedRef.current) {
      warnedRef.current = false
      onActivityRef.current?.()
    }
    startTimers()
  }, [enabled, startTimers])

  useEffect(() => {
    if (!enabled) {
      clearTimers()
      warnedRef.current = false
      return
    }

    startTimers()

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel']
    // Throttle mousemove so we don't reset 60 times/sec
    let lastMove = 0
    function onEvent(e) {
      if (e.type === 'mousemove') {
        const now = Date.now()
        if (now - lastMove < 1000) return
        lastMove = now
      }
      reset()
    }

    function onVisibility() {
      // When user returns to the tab, treat as activity and reset
      if (document.visibilityState === 'visible') reset()
    }

    events.forEach((ev) => window.addEventListener(ev, onEvent, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearTimers()
      events.forEach((ev) => window.removeEventListener(ev, onEvent))
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled, startTimers, reset, clearTimers])
}

/** Default: 30 minutes idle → logout; warn 2 minutes before */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000
export const IDLE_WARN_BEFORE_MS = 2 * 60 * 1000
