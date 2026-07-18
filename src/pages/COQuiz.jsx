import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCoSeries } from '../services/coSeriesService'
import { upsertCoResult } from '../services/coService'
import { markDayModule, getActiveDay } from '../services/progressService'
import QuizRunner from '../components/quiz/QuizRunner'

const DIFFICULTY_LABELS = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }

function isYoutubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url || '')
}

function toYoutubeEmbed(url) {
  const idMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)
  return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}` : url
}

export default function COQuiz() {
  const { seriesNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(false)
  const [startedAt] = useState(Date.now())

  useEffect(() => {
    getCoSeries(seriesNumber)
      .then(setSeries)
      .finally(() => setLoading(false))
  }, [seriesNumber])

  async function handleFinish(correctCount, total) {
    setSubmitting(true)
    try {
      const dayNumber = await getActiveDay(user.id)
      const timeTakenSeconds = Math.round((Date.now() - startedAt) / 1000)
      await upsertCoResult(user.id, {
        series_number: Number(seriesNumber),
        score: correctCount,
        max_score: total,
        time_taken_seconds: timeTakenSeconds,
        difficulty: series.difficulty,
        day_number: dayNumber,
      })
      await markDayModule(user.id, dayNumber, 'co_done')
      toast.success(`Série enregistrée : ${correctCount}/${total}`)
      setFinished(true)
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
        <Link to="/co" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/co')} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600">
        <ArrowLeft size={16} /> Retour aux séries
      </button>

      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-transparent p-5 dark:border-sky-900/40 dark:from-sky-950/30">
        <span className="badge bg-co-light text-co-dark dark:bg-sky-950 dark:text-sky-300">
          Série {series.series_number} · {DIFFICULTY_LABELS[series.difficulty]}
        </span>
        <h2 className="mt-2 font-heading text-xl font-bold text-ink-900 dark:text-white">{series.title}</h2>
      </div>

      {series.audio_url ? (
        <div className="card p-4">
          {isYoutubeUrl(series.audio_url) ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={toYoutubeEmbed(series.audio_url)}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={series.title}
              />
            </div>
          ) : (
            <audio controls src={series.audio_url} className="w-full" />
          )}
        </div>
      ) : (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Aucun audio n'a encore été ajouté pour cette série — réponds aux questions à partir de tes souvenirs si tu l'as déjà écoutée ailleurs, ou attends qu'un administrateur l'ajoute.
        </div>
      )}

      <QuizRunner questions={series.questions} onFinish={handleFinish} submitting={submitting} />

      {finished && series.transcript && (
        <div className="card p-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <FileText size={14} /> Transcription (pour révision)
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{series.transcript}</p>
        </div>
      )}
    </div>
  )
}
