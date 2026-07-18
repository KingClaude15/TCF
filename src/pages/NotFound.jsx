import { Link } from 'react-router-dom'
import { GraduationCap, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-3 overflow-hidden bg-ink-900 px-4 text-center">
      <div className="page-hero absolute inset-0 !rounded-none !border-0 !shadow-none" />
      <div className="relative flex flex-col items-center gap-3 animate-fadeIn">
        <div className="flex items-center gap-2 text-white/50">
          <GraduationCap size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">TCF 41-Day Challenge</span>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
          <Compass size={26} />
        </div>
        <p className="font-heading text-6xl font-bold text-white">404</p>
        <p className="text-white/60">Cette page n'existe pas.</p>
        <Link to="/dashboard" className="btn-primary mt-2">Retour au dashboard</Link>
      </div>
    </div>
  )
}
