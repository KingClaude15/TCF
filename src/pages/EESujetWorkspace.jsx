import { toastError } from '../lib/errorMessages'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, RotateCcw, Clock, AlertTriangle, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getSujetByNumber, sujetToTasks, encodeTopicNumber } from '../services/sujetsService'
import { saveDraft, getEeSubmission, submitForEvaluation, retakeSujet } from '../services/eeService'
import { markDayModule, getActiveDay } from '../services/progressService'
import { getActiveEvaluation } from '../services/evaluationLockService'
import { subscribeToNotifications } from '../services/notificationsService'
import ExamTimer, { clearExamTimer } from '../components/ee/ExamTimer'
import AccentPalette from '../components/ee/AccentPalette'
import AiFeedbackPanel from '../components/ee/AiFeedbackPanel'
import { computeSujetBandScore, CEFR_BAND_STYLES } from '../lib/cecrBands'

const AUTOSAVE_INTERVAL_MS = 10000

export default function EESujetWorkspace() {
  const { sujetNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sujet, setSujet] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [texts, setTexts] = useState({})
  const [submittedTexts, setSubmittedTexts] = useState({})
  const [submissionIds, setSubmissionIds] = useState({})
  const [feedbacks, setFeedbacks] = useState({})
  const [taskStatuses, setTaskStatuses] = useState({}) // step -> 'draft'|'evaluating'|'evaluated'|'error'
  const [taskErrors, setTaskErrors] = useState({}) // step -> error_message
  const [submittingAll, setSubmittingAll] = useState(false)
  const [phase, setPhase] = useState('writing') // 'writing' | 'pending' | 'results' | 'closed-empty'
  const [expired, setExpired] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [retaking, setRetaking] = useState(false)
  const [previousScores, setPreviousScores] = useState({})
  const [otherLock, setOtherLock] = useState(null) // a DIFFERENT sujet currently evaluating, blocks new submits

  const textareaRef = useRef(null)
  const dirtyRef = useRef(false)
  const submitLockRef = useRef(false)

  const timerKey = user ? `ee_timer_sujet_${user.id}_${sujetNumber}` : null

  const load = useCallback(async () => {
    setLoading(true)
    setPreviousScores({})
    try {
      const sujetData = await getSujetByNumber(sujetNumber)
      if (!sujetData) {
        setSujet(null)
        return
      }
      setSujet(sujetData)
      const taskList = sujetToTasks(sujetData)
      setTasks(taskList)

      const existing = await Promise.all(
        taskList.map((t) => getEeSubmission(user.id, encodeTopicNumber(sujetNumber, t.taskType)))
      )
      const nextTexts = {}
      const nextSubmitted = {}
      const nextIds = {}
      const nextFeedback = {}
      const nextStatuses = {}
      const nextErrors = {}
      existing.forEach((sub, i) => {
        if (sub) {
          nextTexts[i] = sub.final_content || sub.draft_content || ''
          nextIds[i] = sub.id
          nextStatuses[i] = sub.status
          if (sub.error_message) nextErrors[i] = sub.error_message
          if (sub.ai_feedback?.[0]) {
            nextFeedback[i] = sub.ai_feedback[0]
            nextSubmitted[i] = sub.final_content || sub.draft_content || ''
          }
        } else {
          nextTexts[i] = ''
        }
      })
      setTexts(nextTexts)
      setSubmittedTexts(nextSubmitted)
      setSubmissionIds(nextIds)
      setFeedbacks(nextFeedback)
      setTaskStatuses(nextStatuses)
      setTaskErrors(nextErrors)

      const anyEvaluating = taskList.some((_, i) => nextStatuses[i] === 'evaluating')
      if (taskList.length > 0 && taskList.every((_, i) => nextFeedback[i])) {
        setPhase('results')
      } else if (anyEvaluating) {
        setPhase('pending')
      } else {
        setPhase('writing')
      }

      const everWritten = Object.values(nextTexts).some((t) => t?.trim())
      setHasStarted(everWritten)
      if (!everWritten && timerKey) clearExamTimer(timerKey)

      // Is a DIFFERENT sujet currently being evaluated? If so, block new
      // submissions from here until it finishes — this is what stops a
      // stuck/slow evaluation from silently burning through the shared
      // (and small) daily Gemini quota via repeated submit attempts.
      const lock = await getActiveEvaluation(user.id, 'EE', Number(sujetNumber))
      setOtherLock(lock)
    } finally {
      setLoading(false)
    }
  }, [sujetNumber, user])

  useEffect(() => {
    load()
  }, [load])

  // While this sujet is pending, live-refresh the moment its own results
  // land (the notification bell also announces it, but this saves the
  // student from having to navigate away and back if they're still here).
  useEffect(() => {
    if (phase !== 'pending' || !user) return
    const unsubscribe = subscribeToNotifications(user.id, (notif) => {
      if (notif.link === `/ee/${sujetNumber}`) load()
    })
    return unsubscribe
  }, [phase, user, sujetNumber, load])

  const task = tasks[step]
  const wordCount = texts[step]?.trim() ? texts[step].trim().split(/\s+/).length : 0

  const persistDraft = useCallback(
    async (currentStep, currentText) => {
      const t = tasks[currentStep]
      if (!t || !currentText?.trim()) return
      try {
        const dayNumber = await getActiveDay(user.id)
        const saved = await saveDraft(user.id, {
          topicNumber: encodeTopicNumber(sujetNumber, t.taskType),
          prompt: t.prompt,
          draftContent: currentText,
          dayNumber,
        })
        setSubmissionIds((ids) => ({ ...ids, [currentStep]: saved.id }))
        dirtyRef.current = false
      } catch {
        // Silent autosave — a transient failure here shouldn't interrupt writing.
      }
    },
    [tasks, sujetNumber, user]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      if (dirtyRef.current && phase === 'writing') persistDraft(step, texts[step])
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [persistDraft, step, texts, phase])

  function updateText(value) {
    setTexts((t) => ({ ...t, [step]: value }))
    dirtyRef.current = true
    if (value?.trim()) setHasStarted(true)
  }

  function handleSwitchTask(newStep) {
    if (dirtyRef.current) persistDraft(step, texts[step])
    setStep(newStep)
  }

  const handleSubmitAll = useCallback(
    async (auto = false) => {
      if (submitLockRef.current) return

      // Re-check the lock right before submitting (not just at page load) —
      // closes the race where another sujet started evaluating in the
      // meantime, e.g. from a second browser tab.
      const lock = await getActiveEvaluation(user.id, 'EE', Number(sujetNumber))
      if (lock) {
        setOtherLock(lock)
        if (!auto) {
          toast.error(`Une correction ${lock.kind} est déjà en cours (sujet ${lock.sujetNumber}). Attends qu'elle se termine.`)
        }
        return
      }

      submitLockRef.current = true
      setSubmittingAll(true)
      try {
        const dayNumber = await getActiveDay(user.id)
        let anySubmitted = false
        const nextStatuses = { ...taskStatuses }
        const nextErrors = { ...taskErrors }

        for (let i = 0; i < tasks.length; i++) {
          const t = tasks[i]
          const content = texts[i]
          if (!content?.trim()) continue
          if (feedbacks[i]) {
            anySubmitted = true
            continue // already evaluated in a previous sitting
          }
          if (taskStatuses[i] === 'evaluating') {
            anySubmitted = true
            continue // already submitted, waiting on this exact task
          }

          const saved = await saveDraft(user.id, {
            topicNumber: encodeTopicNumber(sujetNumber, t.taskType),
            prompt: t.prompt,
            draftContent: content,
            dayNumber,
          })

          try {
            await submitForEvaluation({
              submissionId: saved.id,
              prompt: t.prompt,
              essay: content,
              topicNumber: encodeTopicNumber(sujetNumber, t.taskType),
              taskType: t.taskType,
              minWords: t.minWords,
              maxWords: t.maxWords,
            })
            nextStatuses[i] = 'evaluating'
            delete nextErrors[i]
            anySubmitted = true
          } catch (taskErr) {
            // A 409 here means another sujet grabbed the lock between our
            // check above and this call (rare race) — stop submitting
            // further tasks, but keep whatever already got accepted.
            toastError(taskErr, `Échec de soumission — ${t.taskLabel}`)
            nextErrors[i] = taskErr.message
            break
          }
        }

        setTaskStatuses(nextStatuses)
        setTaskErrors(nextErrors)
        clearExamTimer(timerKey)

        if (!anySubmitted) {
          setPhase('closed-empty')
        } else {
          await markDayModule(user.id, dayNumber, 'ee_done')
          setTexts({})
          setPhase('pending')
          toast.success(
            auto
              ? 'Temps écoulé — sujet soumis automatiquement. Tu seras notifié(e) dès que les corrections seront prêtes.'
              : 'Sujet soumis ! Tu seras notifié(e) dès que les corrections seront prêtes.'
          )
        }
      } catch (err) {
        toastError(err, 'Erreur lors de la soumission EE')
      } finally {
        submitLockRef.current = false
        setSubmittingAll(false)
      }
    },
    [tasks, texts, feedbacks, taskStatuses, taskErrors, sujetNumber, timerKey, user]
  )

  function handleExpire() {
    setExpired(true)
    if (phase === 'writing') handleSubmitAll(true)
  }

  async function handleRetake() {
    if (retaking) return
    setRetaking(true)
    try {
      const topicNumbers = tasks.map((t) => encodeTopicNumber(sujetNumber, t.taskType))
      const scoresBeforeRetake = {}
      tasks.forEach((_, i) => {
        if (typeof feedbacks[i]?.estimated_score === 'number') scoresBeforeRetake[i] = feedbacks[i].estimated_score
      })
      setPreviousScores(scoresBeforeRetake)

      await retakeSujet(user.id, topicNumbers)
      clearExamTimer(timerKey)

      setTexts({})
      setSubmittedTexts({})
      setSubmissionIds({})
      setFeedbacks({})
      setTaskStatuses({})
      setTaskErrors({})
      setExpired(false)
      setHasStarted(false)
      setStep(0)
      setPhase('writing')
      submitLockRef.current = false
      toast.success('Sujet réinitialisé — bonne chance pour cette nouvelle tentative !')
    } catch (err) {
      toastError(err, 'Erreur lors de la soumission EE')
    } finally {
      setRetaking(false)
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  if (!sujet) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">Sujet introuvable.</p>
        <Link to="/ee" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    )
  }

  // ---- Pending view: submitted, waiting on the background evaluation ----
  if (phase === 'pending') {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/ee')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft size={16} /> Retour aux sujets
        </button>

        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <Clock size={28} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold">Correction en cours</h2>
            <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Ton sujet {sujet.sujet_number} a bien été soumis. L'IA évalue tes réponses — cela peut prendre une à deux minutes.
              Tu recevras une notification (en haut, à côté du bouton clair/sombre) dès que tes résultats seront prêts.
            </p>
          </div>
          <Link to="/ee" className="btn-primary">Retour aux sujets EE</Link>
        </div>
      </div>
    )
  }

  // ---- Results view ----
  if (phase === 'results' || phase === 'closed-empty') {
    return (
      <div className="space-y-8">
        <button onClick={() => navigate('/ee')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft size={16} /> Retour aux sujets
        </button>

        <div>
          <span className="badge bg-ee-light text-ee-dark dark:bg-pink-950 dark:text-pink-300">Sujet {sujet.sujet_number}</span>
          <h2 className="mt-2 font-heading text-xl font-bold text-ink-900 dark:text-white">Résultats</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {phase === 'closed-empty' ? "Le temps est écoulé et aucune réponse n'a été soumise." : 'Ce sujet est terminé.'}
          </p>
        </div>

        {(() => {
          const band = computeSujetBandScore(tasks.map((_, i) => feedbacks[i]?.estimated_score))
          if (!band) return null
          return (
            <div className="card flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Score du sujet (moyenne des 3 tâches)</p>
                <p className="mt-1 font-heading text-2xl font-bold">{band.score} / 20</p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${CEFR_BAND_STYLES[band.cefr]}`}>{band.cefr}</span>
            </div>
          )
        })()}

        {tasks.map((t, i) => (
          <div key={t.taskType} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              {feedbacks[i] && <CheckCircle2 size={16} className="text-emerald-500" />}
              {t.taskLabel}
              {feedbacks[i] && typeof previousScores[i] === 'number' && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    feedbacks[i].estimated_score > previousScores[i]
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : feedbacks[i].estimated_score < previousScores[i]
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}
                >
                  {previousScores[i]}/20 → {feedbacks[i].estimated_score}/20
                  {feedbacks[i].estimated_score > previousScores[i] && ' 📈'}
                  {feedbacks[i].estimated_score < previousScores[i] && ' 📉'}
                </span>
              )}
            </h3>
            {feedbacks[i] ? (
              <AiFeedbackPanel feedback={feedbacks[i]} submittedText={submittedTexts[i]} />
            ) : (
              <p className="text-sm text-slate-400">Aucune réponse soumise pour cette tâche.</p>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/ee')} className="btn-primary">Retour aux sujets EE</button>
          <button onClick={handleRetake} disabled={retaking} className="btn-outline">
            {retaking ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Refaire ce sujet
          </button>
        </div>
      </div>
    )
  }

  // ---- Writing view ----
  const hasFailedTasks = Object.keys(taskErrors).length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/ee')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={16} /> Retour aux sujets
        </button>
        {timerKey && <ExamTimer storageKey={timerKey} armed={hasStarted} onExpire={handleExpire} />}
      </div>

      {otherLock && (
        <div className="card flex items-start gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <Lock size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Une autre correction est en cours</p>
            <p className="mt-0.5">
              Le sujet {otherLock.kind} {otherLock.sujetNumber} est encore en cours d'évaluation. Pour ne pas gaspiller le quota IA partagé,
              termine ou attends cette correction avant de soumettre un nouveau sujet.
            </p>
            <Link to={otherLock.link} className="mt-1.5 inline-block font-semibold underline">
              Voir ce sujet →
            </Link>
          </div>
        </div>
      )}

      {hasFailedTasks && (
        <div className="card space-y-1.5 border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <p className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle size={16} /> Une ou plusieurs tâches n'ont pas pu être évaluées
          </p>
          {tasks.map((t, i) =>
            taskErrors[i] ? (
              <p key={t.taskType} className="text-xs">
                <span className="font-semibold">{t.taskLabel} :</span> {taskErrors[i]}
              </p>
            ) : null
          )}
          <p className="text-xs">Ton texte a été conservé — tu peux réessayer avec le bouton ci-dessous.</p>
        </div>
      )}

      <div className="flex gap-2">
        {tasks.map((t, i) => (
          <button
            key={t.taskType}
            onClick={() => handleSwitchTask(i)}
            className={`flex-1 rounded-lg border p-2.5 text-center text-xs font-semibold transition-colors ${
              step === i
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'border-slate-200 text-slate-500 dark:border-slate-700'
            }`}
          >
            {t.taskLabel}
            {taskErrors[i] && <span className="ml-1 text-red-500">!</span>}
            {!taskErrors[i] && texts[i]?.trim().length > 0 && <span className="ml-1 text-amber-500">●</span>}
          </button>
        ))}
      </div>

      {expired && (
        <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Le temps imparti (60 minutes) est écoulé — soumission automatique en cours...
        </div>
      )}

      <div>
        <span className="text-xs font-bold uppercase text-ee-DEFAULT">
          Sujet {sujet.sujet_number} — {task.taskLabel}
        </span>
        <h2 className="mt-1 whitespace-pre-line text-base font-bold leading-snug">{task.prompt}</h2>
        <p className="mt-1 text-xs text-slate-400">
          Longueur attendue : {task.minWords}–{task.maxWords} mots
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <div className="card p-4">
            <textarea
              ref={textareaRef}
              value={texts[step] || ''}
              onChange={(e) => updateText(e.target.value)}
              rows={14}
              disabled={submittingAll}
              className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed focus:outline-none disabled:opacity-60"
              placeholder="Écris ta réponse ici..."
            />
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <span className={wordCount < task.minWords || wordCount > task.maxWords ? 'font-semibold text-amber-500' : 'text-emerald-500'}>
                {wordCount} mots (attendu : {task.minWords}–{task.maxWords})
              </span>
              <span className="text-slate-400">Enregistrement automatique</span>
            </div>
          </div>

          <button onClick={() => handleSubmitAll(false)} disabled={submittingAll || !!otherLock} className="btn-primary w-full">
            {submittingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {submittingAll ? 'Envoi en cours...' : otherLock ? 'Une autre correction est en cours' : 'Soumettre le sujet (3 tâches)'}
          </button>
          <p className="text-center text-xs text-slate-400">
            La soumission envoie les trois tâches à l'IA puis clôture ce sujet. Les résultats arrivent par notification.
          </p>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <AccentPalette textareaRef={textareaRef} value={texts[step] || ''} onChange={updateText} />
        </div>
      </div>
    </div>
  )
}
