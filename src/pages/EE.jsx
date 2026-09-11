import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listPublishedSujets, encodeTopicNumber } from '../services/sujetsService'
import { supabase } from '../lib/supabaseClient'
import { retakeTask } from '../services/eeService'
import StatCard from '../components/ui/StatCard'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import {
  PenLine, Target, CheckCircle2, Circle, Clock, BookOpen, Download,
  RotateCcw, Dumbbell, Timer,
} from 'lucide-react'
import { computeSujetBandScore, CEFR_BAND_STYLES } from '../lib/cecrBands'
import { EE_GUIDE_PDF_URL, EE_GUIDE_TITLE, EE_GUIDE_FILENAME } from '../lib/appLinks'
import toast from 'react-hot-toast'
import { toastError } from '../lib/errorMessages'

const TASK_LABELS = { 1: 'Tâche 1', 2: 'Tâche 2', 3: 'Tâche 3' }

export default function EE() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sujets, setSujets] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [retaking, setRetaking] = useState(null) // topic_number being retaken

  async function reload() {
    const [sujetsData, { data: subsData, error }] = await Promise.all([
      listPublishedSujets(),
      supabase.from('ee_submissions').select('*, ai_feedback(estimated_score)').eq('user_id', user.id),
    ])
    if (error) throw error
    setSujets(sujetsData)
    setSubmissions(subsData || [])
  }

  useEffect(() => {
    if (!user) return
    reload()
      .catch((e) => toastError(e, 'Impossible de charger les sujets EE'))
      .finally(() => setLoading(false))
  }, [user])

  async function handleRetakeTask(e, sujetNumber, taskType) {
    e.preventDefault()
    e.stopPropagation()
    const topicNumber = encodeTopicNumber(sujetNumber, taskType)
    if (retaking === topicNumber) return
    if (!window.confirm(`Refaire uniquement la ${TASK_LABELS[taskType]} du sujet ${sujetNumber} ?\nLes autres tâches et un éventuel examen blanc ne seront pas effacés.`)) {
      return
    }
    setRetaking(topicNumber)
    try {
      await retakeTask(user.id, topicNumber)
      toast.success(`${TASK_LABELS[taskType]} réinitialisée — tu peux la refaire.`)
      await reload()
      navigate(`/ee/${sujetNumber}?mode=single&task=${taskType}`)
    } catch (err) {
      toastError(err, 'Impossible de réinitialiser cette tâche')
    } finally {
      setRetaking(null)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  const byTopicNumber = new Map(submissions.map((s) => [s.topic_number, s]))
  const scores = submissions
    .map((s) => s.ai_feedback?.[0]?.estimated_score)
    .filter((v) => typeof v === 'number')
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null

  // Exam complete = all 3 evaluated
  const completedExamSujets = sujets.filter((sujet) =>
    [1, 2, 3].every((t) => byTopicNumber.get(encodeTopicNumber(sujet.sujet_number, t))?.status === 'evaluated')
  ).length

  // Practice: count individual evaluated tasks
  const evaluatedTasks = sujets.reduce((acc, sujet) => {
    return (
      acc +
      [1, 2, 3].filter((t) => byTopicNumber.get(encodeTopicNumber(sujet.sujet_number, t))?.status === 'evaluated')
        .length
    )
  }, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        icon={PenLine}
        eyebrow="Épreuve 3"
        title="Expression Écrite"
        subtitle="Entraîne-toi tâche par tâche, ou passe un examen blanc complet (3 tâches, 60 min) avec correction IA."
        accent="ee"
        image="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=60"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Dumbbell} label="Tâches corrigées (entraînement)" value={`${evaluatedTasks}`} accent="ee" />
        <StatCard icon={Timer} label="Examens blancs terminés" value={`${completedExamSujets} / ${sujets.length}`} accent="ee" />
        <StatCard icon={Target} label="Score EE moyen" value={avgScore != null ? `${avgScore} / 20` : '—'} accent="ee" />
      </div>

      <Link
        to="/ee/methodologie"
        className="card card-hover flex items-start gap-3 border-ee-DEFAULT/20 p-4"
      >
        <BookOpen size={20} className="mt-0.5 shrink-0 text-ee-DEFAULT" />
        <div>
          <p className="text-sm font-bold text-ink-900 dark:text-white">Méthodologie EE</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Structures des 3 tâches, checklists, connecteurs et gestion du temps — à lire avant de te lancer.
          </p>
        </div>
      </Link>

      <div className="card flex flex-col gap-3 border-ee-DEFAULT/15 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <BookOpen size={20} className="mt-0.5 shrink-0 text-ee-DEFAULT" />
          <div>
            <p className="text-sm font-bold text-ink-900 dark:text-white">{EE_GUIDE_TITLE}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Après chaque rédaction, télécharge ce guide PDF pour approfondir méthode et argumentation.
            </p>
          </div>
        </div>
        <a
          href={EE_GUIDE_PDF_URL}
          download={EE_GUIDE_FILENAME}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex shrink-0 items-center gap-2 text-sm"
        >
          <Download size={15} />
          Télécharger le guide
        </a>
      </div>

      {sujets.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title="Aucun sujet disponible"
          description="Un administrateur doit d'abord ajouter des sujets EE."
        />
      ) : (
        <>
          {/* ─── SECTION 1: Practice single tasks ─── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Dumbbell size={18} className="text-brand-600" />
              <div>
                <h2 className="text-base font-bold text-ink-900 dark:text-white">Entraînement — tâche par tâche</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fais T1, T2 ou T3 séparément. « En cours » n&apos;apparaît pas ici pour un examen incomplet — seulement le
                  statut de chaque tâche. « Refaire cette tâche » n&apos;efface pas les autres.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sujets.map((sujet) => (
                <div key={`practice-${sujet.id}`} className="card flex flex-col gap-2.5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Sujet {sujet.sujet_number}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pratique</span>
                  </div>

                  <div className="space-y-1.5">
                    {[1, 2, 3].map((t) => {
                      const sub = byTopicNumber.get(encodeTopicNumber(sujet.sujet_number, t))
                      const status = sub?.status
                      const score = sub?.ai_feedback?.[0]?.estimated_score
                      const isEval = status === 'evaluated'
                      const isPending = status === 'evaluating'
                      const hasDraft = !!sub && !isEval && !isPending
                      const topicNumber = encodeTopicNumber(sujet.sujet_number, t)

                      return (
                        <div
                          key={t}
                          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-800/40"
                        >
                          <button
                            type="button"
                            onClick={() => navigate(`/ee/${sujet.sujet_number}?mode=single&task=${t}`)}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                isEval
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : hasDraft
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                              }`}
                            >
                              T{t}
                            </span>
                            <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                              {TASK_LABELS[t]}
                            </span>
                            <span className="ml-auto shrink-0 text-[11px] font-semibold text-slate-400">
                              {isEval && typeof score === 'number'
                                ? `${score}/20`
                                : isPending
                                ? 'Correction…'
                                : hasDraft
                                ? 'Brouillon'
                                : 'À faire'}
                            </span>
                          </button>
                          {isEval && (
                            <button
                              type="button"
                              title="Refaire cette tâche uniquement"
                              disabled={retaking === topicNumber}
                              onClick={(e) => handleRetakeTask(e, sujet.sujet_number, t)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950"
                            >
                              <RotateCcw size={12} className={retaking === topicNumber ? 'animate-spin' : ''} />
                              Refaire
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SECTION 2: Full exam ─── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-ee-DEFAULT" />
              <div>
                <h2 className="text-base font-bold text-ink-900 dark:text-white">Examen blanc — 3 tâches</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chronomètre 60 min, les trois tâches comme le jour J. « En cours » s&apos;affiche seulement si au moins
                  deux tâches de ce sujet ont été commencées (pas pour une seule tâche d&apos;entraînement).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sujets.map((sujet) => {
                const taskStates = [1, 2, 3].map((t) => byTopicNumber.get(encodeTopicNumber(sujet.sujet_number, t)))
                const doneCount = taskStates.filter((s) => s?.status === 'evaluated').length
                const startedCount = taskStates.filter((s) => s).length
                // Exam "in progress" only if 2+ tasks touched and not all done
                const examInProgress = startedCount >= 2 && doneCount < 3
                const examDone = doneCount === 3
                const band = computeSujetBandScore(taskStates.map((s) => s?.ai_feedback?.[0]?.estimated_score))

                return (
                  <button
                    key={`exam-${sujet.id}`}
                    type="button"
                    onClick={() => navigate(`/ee/${sujet.sujet_number}?mode=exam`)}
                    className="card card-hover flex flex-col gap-3 p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Sujet {sujet.sujet_number}</span>
                      {examDone ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className="text-slate-300" />
                      )}
                    </div>

                    {band && examDone && (
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Score du sujet</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{band.score} / 20</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${CEFR_BAND_STYLES[band.cefr]}`}>
                            {band.cefr}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {[1, 2, 3].map((t) => (
                        <span
                          key={t}
                          className={`rounded-full px-2 py-0.5 ${
                            taskStates[t - 1]?.status === 'evaluated'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : taskStates[t - 1]
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          }`}
                        >
                          T{t}
                        </span>
                      ))}
                      {examInProgress && <span className="ml-auto text-amber-500">En cours</span>}
                      {examDone && <span className="ml-auto text-emerald-600">Terminé</span>}
                      {!examInProgress && !examDone && startedCount === 1 && (
                        <span className="ml-auto text-slate-400">Pratique seule</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
