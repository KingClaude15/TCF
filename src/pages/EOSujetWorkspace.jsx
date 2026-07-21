import { toastError } from '../lib/errorMessages'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, RotateCcw, Clock, AlertTriangle, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { getEoSujetByNumber, eoSujetToTasks, encodeTopicNumber } from '../services/sujetsService'
import { getEoSubmission, saveDraftRecording, submitRecording, retakeEoSujet } from '../services/eoService'
import { markDayModule, getActiveDay } from '../services/progressService'
import { getActiveEvaluation } from '../services/evaluationLockService'
import { subscribeToNotifications } from '../services/notificationsService'
import ExamTimer, { clearExamTimer } from '../components/ee/ExamTimer'
import AudioRecorder from '../components/eo/AudioRecorder'
import EoFeedbackPanel from '../components/eo/EoFeedbackPanel'
import { computeSujetBandScore, CEFR_BAND_STYLES } from '../lib/cecrBands'

const BUCKET = 'eo-recordings'

export default function EOSujetWorkspace() {
  const { sujetNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sujet, setSujet] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [recordings, setRecordings] = useState({})
  const [existingAudioUrls, setExistingAudioUrls] = useState({})
  const [draftAudioPaths, setDraftAudioPaths] = useState({})
  const [savingDraft, setSavingDraft] = useState({})
  const [feedbacks, setFeedbacks] = useState({})
  const [taskStatuses, setTaskStatuses] = useState({}) // step -> 'draft'|'submitted'|'evaluating'|'evaluated'|'error'
  const [taskErrors, setTaskErrors] = useState({}) // step -> error_message
  const [submittingAll, setSubmittingAll] = useState(false)
  const [phase, setPhase] = useState('recording') // 'recording' | 'pending' | 'results' | 'closed-empty'
  const [expired, setExpired] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [retaking, setRetaking] = useState(false)
  const [previousScores, setPreviousScores] = useState({})
  const [prepDone, setPrepDone] = useState(new Set())
  const [prepRemaining, setPrepRemaining] = useState(0)
  const [notes, setNotes] = useState({})
  const [otherLock, setOtherLock] = useState(null)

  const timerKey = user ? `eo_timer_sujet_${user.id}_${sujetNumber}` : null
  const blobUrlCacheRef = useRef({})
  const submitLockRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setPreviousScores({})
    Object.values(blobUrlCacheRef.current).forEach((url) => URL.revokeObjectURL(url))
    blobUrlCacheRef.current = {}
    try {
      const sujetData = await getEoSujetByNumber(sujetNumber)
      if (!sujetData) {
        setSujet(null)
        return
      }
      setSujet(sujetData)
      const taskList = eoSujetToTasks(sujetData)
      setTasks(taskList)

      const existing = await Promise.all(
        taskList.map((t) => getEoSubmission(user.id, encodeTopicNumber(sujetNumber, t.taskType)))
      )
      const nextUrls = {}
      const nextDraftPaths = {}
      const nextFeedback = {}
      const nextStatuses = {}
      const nextErrors = {}
      for (let i = 0; i < existing.length; i++) {
        const sub = existing[i]
        if (!sub) continue
        nextStatuses[i] = sub.status
        if (sub.error_message) nextErrors[i] = sub.error_message
        if (sub.audio_path) {
          const { data } = await supabase.storage.from(BUCKET).createSignedUrl(sub.audio_path, 60 * 30)
          if (data) nextUrls[i] = data.signedUrl
          nextDraftPaths[i] = sub.audio_path
        }
        if (sub.eo_feedback?.[0]) nextFeedback[i] = sub.eo_feedback[0]
      }
      setExistingAudioUrls(nextUrls)
      setDraftAudioPaths(nextDraftPaths)
      setFeedbacks(nextFeedback)
      setTaskStatuses(nextStatuses)
      setTaskErrors(nextErrors)
      setRecordings({})

      const anyEvaluating = taskList.some((_, i) => nextStatuses[i] === 'evaluating')
      if (taskList.length > 0 && taskList.every((_, i) => nextFeedback[i])) {
        setPhase('results')
      } else if (anyEvaluating) {
        setPhase('pending')
      } else {
        setPhase('recording')
      }
      setHasStarted(false)
      setPrepDone(new Set())
      setPrepRemaining(0)
      if (timerKey) clearExamTimer(timerKey)

      const lock = await getActiveEvaluation(user.id, 'EO', Number(sujetNumber))
      setOtherLock(lock)
    } finally {
      setLoading(false)
    }
  }, [sujetNumber, user])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (phase !== 'pending' || !user) return
    const unsubscribe = subscribeToNotifications(user.id, (notif) => {
      if (notif.link === `/eo/${sujetNumber}`) load()
    })
    return unsubscribe
  }, [phase, user, sujetNumber, load])

  const task = tasks[step]
  const examDurationSeconds =
    tasks.reduce((sum, t) => sum + (t.maxSeconds || 0) + (t.prepSeconds || 0), 0) || 12 * 60
  const inPrep = task && task.prepSeconds > 0 && !prepDone.has(step)

  useEffect(() => {
    if (!inPrep) return
    setPrepRemaining(task.prepSeconds)
    const interval = setInterval(() => {
      setPrepRemaining((s) => {
        if (s <= 1) {
          clearInterval(interval)
          setPrepDone((d) => new Set(d).add(step))
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, inPrep])

  function skipPrep() {
    setPrepDone((d) => new Set(d).add(step))
  }

  useEffect(() => {
    if (phase === 'recording' && sujet) setHasStarted(true)
  }, [phase, sujet])

  function handleRecorded(blob, durationSeconds) {
    setRecordings((r) => ({ ...r, [step]: { blob, durationSeconds } }))
    setHasStarted(true)

    const currentStep = step
    const currentTask = tasks[currentStep]
    if (!currentTask) return
    setSavingDraft((s) => ({ ...s, [currentStep]: true }))
    ;(async () => {
      try {
        const dayNumber = await getActiveDay(user.id)
        const saved = await saveDraftRecording({
          userId: user.id,
          topicNumber: encodeTopicNumber(sujetNumber, currentTask.taskType),
          prompt: currentTask.prompt,
          dayNumber,
          audioBlob: blob,
          durationSeconds,
        })
        setDraftAudioPaths((p) => ({ ...p, [currentStep]: saved.audio_path }))
      } catch {
        toast.error(`Échec de la sauvegarde automatique (${currentTask.taskLabel}) — réessaie si tu rafraîchis la page.`)
      } finally {
        setSavingDraft((s) => ({ ...s, [currentStep]: false }))
      }
    })()
  }

  function getExistingUrlForStep(stepIndex) {
    const rec = recordings[stepIndex]
    if (rec?.blob) {
      if (!blobUrlCacheRef.current[stepIndex]) {
        blobUrlCacheRef.current[stepIndex] = URL.createObjectURL(rec.blob)
      }
      return blobUrlCacheRef.current[stepIndex]
    }
    return existingAudioUrls[stepIndex] || null
  }

  useEffect(() => {
    const cache = blobUrlCacheRef.current
    return () => {
      Object.values(cache).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleSubmitAll = useCallback(
    async (auto = false) => {
      if (submitLockRef.current) return

      const lock = await getActiveEvaluation(user.id, 'EO', Number(sujetNumber))
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
        const nextUrls = { ...existingAudioUrls }

        for (let i = 0; i < tasks.length; i++) {
          const t = tasks[i]
          const rec = recordings[i]
          if (feedbacks[i] || taskStatuses[i] === 'evaluating') {
            anySubmitted = true
            continue // already evaluated, or already submitted and awaiting this exact task
          }
          const existingPath = draftAudioPaths[i]
          if (!rec?.blob && !existingPath) continue // nothing recorded for this tâche — skip it

          try {
            await submitRecording({
              userId: user.id,
              topicNumber: encodeTopicNumber(sujetNumber, t.taskType),
              prompt: t.prompt,
              taskType: t.taskType,
              dayNumber,
              audioBlob: rec?.blob,
              durationSeconds: rec?.durationSeconds,
              existingAudioPath: rec?.blob ? undefined : existingPath,
            })
            nextStatuses[i] = 'evaluating'
            delete nextErrors[i]
            if (rec?.blob) nextUrls[i] = URL.createObjectURL(rec.blob)
            anySubmitted = true
          } catch (taskErr) {
            toastError(taskErr, `Échec de soumission — ${t.taskLabel}`)
            nextErrors[i] = taskErr.message
            break
          }
        }

        setTaskStatuses(nextStatuses)
        setTaskErrors(nextErrors)
        setExistingAudioUrls(nextUrls)
        clearExamTimer(timerKey)

        if (!anySubmitted) {
          setPhase('closed-empty')
        } else {
          await markDayModule(user.id, dayNumber, 'eo_done')
          setRecordings({})
          setPhase('pending')
          toast.success(
            auto
              ? 'Temps écoulé — sujet soumis automatiquement. Tu seras notifié(e) dès que les corrections seront prêtes.'
              : 'Sujet soumis ! Tu seras notifié(e) dès que les corrections seront prêtes.'
          )
        }
      } catch (err) {
        toastError(err, 'Erreur lors de la soumission EO')
      } finally {
        submitLockRef.current = false
        setSubmittingAll(false)
      }
    },
    [tasks, recordings, feedbacks, taskStatuses, taskErrors, existingAudioUrls, draftAudioPaths, sujetNumber, timerKey, user]
  )

  function handleExpire() {
    setExpired(true)
    if (phase === 'recording') handleSubmitAll(true)
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

      await retakeEoSujet(user.id, topicNumbers)
      clearExamTimer(timerKey)

      setRecordings({})
      setExistingAudioUrls({})
      setDraftAudioPaths({})
      Object.values(blobUrlCacheRef.current).forEach((url) => URL.revokeObjectURL(url))
      blobUrlCacheRef.current = {}
      setFeedbacks({})
      setTaskStatuses({})
      setTaskErrors({})
      setExpired(false)
      setHasStarted(false)
      setPrepDone(new Set())
      setPrepRemaining(0)
      setStep(0)
      setPhase('recording')
      toast.success('Sujet réinitialisé — bonne chance pour cette nouvelle tentative !')
    } catch (err) {
      toastError(err, 'Erreur lors de la soumission EO')
    } finally {
      setRetaking(false)
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  if (!sujet) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">Sujet introuvable.</p>
        <Link to="/eo" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    )
  }

  // ---- Pending view ----
  if (phase === 'pending') {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/eo')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft size={16} /> Retour aux sujets
        </button>

        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
            <Clock size={28} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold">Correction en cours</h2>
            <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Ton sujet {sujet.sujet_number} a bien été soumis. L'IA transcrit et évalue tes enregistrements — cela prend généralement
              moins de 5 minutes. Tu recevras une notification (en haut, à côté du bouton clair/sombre) dès que tes résultats seront
              prêts. Tu peux fermer cette page ou continuer autre chose en attendant.
            </p>
          </div>
          <Link to="/eo" className="btn-primary">Retour aux sujets EO</Link>
        </div>
      </div>
    )
  }

  // ---- Results view ----
  if (phase === 'results' || phase === 'closed-empty') {
    return (
      <div className="space-y-8">
        <button onClick={() => navigate('/eo')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft size={16} /> Retour aux sujets
        </button>

        <div>
          <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">Sujet {sujet.sujet_number}</span>
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
              <EoFeedbackPanel feedback={feedbacks[i]} audioUrl={existingAudioUrls[i]} />
            ) : (
              <p className="text-sm text-slate-400">Aucune réponse soumise pour cette tâche.</p>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/eo')} className="btn-primary">Retour aux sujets EO</button>
          <button onClick={handleRetake} disabled={retaking} className="btn-outline">
            {retaking ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Refaire ce sujet
          </button>
        </div>
      </div>
    )
  }

  // ---- Recording view ----
  const hasFailedTasks = Object.keys(taskErrors).length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/eo')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft size={16} /> Retour aux sujets
        </button>
        {timerKey && (
          <ExamTimer storageKey={timerKey} armed={hasStarted} onExpire={handleExpire} durationSeconds={examDurationSeconds} />
        )}
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
          <p className="text-xs">Ton enregistrement a été conservé — tu peux réessayer avec le bouton ci-dessous.</p>
        </div>
      )}

      <div className="flex gap-2">
        {tasks.map((t, i) => (
          <button
            key={t.taskType}
            onClick={() => setStep(i)}
            className={`flex-1 rounded-lg border p-2.5 text-center text-xs font-semibold transition-colors ${
              step === i
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'border-slate-200 text-slate-500 dark:border-slate-700'
            }`}
          >
            {t.taskLabel}
            {taskErrors[i] && <span className="ml-1 text-red-500">!</span>}
            {!taskErrors[i] && (recordings[i]?.blob || draftAudioPaths[i] || feedbacks[i]) && <span className="ml-1 text-amber-500">●</span>}
          </button>
        ))}
      </div>

      {expired && (
        <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Le temps imparti est écoulé — soumission automatique en cours...
        </div>
      )}

      <div>
        <span className="text-xs font-bold uppercase text-orange-500">
          Sujet {sujet.sujet_number} — {task.taskLabel}
        </span>
        <h2 className="mt-1 whitespace-pre-line text-base font-bold leading-snug">{task.prompt}</h2>
        <p className="mt-1 text-xs text-slate-400">
          {task.prepSeconds > 0 ? `Préparation : ${Math.round(task.prepSeconds / 60)} min · ` : ''}
          Durée de parole : jusqu'à {Math.round(task.maxSeconds / 60) || 1} min
        </p>
      </div>

      {feedbacks[step] ? (
        <div className="card border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Cette tâche a déjà été soumise et évaluée. Utilise "Refaire ce sujet" depuis les résultats pour recommencer.
        </div>
      ) : inPrep ? (
        <div className="card flex flex-col items-center gap-4 p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold tabular-nums text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {Math.floor(prepRemaining / 60)}:{String(prepRemaining % 60).padStart(2, '0')}
          </div>
          <p className="text-center text-sm font-semibold text-amber-600 dark:text-amber-400">
            Temps de préparation — note tes questions ci-dessous, l'enregistrement démarrera automatiquement
          </p>
          <textarea
            value={notes[step] || ''}
            onChange={(e) => setNotes((n) => ({ ...n, [step]: e.target.value }))}
            rows={5}
            placeholder="Brouillon (non évalué) — note ici les questions que tu vas poser..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none dark:border-slate-700 dark:bg-slate-800/50"
          />
          <button onClick={skipPrep} className="text-xs font-semibold text-slate-500 hover:text-brand-600">
            Passer à l'enregistrement maintenant →
          </button>
        </div>
      ) : (
        <>
          {savingDraft[step] && (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 size={12} className="animate-spin" /> Sauvegarde automatique en cours...
            </p>
          )}
          <AudioRecorder
            key={step}
            maxSeconds={task.maxSeconds}
            disabled={submittingAll}
            onRecorded={handleRecorded}
            existingUrl={getExistingUrlForStep(step)}
          />
        </>
      )}

      <button onClick={() => handleSubmitAll(false)} disabled={submittingAll || !!otherLock} className="btn-primary w-full">
        {submittingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {submittingAll ? 'Envoi en cours...' : otherLock ? 'Une autre correction est en cours' : 'Soumettre le sujet (3 tâches)'}
      </button>
      <p className="text-center text-xs text-slate-400">
        La soumission envoie les enregistrements à l'IA puis clôture ce sujet. Les résultats arrivent par notification.
      </p>
    </div>
  )
}
