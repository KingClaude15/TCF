import { Link } from 'react-router-dom'
import { Flame, CalendarCheck2, Headphones, BookOpen, PenLine, TrendingUp, ArrowRight, Brain } from 'lucide-react'
import { useChallengeData } from '../hooks/useChallengeData'
import StatCard from '../components/ui/StatCard'
import ProgressBar from '../components/ui/ProgressBar'
import EmptyState from '../components/ui/EmptyState'

export default function Dashboard() {
  const { loading, profile, progressRows, coResults, ceResults, completionPct, activeDay, coAverage, ceAverage, eeAverage } =
    useChallengeData()

  if (loading) return <DashboardSkeleton />
  if (!profile) return null

  const today = progressRows.find((p) => p.day_number === activeDay)
  const recentActivity = [...coResults, ...ceResults]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="eyebrow">Tableau de bord</p>
        <h2 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
          Bonjour{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Jour {activeDay} sur 41 — continue sur ta lancée.
        </p>
      </div>

      {/* Continue today's challenge — hero banner */}
      <div className="page-hero bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900 p-6 sm:p-8">
        <img
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=60"
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchpriority="low"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/40 via-transparent to-transparent" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow !text-white/70">Aujourd'hui</p>
            <h3 className="mt-1 font-heading text-xl font-bold text-white sm:text-2xl">
              Jour {activeDay} — {today?.is_complete ? 'Terminé ✓' : 'À compléter'}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <ModuleChip label="CO" done={today?.co_done} />
              <ModuleChip label="CE" done={today?.ce_done} />
              <ModuleChip label="EE" done={today?.ee_done} />
            </div>
          </div>
          <Link to="/calendar" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand-50">
            Continuer <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck2} label="Jour actuel" value={`${activeDay} / 41`} accent="brand" />
        <StatCard icon={Flame} label="Série (streak)" value={`${profile.current_streak} jours`} sublabel={`Record : ${profile.longest_streak}`} accent="amber" />
        <StatCard icon={TrendingUp} label="Complétion globale" value={`${completionPct}%`} accent="brand" />
        <StatCard icon={PenLine} label="Score EE moyen" value={eeAverage ?? '—'} sublabel="sur 20" accent="ee" />
      </div>

      {/* Progress Coach teaser */}
      <Link to="/progress-coach" className="card card-hover flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <Brain size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-white">Voir mon analyse de préparation</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tendances hebdomadaires et prédiction générées par ton coach IA</p>
          </div>
        </div>
        <ArrowRight size={18} className="shrink-0 text-slate-400" />
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Headphones} label="Score CO moyen" value={coAverage ?? '—'} sublabel="sur 699" accent="co" />
        <StatCard icon={BookOpen} label="Score CE moyen" value={ceAverage ?? '—'} sublabel="sur 699" accent="ce" />
        <div className="card p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Progression du défi</p>
          <ProgressBar value={completionPct} color="brand" size="lg" />
          <p className="mt-2 text-xs text-slate-400">{progressRows.filter((r) => r.is_complete).length} / 41 jours complétés</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Activité récente</h3>
        {recentActivity.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="Aucune activité pour l'instant"
            description="Commence ta première série CO ou CE pour voir ton activité ici."
            action={
              <Link to="/calendar" className="btn-primary mt-2">
                Démarrer le défi
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${'series_number' in r && r.max_score ? (coResults.includes(r) ? 'bg-co-DEFAULT' : 'bg-ce-DEFAULT') : 'bg-brand-500'}`} />
                  Série {r.series_number} — {r.score}/{r.max_score}
                </span>
                <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ModuleChip({ label, done }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        done ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
      }`}
    >
      {done ? '✓' : '○'} {label}
    </span>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-64 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl2 bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  )
}
