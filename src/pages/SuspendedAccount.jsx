import { Navigate } from 'react-router-dom'
import { ShieldAlert, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function SuspendedAccount() {
  const { isAuthenticated, isSuspended, signOut, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isSuspended) return <Navigate to="/dashboard" replace />

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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/15 text-red-300 ring-1 ring-red-400/30">
          <ShieldAlert size={30} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white">Compte suspendu</h1>
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          L'accès de <span className="font-semibold text-white">{user?.email}</span> a été suspendu par un administrateur. Si tu
          penses qu'il s'agit d'une erreur, contacte l'équipe qui gère la plateforme.
        </p>
        <button onClick={handleSignOut} className="btn-secondary mt-2 !bg-white/10 !text-white hover:!bg-white/20">
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>
    </div>
  )
}
