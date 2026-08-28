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

/** Official-style numbering for CE items in a 39-question series */
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
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SEC)

  const questions = series?.questions || []

  useEffect(() => {
    getCeSeries(seriesNumber)
      .then(setSeries)
      .finally(() => setLoading(false))
  }, [seriesNumber])

  useEffect(() => {
    if (result699 || loading || !series) return
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
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

  useEffect(() => {
    if (secondsLeft === 0 && series && !result699 && !submitting) finish()
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

  if (loading) return <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

  if (!series) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">Série introuvable.</p>
        <Link to="/ce" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    )
  }

  if (result699) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-6">
        <div className="card p-8 text-center">
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

        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-ink-900 dark:text-white">
            Corrigé détaillé
          </h3>
          <div className="space-y-3">
            {questions.map((qq, idx) => {
              const n = DISPLAY_OFFSET + idx
              const picked = answers[qq.id]
              const correct = qq.correct_index
              const isOk = picked === correct
              const letter = (i) => String.fromCharCode(65 + i)
              return (
                <div
                  key={qq.id}
                  className={clsx(
                    'rounded-xl border p-4',
                    isOk
                      ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30'
                      : 'border-red-200 bg-red-50/80 dark:border-red-900 dark:bg-red-950/30'
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-bold text-white">
                      {n}
                    </span>
                    <p className="flex-1 text-sm font-semibold text-ink-900 dark:text-white">{qq.text}</p>
                    <span className={clsx('text-xs font-bold', isOk ? 'text-emerald-600' : 'text-red-600')}>
                      {isOk ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  {qq.image && (
                    <img
                      src={qq.image}
                      alt=""
                      className="mb-3 max-h-32 w-full rounded-lg object-cover object-top"
                    />
                  )}
                  <ul className="space-y-1.5 text-sm">
                    {qq.options.map((opt, oi) => {
                      const isCorrectOpt = oi === correct
                      const isPicked = oi === picked
                      return (
                        <li
                          key={oi}
                          className={clsx(
                            'flex items-center gap-2 rounded-lg px-2 py-1.5',
                            isCorrectOpt && 'bg-emerald-100 font-semibold dark:bg-emerald-900/40',
                            isPicked && !isCorrectOpt && 'bg-red-100 dark:bg-red-900/40'
                          )}
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold dark:bg-slate-700">
                            {letter(oi)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectOpt && <span className="text-[11px] font-bold text-emerald-700">Bonne réponse</span>}
                          {isPicked && !isCorrectOpt && <span className="text-[11px] font-bold text-red-600">Ta réponse</span>}
                        </li>
                      )
                    })}
                  </ul>
                  {picked === undefined && (
                    <p className="mt-2 text-xs text-amber-700">Tu n’as pas répondu à cette question.</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center pb-8">
          <Link to="/ce" className="btn-primary">Retour aux séries CE</Link>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const displayNum = DISPLAY_OFFSET + current
  const selected = q ? answers[q.id] : undefined
  // Crop scans that include printed answers at the bottom (~top 55% = document only)
  const cropDocument = q?.image_crop === 'document' || q?.image

  return (
    <div className="-mx-4 -mt-2 flex min-h-[calc(100vh-4rem)] flex-col bg-slate-100 dark:bg-surface-dark sm:-mx-6">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-surface-darkCard">
        <div className="flex min-w-[140px] items-center gap-2">
          <span className="font-mono text-sm font-bold tabular-nums">{mm}:{ss}</span>
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
              if (!window.confirm(`Tu n’as répondu qu’à ${answeredCount}/${questions.length} questions. Terminer quand même ?`)) return
            }
            finish()
          }}
          disabled={submitting}
          className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="inline animate-spin" /> : 'Fin'}
        </button>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="flex flex-1 flex-col overflow-auto p-4 sm:p-6">
          {/* Document — centered card like exam software */}
          <div className="mb-8 flex flex-1 items-start justify-center pt-2 sm:pt-6">
            <div className="w-full max-w-2xl">
              {q?.image ? (
                <div className="mx-auto overflow-hidden rounded-xl border-[3px] border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-slate-600 dark:bg-white">
                  <div className="mx-auto max-h-[220px] overflow-hidden">
                    <img
                      src={q.image}
                      alt={`Document ${displayNum}`}
                      className="mx-auto max-h-[220px] w-auto max-w-full object-contain object-top"
                    />
                  </div>
                </div>
              ) : (
                <div className="mx-auto rounded-xl border-[3px] border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
                  <p className="whitespace-pre-line font-serif text-lg leading-relaxed text-slate-900">
                    {series.passage_text || '—'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Answer panel — exact exam style */}
          {q && (
            <div className="mx-auto w-full max-w-3xl">
              <div className="overflow-hidden rounded-2xl border-2 border-[#3b9eff] bg-white shadow-sm">
                {/* Blue question bar */}
                <div className="flex items-stretch bg-[#3b9eff]">
                  <div className="flex items-center pl-1.5 pr-0 py-1.5">
                    <span className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg bg-white px-2 text-base font-bold text-slate-800 shadow-sm">
                      {displayNum}
                    </span>
                  </div>
                  <p className="flex flex-1 items-center px-3 py-3 text-[15px] font-medium leading-snug text-white">
                    {q.text}
                  </p>
                </div>

                {/* Options A–D — selectable, nothing pre-checked */}
                <div className="bg-white py-1">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx)
                    const isSelected = selected === optIdx
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => selectAnswer(optIdx)}
                        className={clsx(
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected ? 'bg-[#e8f4ff]' : 'hover:bg-slate-50'
                        )}
                      >
                        <span
                          className={clsx(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold',
                            isSelected
                              ? 'bg-[#3b9eff] text-white'
                              : 'bg-[#9ca3af] text-white'
                          )}
                        >
                          {letter}
                        </span>
                        <span
                          className={clsx(
                            'text-[15px]',
                            isSelected ? 'font-semibold text-slate-900' : 'font-normal text-slate-800'
                          )}
                        >
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={current >= questions.length - 1}
                  onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                  className="rounded-full bg-[#3b9eff] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2b8eef] disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </main>

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
                    isCurrent && 'ring-2 ring-sky-500 ring-offset-1',
                    answered
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  )}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
            Clique une lettre pour répondre. Tu peux changer avant Fin.
          </p>
        </aside>
      </div>
    </div>
  )
}
