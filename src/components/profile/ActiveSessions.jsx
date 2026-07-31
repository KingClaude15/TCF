import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Monitor, Smartphone, Tablet, Loader2, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toastError } from '../../lib/errorMessages'
import { listMySessions, revokeSession, signOutOtherSessions, getCurrentSessionId } from '../../services/sessionsService'

/**
 * Deliberately lightweight, regex-based UA parsing — good enough to show
 * "Chrome sur Windows" / "Safari sur iPhone" for the common cases, rather
 * than pulling in a UA-parsing dependency for what's a nice-to-have label.
 * Falls back to a generic label if nothing matches, never throws.
 */
function describeDevice(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') {
    return { label: 'Appareil inconnu', Icon: Monitor }
  }
  const ua = userAgent

  let os = 'un appareil inconnu'
  if (/iphone/i.test(ua)) os = 'iPhone'
  else if (/ipad/i.test(ua)) os = 'iPad'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/mac os/i.test(ua)) os = 'Mac'
  else if (/windows/i.test(ua)) os = 'Windows'
  else if (/linux/i.test(ua)) os = 'Linux'

  let browser = 'un navigateur'
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = 'Chrome'
  else if (/firefox\//i.test(ua)) browser = 'Firefox'
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = 'Safari'

  const isMobile = /iphone|android.*mobile/i.test(ua)
  const isTablet = /ipad|android(?!.*mobile)/i.test(ua)
  const Icon = isMobile ? Smartphone : isTablet ? Tablet : Monitor

  return { label: `${browser} sur ${os}`, Icon }
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.round(hours / 24)
  return `il y a ${days} j`
}

export default function ActiveSessions() {
  const { session } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [signingOutOthers, setSigningOutOthers] = useState(false)

  const currentSessionId = getCurrentSessionId(session?.access_token)

  async function load() {
    setLoading(true)
    try {
      setSessions(await listMySessions())
    } catch (err) {
      toastError(err, 'Impossible de charger tes sessions actives')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRevoke(s) {
    if (!confirm('Déconnecter cet appareil ? Il devra se reconnecter pour accéder à ton compte.')) return
    setBusyId(s.id)
    try {
      await revokeSession(s.id)
      toast.success('Appareil déconnecté')
      await load()
    } catch (err) {
      toastError(err, "Impossible de déconnecter cet appareil")
    } finally {
      setBusyId(null)
    }
  }

  async function handleSignOutOthers() {
    if (!confirm('Déconnecter tous les autres appareils ? Cet appareil-ci restera connecté.')) return
    setSigningOutOthers(true)
    try {
      await signOutOtherSessions()
      toast.success('Tous les autres appareils ont été déconnectés')
      await load()
    } catch (err) {
      toastError(err, 'Impossible de déconnecter les autres appareils')
    } finally {
      setSigningOutOthers(false)
    }
  }

  const otherSessionsCount = sessions.filter((s) => s.id !== currentSessionId).length

  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-bold text-ink-900 dark:text-white">Sessions actives</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Les appareils actuellement connectés à ton compte.</p>
        </div>
        {otherSessionsCount > 0 && (
          <button onClick={handleSignOutOthers} disabled={signingOutOthers} className="btn-secondary !text-xs">
            {signingOutOthers ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
            Déconnecter les autres
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-400">Aucune session active trouvée.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => {
            const isCurrent = s.id === currentSessionId
            const { label, Icon } = describeDevice(s.user_agent)
            return (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900 dark:text-white">
                      {label}
                      {isCurrent && (
                        <span className="badge bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <ShieldCheck size={10} /> Cet appareil
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {s.updated_at || s.refreshed_at
                        ? `Actif ${timeAgo(s.updated_at || s.refreshed_at)}`
                        : s.created_at
                        ? `Connecté ${timeAgo(s.created_at)}`
                        : null}
                      {s.ip ? ` · ${s.ip}` : ''}
                    </p>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRevoke(s)}
                    disabled={busyId === s.id}
                    className="rounded-md p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    title="Déconnecter cet appareil"
                  >
                    {busyId === s.id ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
