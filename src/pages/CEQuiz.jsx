import { toastError } from '../lib/errorMessages'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCeSeries } from '../services/ceSeriesService'
import { upsertCeResult } from '../services/ceService'
import { markDayModule, getActiveDay } from '../services/progressService'
import { computeWeightedPoints, coCeScoreToCecr } from '../lib/tcfScoring'
import QuizRunner from '../components/quiz/QuizRunner'

const DIFFICULTY_LABELS = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }

export default function CEQuiz() {
  const { seriesNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result699, setResult699] = useState(null)
  const [startedAt] = useState(Date.now())

  useEffect(() => {
    getCeSeries(seriesNumber)
      .then(setSeries)
      .finally(() => setLoading(false))
  }, [seriesNumber])

  async function handleFinish(correctCount, total, correctFlags) {
    setSubmitting(true)
    try {
      const dayNumber = await getActiveDay(user.id)
      const timeTakenSeconds = Math.round((Date.now() - startedAt) / 1000)
      const { points, maxPoints, isOfficialLength } = computeWeightedPoints(correctFlags || [])
      const cecrLevel = coCeScoreToCecr(points)
      await upsertCeResult(user.id, {
        series_number: Number(seriesNumber),
        score: points,
        max_score: CO_CE_MAX_POINTS,
        weighted_points: points,
        cecr_level: cecrLevel,
        time_taken_seconds: timeTakenSeconds,
        difficulty: series.difficulty,
        day_number: dayNumber,
      })
      await markDayModule(user.id, dayNumber, 'ce_done')
      setResult699({ points, maxPoints, isOfficialLength, cecrLevel, correctCount, total })
      toast.success(
        `Série enregistrée : ${correctCount}/${total} · ${points}/${maxPoints} pts${isOfficialLength ? '' : ' (estimé)'} · Niveau ${cecrLevel}`
      )
    } catch (err) {
      toastError(err, 'Impossible de soumettre les résultats CE')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  if (!series) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">Série introuvable.</p>
        <Link to="/ce" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/ce')} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
        <ArrowLeft size={16} /> Retour aux séries
      </button>

      <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-transparent p-5 dark:border-violet-900/40 dark:from-violet-950/30">
        <span className="badge bg-ce-light text-ce-dark dark:bg-violet-950 dark:text-violet-300">
          Série {series.series_number} · {DIFFICULTY_LABELS[series.difficulty]}
        </span>
        <h2 className="mt-2 font-heading text-xl font-bold text-ink-900 dark:text-white">{series.title}</h2>
      </div>

      <div className="card p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{series.passage_text}</p>
      </div>

      <QuizRunner questions={series.questions} onFinish={handleFinish} submitting={submitting} />

      {result699 && (
        <div className={clsx(
          'card p-6 text-center',
          result699.cecrLevel === 'C2' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20' :
          result699.cecrLevel === 'C1' ? 'border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/20' :
          result699.cecrLevel === 'B2' ? 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950/20' :
          'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40'
        )}>
          <p className="eyebrow mb-3">Résultat officiel</p>
          <p className="font-heading text-5xl font-bold text-ink-900 dark:text-white tabular-nums">
            {result699.points}
            <span className="text-xl font-normal text-slate-400 ml-1">/ {result699.maxPoints}</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {result699.correctCount} / {result699.total} bonnes réponses
            {!result699.isOfficialLength && ' (score estimé — série courte)'}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={clsx('badge text-sm font-bold px-3 py-1', CEFR_BAND_STYLES[result699.cecrLevel])}>
              Niveau {result699.cecrLevel}
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Sur l'échelle officielle TCF Canada (/699 pts selon France Éducation International)
          </p>
        </div>
      )}

    </div>
  )
}
