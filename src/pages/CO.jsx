import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useChallengeData } from '../hooks/useChallengeData'
import { upsertCoResult, identifyWeakAreas } from '../services/coService'
import { listPublishedCoSeries } from '../services/coSeriesService'
import { markDayModule } from '../services/progressService'
import SeriesForm from '../components/co/SeriesForm'
import SeriesHistory from '../components/co/SeriesHistory'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { Headphones, Target, ListMinus, CheckCircle2, Circle, PlayCircle } from 'lucide-react'

export default function CO() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { loading, coResults, coAverage, profile, activeDay, refresh } = useChallengeData()
  const [busy, setBusy] = useState(false)
  const [bank, setBank] = useState([])
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
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const weakAreas = identifyWeakAreas(coResults)
  const doneSeriesNumbers = new Set(coResults.map((r) => r.series_number))

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Headphones}
        eyebrow="Épreuve 1"
        title="Compréhension Orale"
        subtitle="Séries d'écoute chronométrées avec correction automatique, fidèles au format de l'examen officiel."
        accent="co"
        image="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=60"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Headphones} label="Séries complétées" value={`${coResults.length} / ${bank.length || '—'}`} accent="co" />
        <StatCard icon={Target} label="Score moyen" value={coAverage ?? '—'} sublabel="points" accent="co" />
        <StatCard icon={ListMinus} label="Points faibles" value={weakAreas.length} sublabel="séries sous 60%" accent="amber" />
      </div>

      <div>
        <h3 className="section-title mb-3">Banque de séries</h3>
        {bankLoading ? (
          <div className="h-32 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
        ) : bank.length === 0 ? (
          <EmptyState icon={Headphones} title="Aucune série disponible" description="Un administrateur doit d'abord ajouter des séries CO." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bank.map((series) => (
              <button
                key={series.id}
                onClick={() => navigate(`/co/${series.series_number}`)}
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
                <PlayCircle size={18} className="text-co-DEFAULT" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="section-title mb-3">Historique &amp; pratique externe</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SeriesForm maxSeries={200} existing={coResults} onSubmit={handleSubmit} dayNumber={activeDay} disabled={busy} />
          </div>
          <div className="lg:col-span-2">
            <SeriesHistory results={coResults} weakAreas={weakAreas} color="#0ea5e9" />
          </div>
        </div>
      </div>
    </div>
  )
}

