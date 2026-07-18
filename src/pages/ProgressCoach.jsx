import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles, Gauge } from 'lucide-react'
import clsx from 'clsx'
import { useChallengeData } from '../hooks/useChallengeData'
import { predictReadiness, buildCoachInsights } from '../services/progressCoachService'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'

const STATUS_STYLES = {
  ahead: { label: 'En avance', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  on_track: { label: 'Sur la bonne voie', className: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' },
  at_risk: { label: 'À risque', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  no_target: { label: 'Objectif non défini', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800' },
  no_data: { label: 'Pas de données', className: 'bg-slate-100 text-slate-400 dark:bg-slate-800' },
  insufficient_data: { label: 'Données insuffisantes', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800' },
}

const MODULE_COLORS = { CO: '#0ea5e9', CE: '#8b5cf6', EE: '#ec4899' }

const TONE_STYLES = {
  positive: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
  neutral: 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30',
}
const TONE_ICONS = { positive: TrendingUp, warning: AlertTriangle, neutral: Minus }

export default function ProgressCoach() {
  const { loading, profile, progressRows, coResults, ceResults, eeSubmissions } = useChallengeData()

  const readiness = useMemo(
    () => predictReadiness({ profile, progressRows, coResults, ceResults, eeSubmissions }),
    [profile, progressRows, coResults, ceResults, eeSubmissions]
  )
  const insights = useMemo(
    () => buildCoachInsights({ profile, progressRows, coResults, ceResults, eeSubmissions }),
    [profile, progressRows, coResults, ceResults, eeSubmissions]
  )

  if (loading) return <div className="h-96 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const hasAnyData = coResults.length > 0 || ceResults.length > 0 || eeSubmissions.some((s) => s.ai_feedback?.[0])

  if (!hasAnyData) {
    return (
      <EmptyState
        icon={Brain}
        title="Ton coach n'a pas encore assez de données"
        description="Complète quelques séries CO, CE et fais évaluer une rédaction EE — ton coach détectera automatiquement tes tendances et prédira ta préparation."
        action={
          <Link to="/co" className="btn-primary mt-2">
            Commencer une série
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Brain}
        eyebrow="Analyse intelligente"
        title="Coach de progression IA"
        subtitle="Détection de tendances sur plusieurs semaines et prédiction de ta préparation à l'examen."
        accent="brand"
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80"
      />

      {/* Headline readiness card */}
      <div className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Gauge size={16} className="text-brand-500" /> Prédiction de préparation
          </span>
          <span className={clsx('rounded-full px-3 py-1 text-xs font-bold', STATUS_STYLES[readiness.overallStatus].className)}>
            {STATUS_STYLES[readiness.overallStatus].label}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{readiness.narrative}</p>
        {readiness.paceDaysPerWeek !== null && (
          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
            <span>Rythme actuel : ~{readiness.paceDaysPerWeek} jour(s)/semaine</span>
            <span>{readiness.daysCompleted}/41 jours complétés</span>
            {readiness.weeksRemaining !== null && <span>~{readiness.weeksRemaining} semaine(s) restantes au rythme actuel</span>}
          </div>
        )}
      </div>

      {/* Per-module readiness + trend charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Object.values(readiness.modules).map((m) => (
          <ModuleReadinessCard key={m.label} module={m} color={MODULE_COLORS[m.label]} />
        ))}
      </div>

      {/* Coach insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Observations du coach</h3>
          <div className="space-y-2.5">
            {insights.map((insight, i) => {
              const Icon = TONE_ICONS[insight.tone]
              return (
                <div key={i} className={clsx('card flex items-start gap-3 rounded-xl2 border p-4', TONE_STYLES[insight.tone])}>
                  <Icon size={18} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
                  <div>
                    <h4 className="text-sm font-semibold">{insight.title}</h4>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{insight.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card flex items-start gap-3 p-4 text-xs text-slate-400">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <p>
          Ces prédictions sont calculées à partir de tes propres données (aucun appel externe) : moyenne pondérée par
          semaine, tendance récente, et objectif défini dans ton profil. Elles donnent une estimation, pas une garantie
          — considère-les comme une boussole, pas un score final.
        </p>
      </div>
    </div>
  )
}

function ModuleReadinessCard({ module: m, color }) {
  const style = STATUS_STYLES[m.status]
  const DirectionIcon = m.trend.direction === 'up' ? TrendingUp : m.trend.direction === 'down' ? TrendingDown : Minus

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color }}>{m.label}</span>
        <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-bold', style.className)}>{style.label}</span>
      </div>

      {m.status === 'no_data' ? (
        <p className="text-xs text-slate-400">Pas encore de résultats {m.label}.</p>
      ) : (
        <>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-[11px] text-slate-400">Actuel</p>
              <p className="text-xl font-bold">{m.currentAvgPct}%</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Projeté (jour 41)</p>
              <p className="text-xl font-bold" style={{ color }}>{m.projectedPct}%</p>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: m.trend.direction === 'up' ? '#10b981' : m.trend.direction === 'down' ? '#ef4444' : '#94a3b8' }}>
              <DirectionIcon size={14} />
              {m.trend.slopePerWeek > 0 ? '+' : ''}
              {m.trend.slopePerWeek}%/sem
            </div>
          </div>

          {m.trend.weeks.length >= 2 ? (
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={m.trend.weeks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="week" hide />
                <YAxis hide domain={[0, 100]} />
                {m.targetPct !== null && <ReferenceLine y={m.targetPct} stroke="#94a3b8" strokeDasharray="4 4" />}
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Moyenne']}
                  labelFormatter={(w) => `Semaine du ${w}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="avg" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400">Pratique encore une semaine pour voir ta tendance apparaître ici.</p>
          )}
        </>
      )}
    </div>
  )
}
