import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-surface-dark/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <GraduationCap size={18} />
          </div>
          <span className="font-heading text-sm font-bold text-ink-900 dark:text-white">TCF 41-Day Challenge</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-outline !px-3.5 !py-2 text-sm">
            Connexion
          </Link>
          <Link to="/signup" className="btn-primary !px-3.5 !py-2 text-sm">
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  )
}
