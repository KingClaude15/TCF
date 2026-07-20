import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChallengeData } from '../hooks/useChallengeData'
import { upsertCoResult, identifyWeakAreas } from '../services/coService'
import { listPublishedCoSeries } from '../services/coSeriesService'
import { markDayModule } from '../services/progressService'
import { toastError } from '../lib/errorMessages'
import { coCeScoreToCecr, CO_CE_MAX_POINTS } from '../lib/tcfScoring'
import { CEFR_BAND_STYLES } from '../lib/cecrBands'
import SeriesForm from '../components/co/SeriesForm'
import SeriesHistory from '../components/co/SeriesHistory'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  Headphones, Target, AlertTriangle,
  CheckCircle2, Circle, PlayCircle, Lock, TrendingUp,
} from 'lucide-react'

// CECRL band thresholds for CO/CE /699
const NCLC_BANDS = [
  { min: 600, max: 699, cefr: 'C2', label: 'C2',    color: 'text-emerald-600', bar: 'bg-emerald-500' },
  { min: 500, max: 599, cefr: 'C1', label: 'C1',    color: 'text-teal-600',    bar: 'bg-teal-500' },
  { min: 400, max: 499, cefr: 'B2', label: 'B2',    color: 'text-brand-600',   bar: 'bg-brand-500' },
  { min: 300, max: 399, cefr: 'B1', label: 'B1',    color: 'text-sky-600',     bar: 'bg-sky-500' },
  { min: 200, max: 299, cefr: 'A2', label: 'A2',    color: 'text-amber-600',   bar: 'bg-amber-500' },
  { min: 100, max: 199, cefr: 'A1', label: 'A1',    color: 'text-orange-600',  bar: 'bg-orange-500' },
  { min: 0,   max: 99,  cefr: 'A1 non atteint', label: '< A1', color: 'text-red-600', bar: 'bg-red-400' },
]

export default function CO() {
  const { user }      = useAuth()
  const navigate      = useNavigate()
  const { loading, coResults, coAverage, activeDay, refresh } = useChallengeData()
  const [busy,        setBusy]        = useState(false)
  const [bank,        setBank]        = useState([])
  const [bankLoading, setBankLoading] = useState(true)

  useEffect(() => {
    listPublishedCoSeries()
      .then(setBank)
      .finally(() => setBankLoading(false))
  }, [])

  async function handleSubmit(payload) {
    setBusy(true)
    try {
      await upsertCoResult(user.id, { ...payload, day_number: payload.day_number || activeDay })
      await markDayModule(user.id, payload.day_number || activeDay, 'co_done')
      toast.success('Résultat CO enregistré !')
      await refresh()
    } catch (err) {
      toastError(err, 'Impossible de soumettre les résultats CO')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
    </div>
  )

  const weakAreas         = identifyWeakAreas(coResults)
  const doneSeriesNumbers = new Set(coResults.map(r => r.series_number))

  // Compute average on /699 scale — normalise legacy /39 rows
  const avgPts = coResults.length
    ? Math.round(
        coResults.reduce((sum, r) => {
          const raw = Number(r.score)
          const max = Number(r.max_score || CO_CE_MAX_POINTS)
          return sum + (max === CO_CE_MAX_POINTS ? raw : Math.round((raw / max) * CO_CE_MAX_POINTS))
        }, 0) / coResults.length
      )
    : null
  const avgCefr = avgPts !== null ? coCeScoreToCecr(avgPts) : null

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Headphones}
        eyebrow="Épreuve 1"
        title="Compréhension Orale"
        subtitle="Séries d'écoute chronométrées avec correction automatique, fidèles au format de l'examen officiel. Score sur 699 points."
        accent="co"
        image="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=60"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Headphones}
          label="Séries complétées"
          value={`${coResults.length} / ${bank.length || '—'}`}
          accent="co"
          progress={bank.length ? (coResults.length / bank.length) * 100 : undefined}
        />
        <StatCard
          icon={Target}
          label="Score moyen"
          value={avgPts !== null ? `${avgPts}` : '—'}
          sublabel={`/ ${CO_CE_MAX_POINTS} pts${avgCefr ? ` · ${avgCefr}` : ''}`}
          accent="co"
        />
        <StatCard
          icon={AlertTriangle}
          label="Points faibles"
          value={weakAreas.length}
          sublabel="séries < 60%"
          accent="amber"
        />
      </div>

      {/* CECRL scale visual */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-ink-900 dark:text-white">Barème officiel CO — /699 points</p>
            <p className="text-xs text-slate-400 mt-0.5">Correspondance CECRL selon France Éducation International</p>
          </div>
          {avgPts !== null && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Votre moyenne</p>
              <p className="font-heading text-lg font-bold text-co-DEFAULT">{avgPts} pts</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {NCLC_BANDS.map(band => {
            const isCurrentBand = avgPts !== null && avgPts >= band.min && avgPts <= band.max
            const bandPct = ((band.max - band.min + 1) / CO_CE_MAX_POINTS) * 100
            return (
              <div key={band.cefr}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  isCurrentBand
                    ? 'bg-co-light dark:bg-sky-950/40 ring-1 ring-co-DEFAULT/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                )}
              >
                <span className={clsx(
                  'w-7 text-center text-xs font-bold flex-shrink-0',
                  isCurrentBand ? 'text-co-DEFAULT' : band.color
                )}>
                  {band.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={clsx('h-full rounded-full', band.bar)} style={{ width: `${bandPct * 2.5}%` }} />
                </div>
                <span className="text-[11px] text-slate-400 w-24 text-right tabular-nums flex-shrink-0">
                  {band.min} – {band.max}
                </span>
                {isCurrentBand && (
                  <span className="badge bg-co-light text-co-dark dark:bg-sky-950 dark:text-sky-300 text-[10px] flex-shrink-0">
                    Votre niveau
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Series bank */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Banque de séries</h3>
            <p className="section-sub">Sélectionnez une série pour démarrer l'écoute et répondre aux questions</p>
          </div>
          {bank.length > 0 && (
            <span className="badge bg-co-light text-co-dark dark:bg-sky-950 dark:text-sky-300">
              {doneSeriesNumbers.size} / {bank.length} faites
            </span>
          )}
        </div>
        {bankLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : bank.length === 0 ? (
          <EmptyState
            icon={Headphones}
            title="Aucune série disponible"
            description="Un administrateur doit d'abord ajouter des séries CO dans le panneau d'administration."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bank.map(series => {
              const done   = doneSeriesNumbers.has(series.series_number)
              const result = coResults.find(r => r.series_number === series.series_number)
              const pts    = result ? (() => {
                const raw = Number(result.score)
                const max = Number(result.max_score || CO_CE_MAX_POINTS)
                return max === CO_CE_MAX_POINTS ? raw : Math.round((raw / max) * CO_CE_MAX_POINTS)
              })() : null
              const cefr   = pts !== null ? coCeScoreToCecr(pts) : null
              return (
                <button
                  key={series.id}
                  onClick={() => navigate(`/co/${series.series_number}`)}
                  className="card card-hover flex items-center justify-between p-4 text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors',
                      done
                        ? 'bg-emerald-100 dark:bg-emerald-950'
                        : 'bg-co-light dark:bg-sky-950/40 group-hover:bg-co-DEFAULT/20'
                    )}>
                      {done
                        ? <CheckCircle2 size={18} className="text-emerald-500" />
                        : <Circle size={18} className="text-co-DEFAULT" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">
                        Série {series.series_number}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{series.title}</p>
                      {pts !== null && cefr && (
                        <span className={clsx('badge mt-1 text-[10px]', CEFR_BAND_STYLES[cefr])}>
                          {pts} pts · {cefr}
                        </span>
                      )}
                    </div>
                  </div>
                  <PlayCircle size={18} className="text-co-DEFAULT flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ml-2" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* External practice */}
      <div>
        <div className="mb-4">
          <h3 className="section-title">Historique &amp; pratique externe</h3>
          <p className="section-sub">Enregistrez les résultats de vos pratiques sur d'autres plateformes</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SeriesForm
              maxSeries={200}
              existing={coResults}
              onSubmit={handleSubmit}
              dayNumber={activeDay}
              disabled={busy}
            />
          </div>
          <div className="lg:col-span-2">
            <SeriesHistory results={coResults} weakAreas={weakAreas} color="#0ea5e9" />
          </div>
        </div>
      </div>
    </div>
  )
}
