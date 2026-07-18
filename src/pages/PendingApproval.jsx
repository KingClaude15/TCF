import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { Clock3, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { notifyAdminNewSignup } from '../services/notifyService'

const FRESH_SIGNUP_WINDOW_MS = 5 * 60 * 1000 // only notify if the account was created in the last 5 minutes

export default function PendingApproval() {
  const { isAuthenticated, isPending, isSuspended, signOut, user, profile } = useAuth()
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (!isPending || !profile?.created_at || notifiedRef.current) return
    const ageMs = Date.now() - new Date(profile.created_at).getTime()
    if (ageMs < FRESH_SIGNUP_WINDOW_MS) {
      notifiedRef.current = true
      notifyAdminNewSignup({ fullName: profile.full_name, email: profile.email || user?.email })
    }
  }, [isPending, profile, user])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isSuspended) return <Navigate to="/suspended" replace />
  if (!isPending) return <Navigate to="/dashboard" replace />

  async function handleSignOut() {
    try {
      await signOut()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-ink-900 px-4 text-center">
      <div className="page-hero absolute inset-0 !rounded-none !border-0 !shadow-none" />
      <div className="relative flex flex-col items-center gap-4 animate-fadeIn">
        <div className="flex items-center gap-2 text-white/50">
          <GraduationCap size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">TCF 41-Day Challenge</span>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30">
          <Clock3 size={30} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white">Compte en attente de validation</h1>
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          Merci de t'être inscrit avec <span className="font-semibold text-white">{user?.email}</span> ! Un administrateur doit
          approuver ton compte avant que tu puisses accéder au défi TCF 41 jours. Cela ne prend généralement pas
          longtemps — reviens un peu plus tard.
        </p>
        <button onClick={handleSignOut} className="btn-secondary mt-2 !bg-white/10 !text-white hover:!bg-white/20">
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </div>
  )
}
