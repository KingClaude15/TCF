import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Clock, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  useIdleTimeout,
  IDLE_TIMEOUT_MS,
  IDLE_WARN_BEFORE_MS,
} from '../../hooks/useIdleTimeout'

/**
 * When the user is logged in, ends the session after IDLE_TIMEOUT_MS
 * of no mouse/keyboard/touch activity. Shows a 2-minute warning modal first.
 *
 * Mount once inside the authenticated app shell (e.g. AppLayout).
 */
export default function IdleSessionGuard() {
  const { isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()
  const [showWarning, setShowWarning] = useState(false)

  const handleIdle = useCallback(async () => {
    setShowWarning(false)
    try {
      await signOut()
    } catch {
      // still force local logout UX
    }
    toast.error('Session terminée pour inactivité. Reconnecte-toi pour continuer.')
    navigate('/login', { replace: true })
  }, [signOut, navigate])

  const handleWarn = useCallback(() => {
    setShowWarning(true)
  }, [])

  const handleActivity = useCallback(() => {
    setShowWarning(false)
  }, [])

  useIdleTimeout({
    enabled: isAuthenticated,
    timeoutMs: IDLE_TIMEOUT_MS,
    warnBeforeMs: IDLE_WARN_BEFORE_MS,
    onIdle: handleIdle,
    onWarn: handleWarn,
    onActivity: handleActivity,
  })

  async function staySignedIn() {
    setShowWarning(false)
    // Activity is also reset by the click event on the button
  }

  async function logoutNow() {
    setShowWarning(false)
    try {
      await signOut()
    } catch { /* ignore */ }
    navigate('/login', { replace: true })
  }

  if (!showWarning) return null

  const minutes = Math.round(IDLE_TIMEOUT_MS / 60000)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-surface-darkCard">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
          <Clock size={22} />
        </div>
        <h2 id="idle-title" className="mt-4 text-center font-heading text-lg font-bold text-ink-900 dark:text-white">
          Toujours là ?
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          Aucune activité depuis un moment. Ta session sera fermée dans moins de{' '}
          <strong>2 minutes</strong> pour protéger ton compte
          {minutes ? ` (délai total d’inactivité : ${minutes} min)` : ''}.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={staySignedIn} className="btn-primary flex-1 sm:flex-none">
            Rester connecté
          </button>
          <button
            type="button"
            onClick={logoutNow}
            className="btn-outline inline-flex flex-1 items-center justify-center gap-1.5 sm:flex-none"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
