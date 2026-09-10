import { Navigate } from 'react-router-dom'
import { ShieldAlert, LogOut, GraduationCap, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toastError } from '../lib/errorMessages'
import { getAdminWhatsAppUrl, hasAdminWhatsApp } from '../lib/appLinks'

export default function SuspendedAccount() {
  const { isAuthenticated, isSuspended, signOut, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isSuspended) return <Navigate to="/dashboard" replace />

  const waUrl = getAdminWhatsAppUrl(
    `Bonjour, mon compte TCF 41 Challenge (${user?.email || 'sans email'}) est suspendu. Je souhaite contacter un administrateur.`
  )

  async function handleSignOut() {
    try {
      await signOut()
    } catch (err) {
      toastError(err, 'Impossible de se déconnecter')
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
          L&apos;accès de <span className="font-semibold text-white">{user?.email}</span> a été suspendu par un
          administrateur. Si tu penses qu&apos;il s&apos;agit d&apos;une erreur, contacte l&apos;équipe via WhatsApp.
        </p>

        <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-[#1ebe57]"
            >
              <MessageCircle size={18} />
              Contacter l&apos;admin sur WhatsApp
            </a>
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
              WhatsApp admin non configuré. Ajoute <code className="text-white/80">VITE_ADMIN_WHATSAPP</code> dans le
              fichier <code className="text-white/80">.env</code> (ex. 2376XXXXXXXX).
            </p>
          )}

          <button
            onClick={handleSignOut}
            className="btn-secondary !bg-white/10 !text-white hover:!bg-white/20"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>

        {hasAdminWhatsApp() && (
          <p className="max-w-sm text-[11px] text-white/40">
            Le message s&apos;ouvre dans WhatsApp avec ton email déjà prérempli. Réponse sous réserve de disponibilité de
            l&apos;équipe.
          </p>
        )}
      </div>
    </div>
  )
}
