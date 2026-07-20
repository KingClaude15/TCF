import { toastError } from '../lib/errorMessages'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, RotateCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { getEoSujetByNumber, eoSujetToTasks, encodeTopicNumber } from '../services/sujetsService'
import { getEoSubmission, saveDraftRecording, submitRecording, retakeEoSujet } from '../services/eoService'
import { markDayModule, getActiveDay } from '../services/progressService'
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
  const [recordings, setRecordings] = useState({}) // step -> { blob, durationSeconds }
  const [existingAudioUrls, setExistingAudioUrls] = useState({}) // step -> signed URL (already-uploaded draft or submitted attempt)
  const [draftAudioPaths, setDraftAudioPaths] = useState({}) // step -> raw storage path, so a refresh can finalize without re-recording
  const [savingDraft, setSavingDraft] = useState({}) // step -> boolean, brief "saving..." indicator
  const [feedbacks, setFeedbacks] = useState({})
  const [submittingAll, setSubmittingAll] = useState(false)
  const [phase, setPhase] = useState('recording') // 'recording' | 'results' | 'closed-empty'
  const [expired, setExpired] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [retaking, setRetaking] = useState(false)
  const [previousScores, setPreviousScores] = useState({})
  const [prepDone, setPrepDone] = useState(new Set()) // steps whose prep countdown has finished/been skipped
  const [prepRemaining, setPrepRemaining] = useState(0)
  const [notes, setNotes] = useState({}) // step -> scratch notes typed during prep (local only, never submitted)

  const timerKey = user ? `eo_timer_sujet_${user.id}_${sujetNumber}` : null
  const blobUrlCacheRef = useRef({}) // step -> object URL created from an in-memory blob, cached to avoid recreation/leaks

  const load = useCallback(async () => {
    setLoading(true)
    setPreviousScores({})
    // Release any cached preview URLs from a previously-loaded sujet before
    // fetching this one's data.
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
      for (let i = 0; i < existing.length; i++) {
        const sub = existing[i]
        if (!sub) continue
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
      setRecordings({})

      if (taskList.length > 0 && taskList.every((_, i) => nextFeedback[i])) {
        setPhase('results')
      } else {
        setPhase('recording')
      }
      setHasStarted(false)
      setPrepDone(new Set())
      setPrepRemaining(0)
      if (timerKey) clearExamTimer(timerKey)
    } finally {
      setLoading(false)
    }
  }, [sujetNumber, user])

  useEffect(() => {
    load()
  }, [load])

  const task = tasks[step]
  const examDurationSeconds =
    tasks.reduce((sum, t) => sum + (t.maxSeconds || 0) + (t.prepSeconds || 0), 0) || 12 * 60
  const inPrep = task && task.prepSeconds > 0 && !prepDone.has(step)

  // Starts (or restarts) the prep countdown whenever the student lands on a
  // task that requires preparation and hasn't finished prepping it yet.
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

    // Persist immediately in the background — this is what makes the
    // recording survive a page refresh. Recording locally in the UI never
    // waits on this; it's fire-and-forget with a soft failure toast.
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
      } catch (err) {
        toast.error(`Échec de la sauvegarde automatique (${currentTask.taskLabel}) — réessaie si tu rafraîchis la page.`)
      } finally {
        setSavingDraft((s) => ({ ...s, [currentStep]: false }))
      }
    })()
  }

  // The preview URL AudioRecorder should show for the *current* step:
  // prefer the in-memory blob just recorded this session (cached to avoid
  // recreating object URLs on every render), otherwise fall back to a
  // previously-uploaded draft/submission fetched from storage.
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
      setSubmittingAll(true)
      try {
        const dayNumber = await getActiveDay(user.id)
        const nextFeedback = { ...feedbacks }
        const nextUrls = { ...existingAudioUrls }
        let anySubmitted = false

        for (let i = 0; i < tasks.length; i++) {
          const t = tasks[i]
          const rec = recordings[i]
          if (nextFeedback[i]) {
            anySubmitted = true
            continue // already evaluated in a previous sitting
          }
          const existingPath = draftAudioPaths[i]
          if (!rec?.blob && !existingPath) continue // nothing recorded for this tâche — skip it

          const feedback = await submitRecording({
            userId: user.id,
            topicNumber: encodeTopicNumber(sujetNumber, t.taskType),
            prompt: t.prompt,
            taskType: t.taskType,
            dayNumber,
            audioBlob: rec?.blob,
            durationSeconds: rec?.durationSeconds,
            existingAudioPath: rec?.blob ? undefined : existingPath,
          })
          nextFeedback[i] = feedback
          if (rec?.blob) nextUrls[i] = URL.createObjectURL(rec.blob)
          anySubmitted = true
        }

        setFeedbacks(nextFeedback)
        setExistingAudioUrls(nextUrls)
        clearExamTimer(timerKey)

        if (!anySubmitted) {
          setPhase('closed-empty')
        } else {
          await markDayModule(user.id, dayNumber, 'eo_done')
          setRecordings({})
          setPhase('results')
          toast.success(auto ? 'Temps écoulé — sujet soumis automatiquement.' : 'Sujet soumis et évalué !')
        }
      } catch (err) {
        toastError(err, 'Erreur lors de la soumission EO')
      } finally {
        setSubmittingAll(false)
      }
    },
    [tasks, recordings, feedbacks, existingAudioUrls, draftAudioPaths, sujetNumber, timerKey, user]
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
            {(recordings[i]?.blob || draftAudioPaths[i] || feedbacks[i]) && <span className="ml-1 text-amber-500">●</span>}
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

      <button onClick={() => handleSubmitAll(false)} disabled={submittingAll} className="btn-primary w-full">
        {submittingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {submittingAll ? 'Évaluation des 3 tâches en cours...' : 'Soumettre le sujet (3 tâches)'}
      </button>
      <p className="text-center text-xs text-slate-400">
        La soumission envoie et évalue les tâches enregistrées, puis clôture ce sujet.
      </p>
    </div>
  )
}
