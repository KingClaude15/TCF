import { useEffect, useState } from 'react'
import { useChallengeData } from '../hooks/useChallengeData'
import { buildRecommendations } from '../services/recommendationEngine'
import { listEarnedAchievements, listCatalog } from '../services/achievementsService'
import { useAuth } from '../context/AuthContext'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { Sparkles, Award, Lock } from 'lucide-react'
import clsx from 'clsx'

const PRIORITY_STYLES = {
  high: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30',
  medium: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
  low: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
}
const PRIORITY_LABELS = { high: 'Priorité haute', medium: 'Priorité moyenne', low: 'Info' }

export default function Recommendations() {
  const { user } = useAuth()
  const { loading, coResults, ceResults, eeSubmissions, progressRows } = useChallengeData()
  const [earned, setEarned] = useState([])
  const [catalog, setCatalog] = useState([])

  useEffect(() => {
    if (!user) return
    listEarnedAchievements(user.id).then(setEarned).catch(() => {})
    listCatalog().then(setCatalog).catch(() => {})
  }, [user])

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const recommendations = buildRecommendations({ coResults, ceResults, eeSubmissions, progressRows })
  const earnedCodes = new Set(earned.map((a) => a.code))

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Sparkles}
        eyebrow="Personnalisé pour toi"
        title="Recommandations"
        subtitle="Conseils personnalisés basés sur ta progression et tes points faibles récents."
        accent="ce"
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80"
      />

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Pas encore assez de données"
            description="Complète quelques séries CO, CE et EE pour recevoir des recommandations personnalisées."
          />
        ) : (
          recommendations.map((r, idx) => (
            <div key={idx} className={clsx('card rounded-xl2 border p-4', PRIORITY_STYLES[r.priority])}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{r.category}</span>
                <span className="text-[11px] font-semibold text-slate-400">{PRIORITY_LABELS[r.priority]}</span>
              </div>
              <h3 className="text-sm font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.detail}</p>
            </div>
          ))
        )}
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <Award size={18} className="text-amber-500" /> Badges
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((badge) => {
            const isEarned = earnedCodes.has(badge.code)
            return (
              <div
                key={badge.code}
                className={clsx(
                  'card flex flex-col items-center gap-2 p-4 text-center',
                  !isEarned && 'opacity-50 grayscale'
                )}
              >
                <div
                  className={clsx(
                    'flex h-12 w-12 items-center justify-center rounded-full',
                    isEarned ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  )}
                >
                  {isEarned ? <Award size={22} /> : <Lock size={20} />}
                </div>
                <p className="text-xs font-semibold">{badge.title}</p>
                <p className="text-[11px] text-slate-400">{badge.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
