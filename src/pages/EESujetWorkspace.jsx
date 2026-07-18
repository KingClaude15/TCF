import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getSujetByNumber, sujetToTasks, encodeTopicNumber } from '../services/sujetsService'
import { saveDraft, getEeSubmission, submitForEvaluation } from '../services/eeService'
import { markDayModule, getActiveDay } from '../services/progressService'
import ExamTimer, { clearExamTimer } from '../components/ee/ExamTimer'
import AccentPalette from '../components/ee/AccentPalette'
import AiFeedbackPanel from '../components/ee/AiFeedbackPanel'

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
  const [submittingAll, setSubmittingAll] = useState(false)
  const [phase, setPhase] = useState('writing') // 'writing' | 'results' | 'closed-empty'
  const [expired, setExpired] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const textareaRef = useRef(null)
  const dirtyRef = useRef(false)
  const submitLockRef = useRef(false) // guards against double-submit (manual + timer racing)

  const timerKey = user ? `ee_timer_sujet_${user.id}_${sujetNumber}` : null

  const load = useCallback(async () => {
    setLoading(true)
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
      existing.forEach((sub, i) => {
        if (sub) {
          nextTexts[i] = sub.final_content || sub.draft_content || ''
          nextIds[i] = sub.id
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
      // If every task already has feedback from a previous sitting, jump
      // straight to the results view instead of re-showing empty editors.
      if (taskList.length > 0 && taskList.every((_, i) => nextFeedback[i])) {
        setPhase('results')
      }
      // Self-healing: if the student has never written anything for this
      // sujet, wipe any stale exam-timer start time that might be sitting
      // in localStorage from a previous version of the app (or a prior
      // abandoned glance at this page) — see ExamTimer's `armed` prop for
      // why a leftover timestamp here used to cause an instant false
      // "Temps écoulé" on open.
      const everWritten = Object.values(nextTexts).some((t) => t?.trim())
      setHasStarted(everWritten)
      if (!everWritten && timerKey) clearExamTimer(timerKey)
    } finally {
      setLoading(false)
    }
  }, [sujetNumber, user])

  useEffect(() => {
    load()
  }, [load])

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
        // The next interval tick (or the final submit) will retry.
      }
    },
    [tasks, sujetNumber, user]
  )

  // Silent autosave every 10s while there are unsaved changes. The student
  // never sees or triggers this directly.
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

  // Switching tabs also silently saves whatever was just typed.
  function handleSwitchTask(newStep) {
    if (dirtyRef.current) persistDraft(step, texts[step])
    setStep(newStep)
  }

  const handleSubmitAll = useCallback(
    async (auto = false) => {
      if (submitLockRef.current) return
      submitLockRef.current = true
      setSubmittingAll(true)
      try {
        const dayNumber = await getActiveDay(user.id)
        const nextFeedback = { ...feedbacks }
        const nextSubmittedTexts = { ...submittedTexts }
        let anySubmitted = false

        for (let i = 0; i < tasks.length; i++) {
          const t = tasks[i]
          const content = texts[i]
          if (!content?.trim()) continue // nothing written for this tâche — skip it
          if (nextFeedback[i]) {
            anySubmitted = true
            continue // already evaluated in a previous sitting
          }

          const saved = await saveDraft(user.id, {
            topicNumber: encodeTopicNumber(sujetNumber, t.taskType),
            prompt: t.prompt,
            draftContent: content,
            dayNumber,
          })

          const feedback = await submitForEvaluation({
            submissionId: saved.id,
            prompt: t.prompt,
            essay: content,
            topicNumber: encodeTopicNumber(sujetNumber, t.taskType),
            taskType: t.taskType,
            minWords: t.minWords,
            maxWords: t.maxWords,
          })
          nextFeedback[i] = feedback
          nextSubmittedTexts[i] = content
          anySubmitted = true
        }

        setFeedbacks(nextFeedback)
        setSubmittedTexts(nextSubmittedTexts)
        clearExamTimer(timerKey)

        if (!anySubmitted) {
          setPhase('closed-empty')
        } else {
          await markDayModule(user.id, dayNumber, 'ee_done')
          setTexts({}) // clear the writing workspace
          setPhase('results')
          toast.success(auto ? 'Temps écoulé — sujet soumis automatiquement.' : 'Sujet soumis et évalué !')
        }
      } catch (err) {
        toast.error(err.message || 'Échec de la soumission du sujet')
        submitLockRef.current = false // allow retry on failure
      } finally {
        setSubmittingAll(false)
      }
    },
    [tasks, texts, feedbacks, submittedTexts, sujetNumber, timerKey, user]
  )

  function handleExpire() {
    setExpired(true)
    if (phase === 'writing') handleSubmitAll(true)
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

  // ---- Results view: shown after submission, workspace is cleared ----
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

        {tasks.map((t, i) => (
          <div key={t.taskType} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              {feedbacks[i] && <CheckCircle2 size={16} className="text-emerald-500" />}
              {t.taskLabel}
            </h3>
            {feedbacks[i] ? (
              <AiFeedbackPanel feedback={feedbacks[i]} submittedText={submittedTexts[i]} />
            ) : (
              <p className="text-sm text-slate-400">Aucune réponse soumise pour cette tâche.</p>
            )}
          </div>
        ))}

        <button onClick={() => navigate('/ee')} className="btn-primary">Retour aux sujets EE</button>
      </div>
    )
  }

  // ---- Writing view ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/ee')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={16} /> Retour aux sujets
        </button>
        {/* Always visible once the sujet is loaded, regardless of which tâche is active */}
        {timerKey && <ExamTimer storageKey={timerKey} armed={hasStarted} onExpire={handleExpire} />}
      </div>

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
            {texts[i]?.trim().length > 0 && <span className="ml-1 text-amber-500">●</span>}
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

          <button onClick={() => handleSubmitAll(false)} disabled={submittingAll} className="btn-primary w-full">
            {submittingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {submittingAll ? 'Évaluation des 3 tâches en cours...' : 'Soumettre le sujet (3 tâches)'}
          </button>
          <p className="text-center text-xs text-slate-400">
            La soumission évalue les trois tâches en une fois et clôture ce sujet.
          </p>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <AccentPalette textareaRef={textareaRef} value={texts[step] || ''} onChange={updateText} />
        </div>
      </div>
    </div>
  )
}
