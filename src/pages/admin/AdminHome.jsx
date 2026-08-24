import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { ShieldCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

const TABS = [
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/activity', label: 'Activité' },
  { to: '/admin/payments', label: 'Paiements' },
  { to: '/admin/sujets', label: 'Sujets EE' },
  { to: '/admin/eo', label: 'Sujets EO' },
  { to: '/admin/co', label: 'Séries CO' },
  { to: '/admin/ce', label: 'Séries CE' },
]

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Console administrateur"
        title="Panneau d'administration"
        subtitle="Gère les utilisateurs, valide les accès et administre le contenu pédagogique de la plateforme."
        accent="gold"
      />

      <div className="flex gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              clsx(
                'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  )
}
