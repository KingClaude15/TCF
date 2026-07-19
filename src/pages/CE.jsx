import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useChallengeData } from '../hooks/useChallengeData'
import { upsertCeResult, identifyWeakAreas } from '../services/ceService'
import { listPublishedCeSeries } from '../services/ceSeriesService'
import { markDayModule } from '../services/progressService'
import SeriesForm from '../components/co/SeriesForm'
import SeriesHistory from '../components/co/SeriesHistory'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { BookOpen, Target, ListMinus, CheckCircle2, Circle, PlayCircle } from 'lucide-react'

export default function CE() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { loading, ceResults, ceAverage, profile, activeDay, refresh } = useChallengeData()
  const [busy, setBusy] = useState(false)
  const [bank, setBank] = useState([])
  const [bankLoading, setBankLoading] = useState(true)

  useEffect(() => {
    listPublishedCeSeries()
      .then(setBank)
      .finally(() => setBankLoading(false))
  }, [])

  async function handleSubmit(payload) {
    setBusy(true)
    try {
      await upsertCeResult(user.id, { ...payload, day_number: payload.day_number || activeDay })
      await markDayModule(user.id, payload.day_number || activeDay, 'ce_done')
      toast.success('Résultat CE enregistré !')
      await refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const weakAreas = identifyWeakAreas(ceResults)
  const doneSeriesNumbers = new Set(ceResults.map((r) => r.series_number))

  return (
    <div className="space-y-8">
      <PageHeader
        icon={BookOpen}
        eyebrow="Épreuve 2"
        title="Compréhension Écrite"
        subtitle="Séries de lecture avec correction automatique, calibrées sur la difficulté du TCF Canada."
        accent="ce"
        image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=60"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="Séries complétées" value={`${ceResults.length} / ${bank.length || '—'}`} accent="ce" />
        <StatCard icon={Target} label="Score moyen" value={ceAverage ?? '—'} sublabel="points" accent="ce" />
        <StatCard icon={ListMinus} label="Points faibles" value={weakAreas.length} sublabel="séries sous 60%" accent="amber" />
      </div>

      <div>
        <h3 className="section-title mb-3">Banque de séries</h3>
        {bankLoading ? (
          <div className="h-32 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
        ) : bank.length === 0 ? (
          <EmptyState icon={BookOpen} title="Aucune série disponible" description="Un administrateur doit d'abord ajouter des séries CE." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bank.map((series) => (
              <button
                key={series.id}
                onClick={() => navigate(`/ce/${series.series_number}`)}
                className="card card-hover flex items-center justify-between p-4 text-left"
              >
                <span className="flex items-center gap-3">
                  {doneSeriesNumbers.has(series.series_number) ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Circle size={18} className="text-slate-300" />
                  )}
                  <span>
                    <span className="block text-sm font-semibold">Série {series.series_number}</span>
                    <span className="block text-xs text-slate-400">{series.title}</span>
                  </span>
                </span>
                <PlayCircle size={18} className="text-ce-DEFAULT" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="section-title mb-3">Historique &amp; pratique externe</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SeriesForm maxSeries={200} existing={ceResults} onSubmit={handleSubmit} dayNumber={activeDay} disabled={busy} />
          </div>
          <div className="lg:col-span-2">
            <SeriesHistory results={ceResults} weakAreas={weakAreas} color="#8b5cf6" />
          </div>
        </div>
      </div>
    </div>
  )
}

