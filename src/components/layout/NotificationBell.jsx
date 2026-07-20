import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from '../../services/notificationsService'

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs} h`
  return `il y a ${Math.floor(hrs / 24)} j`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const unsubRef = useRef(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    listNotifications(user.id)
      .then((rows) => {
        if (!cancelled) setNotifications(rows)
      })
      .finally(() => !cancelled && setLoading(false))

    unsubRef.current = subscribeToNotifications(user.id, (row) => {
      setNotifications((prev) => [row, ...prev])
      toast(row.title, { icon: row.type === 'eval_error' ? '⚠️' : '✅' })
    })

    return () => {
      cancelled = true
      unsubRef.current?.()
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function handleClick(notif) {
    setOpen(false)
    if (!notif.read) {
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
      markNotificationRead(notif.id).catch(() => {})
    }
    if (notif.link) navigate(notif.link)
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    if (user) markAllNotificationsRead(user.id).catch(() => {})
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-cardHover dark:border-slate-800 dark:bg-surface-darkCard animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="px-4 py-6 text-center text-sm text-slate-400">Chargement...</p>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-400">
                  Aucune notification pour l'instant. Tu seras prévenu ici dès qu'une correction sera prête.
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex w-full items-start gap-2.5 border-b border-slate-50 px-4 py-3 text-left text-sm last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/50 ${
                      !n.read ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''
                    }`}
                  >
                    {n.type === 'eval_error' ? (
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    ) : (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug">{n.title}</span>
                      {n.body && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{n.body}</span>}
                      <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.created_at)}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
