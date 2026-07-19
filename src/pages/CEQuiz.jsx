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
        score: correctCount,
        max_score: total,
        weighted_points: points,
        cecr_level: cecrLevel,
        time_taken_seconds: timeTakenSeconds,
        difficulty: series.difficulty,
        day_number: dayNumber,
      })
      await markDayModule(user.id, dayNumber, 'ce_done')
      toast.success(
        `Série enregistrée : ${correctCount}/${total} · ${points}/${maxPoints} pts${isOfficialLength ? '' : ' (estimé)'} · Niveau ${cecrLevel}`
      )
    } catch (err) {
      toast.error(err.message)
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
    </div>
  )
}
