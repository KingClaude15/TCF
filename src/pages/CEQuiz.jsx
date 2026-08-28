import { toastError } from '../lib/errorMessages'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCeSeries } from '../services/ceSeriesService'
import { upsertCeResult } from '../services/ceService'
import { markDayModule, getActiveDay } from '../services/progressService'
import { computeWeightedPoints, coCeScoreToCecr, CO_CE_MAX_POINTS } from '../lib/tcfScoring'
import { CEFR_BAND_STYLES } from '../lib/cecrBands'

/** Official TCF CE numbering often starts at 40 for the written paper block */
const DISPLAY_OFFSET = 40
const EXAM_DURATION_SEC = 60 * 60

export default function CEQuiz() {
  const { seriesNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [series, setSeries] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result699, setResult699] = useState(null)
  const [startedAt] = useState(Date.now())
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: optionIndex }
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SEC)

  const questions = series?.questions || []

  useEffect(() => {
    getCeSeries(seriesNumber)
      .then(setSeries)
      .finally(() => setLoading(false))
  }, [seriesNumber])

  // Countdown timer
  useEffect(() => {
    if (result699 || loading || !series) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [result699, loading, series])

  const finish = useCallback(async () => {
    if (submitting || result699) return
    setSubmitting(true)
    try {
      const correctFlags = questions.map((q) => answers[q.id] === q.correct_index)
      const correctCount = correctFlags.filter(Boolean).length
      const dayNumber = await getActiveDay(user.id)
      const timeTakenSeconds = Math.round((Date.now() - startedAt) / 1000)
      const { points, maxPoints, isOfficialLength } = computeWeightedPoints(correctFlags)
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
      setResult699({ points, maxPoints, isOfficialLength, cecrLevel, correctCount, total: questions.length })
      toast.success(
        `Série enregistrée : ${correctCount}/${questions.length} · ${points}/${maxPoints} pts · Niveau ${cecrLevel}`
      )
    } catch (err) {
      toastError(err, 'Impossible de soumettre les résultats CE')
    } finally {
      setSubmitting(false)
    }
  }, [answers, questions, user, series, seriesNumber, startedAt, submitting, result699])

  // Auto-submit when time runs out
  useEffect(() => {
    if (secondsLeft === 0 && series && !result699 && !submitting) {
      finish()
    }
  }, [secondsLeft, series, result699, submitting, finish])

  function selectAnswer(optionIndex) {
    const q = questions[current]
    if (!q || result699) return
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }))
  }

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers]
  )

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const progressPct = Math.max(0, Math.min(100, (secondsLeft / EXAM_DURATION_SEC) * 100))

  if (loading) {
    return <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
  }

  if (!series) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">Série introuvable.</p>
        <Link to="/ce" className="btn-primary mt-4 inline-flex">
          Retour
        </Link>
      </div>
    )
  }

  if (result699) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <div
          className={clsx(
            'card p-8 text-center',
            result699.cecrLevel === 'C2'
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20'
              : result699.cecrLevel === 'C1'
                ? 'border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/20'
                : result699.cecrLevel === 'B2'
                  ? 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950/20'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800'
          )}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Résultat</p>
          <p className="mt-2 font-heading text-5xl font-bold tabular-nums text-ink-900 dark:text-white">
            {result699.points}
            <span className="ml-1 text-xl font-normal text-slate-400">/ {result699.maxPoints}</span>
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {result699.correctCount} / {result699.total} bonnes réponses
          </p>
          <span className={clsx('mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold', CEFR_BAND_STYLES[result699.cecrLevel])}>
            Niveau {result699.cecrLevel}
          </span>
        </div>
        <div className="flex justify-center gap-3">
          <Link to="/ce" className="btn-primary">
            Retour aux séries CE
          </Link>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const displayNum = DISPLAY_OFFSET + current
  const selected = q ? answers[q.id] : undefined

  return (
    <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50 dark:bg-surface-dark sm:-mx-6">
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-surface-darkCard">
        <div className="flex min-w-[140px] items-center gap-2">
          <span className="font-mono text-sm font-bold tabular-nums text-ink-900 dark:text-white">
            {mm}:{ss}
          </span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 sm:w-40">
            <div
              className={clsx('h-full rounded-full transition-all', secondsLeft < 300 ? 'bg-red-500' : 'bg-emerald-500')}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <p className="flex-1 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
          TCF Canada · Série {series.series_number} · Compréhension écrite
        </p>
        <button
          type="button"
          onClick={() => {
            if (answeredCount < questions.length) {
              const ok = window.confirm(
                `Tu n’as répondu qu’à ${answeredCount}/${questions.length} questions. Terminer quand même ?`
              )
              if (!ok) return
            }
            finish()
          }}
          disabled={submitting}
          className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Fin'}
        </button>
      </header>

      {/* Main + navigator */}
      <div className="flex flex-1 flex-col gap-0 lg:flex-row">
        {/* Center: document + question */}
        <main className="flex flex-1 flex-col overflow-auto p-4 sm:p-6">
          {/* Document / image area */}
          <div className="mb-4 flex min-h-[200px] flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/40">
            {q?.image ? (
              <img
                src={q.image}
                alt={`Document ${displayNum}`}
                className="max-h-[min(52vh,520px)] w-full object-contain"
              />
            ) : (
              <p className="max-w-xl whitespace-pre-line text-center text-base leading-relaxed text-slate-800 dark:text-slate-100">
                {series.passage_text || q?.text || '—'}
              </p>
            )}
          </div>

          {/* Question panel */}
          {q && (
            <div className="rounded-xl border-2 border-brand-500 bg-white shadow-sm dark:bg-surface-darkCard">
              <div className="flex items-stretch overflow-hidden rounded-t-[10px] bg-brand-600 text-white">
                <span className="flex w-14 shrink-0 items-center justify-center bg-white/15 text-lg font-bold">
                  {displayNum}
                </span>
                <p className="flex-1 px-4 py-3 text-sm font-medium leading-snug sm:text-base">
                  {q.text && !q.text.match(/^Question \d+$/) ? q.text : `Question ${displayNum}`}
                </p>
              </div>
              <div className="space-y-1 p-3 sm:p-4">
                {q.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx)
                  const isSelected = selected === optIdx
                  // Never show correct answer before finish — user chooses freely
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => selectAnswer(optIdx)}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-brand-50 font-semibold text-brand-800 ring-2 ring-brand-400 dark:bg-brand-950 dark:text-brand-200'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                      )}
                    >
                      <span
                        className={clsx(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        )}
                      >
                        {letter}
                      </span>
                      <span>{opt === letter || opt === String.fromCharCode(65 + optIdx) ? `Option ${letter}` : opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Prev / Next */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={current >= questions.length - 1}
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700"
            >
              Suivant
            </button>
          </div>
        </main>

        {/* Right navigator */}
        <aside className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-surface-darkCard lg:w-44 lg:border-l lg:border-t-0 lg:p-4">
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Questions · {answeredCount}/{questions.length}
          </p>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-3">
            {questions.map((qq, idx) => {
              const n = DISPLAY_OFFSET + idx
              const answered = answers[qq.id] !== undefined
              const isCurrent = idx === current
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={clsx(
                    'flex h-9 items-center justify-center rounded-md text-xs font-bold transition-colors',
                    isCurrent && 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900',
                    answered
                      ? 'bg-emerald-300 text-emerald-900 dark:bg-emerald-600 dark:text-white'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  )}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
            Vert clair = non répondu · Vert foncé = répondu. Tu peux changer une réponse à tout moment.
          </p>
        </aside>
      </div>
    </div>
  )
}
