import { toastError } from '../../lib/errorMessages'
import { Menu, Sun, Moon, LogOut, ChevronDown, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'

export default function Topbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      toastError(err, 'Erreur lors de la déconnexion')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/85 px-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-surface-dark/85 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-heading text-base font-bold text-ink-900 dark:text-white sm:text-lg">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-bold text-white ring-2 ring-white dark:ring-surface-dark">
              {(user?.email?.[0] || 'U').toUpperCase()}
            </span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-cardHover dark:border-slate-800 dark:bg-surface-darkCard animate-fadeIn">
                <p className="truncate border-b border-slate-100 px-4 py-2.5 text-xs text-slate-400 dark:border-slate-800">{user?.email}</p>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <UserRound size={16} /> Mon profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
