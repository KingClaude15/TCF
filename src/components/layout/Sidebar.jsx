import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Headphones,
  BookOpen,
  PenLine,
  BarChart3,
  Sparkles,
  UserRound,
  ShieldCheck,
  GraduationCap,
  Brain,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

const NAV_GROUPS = [
  {
    label: 'Vue d’ensemble',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/calendar', label: 'Calendrier du défi', icon: CalendarDays },
    ],
  },
  {
    label: 'Épreuves',
    items: [
      { to: '/co', label: 'Compréhension Orale', icon: Headphones },
      { to: '/ce', label: 'Compréhension Écrite', icon: BookOpen },
      { to: '/ee', label: 'Expression Écrite', icon: PenLine },
    ],
  },
  {
    label: 'Progression',
    items: [
      { to: '/learning-center', label: "Centre d'apprentissage", icon: GraduationCap },
      { to: '/progress-coach', label: 'Coach IA', icon: Brain },
      { to: '/statistics', label: 'Statistiques', icon: BarChart3 },
      { to: '/recommendations', label: 'Recommandations', icon: Sparkles },
    ],
  },
  {
    label: 'Compte',
    items: [{ to: '/profile', label: 'Profil', icon: UserRound }],
  },
]

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth()
  const groups = isAdmin
    ? [...NAV_GROUPS, { label: 'Administration', items: [{ to: '/admin', label: 'Console admin', icon: ShieldCheck }] }]
    : NAV_GROUPS

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-surface-darkCard lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-sm ring-1 ring-brand-900/10">
              <GraduationCap size={20} strokeWidth={2.25} />
            </div>
            <div>
              <p className="font-heading text-sm font-bold leading-tight text-ink-900 dark:text-white">TCF Challenge</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Programme de 41 jours</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3.5 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center gap-3 rounded-lg border-l-[3px] px-3.5 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      )
                    }
                  >
                    <Icon size={18} strokeWidth={2} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-50 to-transparent px-3 py-2.5 text-xs font-semibold text-brand-700 dark:from-brand-950/40 dark:text-brand-300">
            <span aria-hidden="true">🇨🇦</span> Objectif TCF Canada
          </div>
        </div>
      </aside>
    </>
  )
}
