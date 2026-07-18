import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getTopicByNumber } from '../data/eeTopics'
import { getEeSubmission, saveDraft, submitForEvaluation } from '../services/eeService'
import { markDayModule } from '../services/progressService'
import { getProfile } from '../services/profileService'
import AiFeedbackPanel from '../components/ee/AiFeedbackPanel'

const MIN_WORDS = 60

export default function EEWorkspace() {
  const { topicNumber } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const topic = getTopicByNumber(topicNumber)

  const [essay, setEssay] = useState('')
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evaluating, setEvaluating] = useState(false)

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const existing = await getEeSubmission(user.id, Number(topicNumber))
      setSubmission(existing)
      setEssay(existing?.final_content || existing?.draft_content || '')
    } finally {
      setLoading(false)
    }
  }, [user, topicNumber])

  useEffect(() => {
    load()
  }, [load])

  async function handleSaveDraft() {
    setSaving(true)
    try {
      const profile = await getProfile(user.id)
      const saved = await saveDraft(user.id, {
        topicNumber: Number(topicNumber),
        prompt: topic?.prompt,
        draftContent: essay,
        dayNumber: profile.current_day,
      })
      setSubmission(saved)
      toast.success('Brouillon enregistré')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleEvaluate() {
    if (wordCount < MIN_WORDS) {
      toast.error(`Écris au moins ${MIN_WORDS} mots avant de soumettre.`)
      return
    }
    setEvaluating(true)
    try {
      let current = submission
      if (!current) {
        const profile = await getProfile(user.id)
        current = await saveDraft(user.id, {
          topicNumber: Number(topicNumber),
          prompt: topic?.prompt,
          draftContent: essay,
          dayNumber: profile.current_day,
        })
      }
      const feedback = await submitForEvaluation({
        submissionId: current.id,
        prompt: topic?.prompt,
        essay,
        topicNumber: Number(topicNumber),
      })

      const profile = await getProfile(user.id)
      await markDayModule(user.id, current.day_number || profile.current_day, 'ee_done')

      setSubmission({ ...current, status: 'evaluated', ai_feedback: [feedback] })
      toast.success('Évaluation terminée !')
    } catch (err) {
      toast.error(err.message || "Échec de l'évaluation")
    } finally {
      setEvaluating(false)
    }
  }

  if (!topic) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">Sujet introuvable.</p>
        <Link to="/ee" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    )
  }

  const feedback = submission?.ai_feedback?.[0]

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/ee')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Retour aux sujets
      </button>

      <div>
        <span className="text-xs font-bold uppercase text-ee-DEFAULT">{topic.taskType} — Sujet {topic.number}</span>
        <h2 className="mt-1 text-lg font-bold leading-snug">{topic.prompt}</h2>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="card p-4">
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                rows={16}
                className="w-full resize-none border-0 bg-transparent text-sm leading-relaxed focus:outline-none"
                placeholder="Écris ta réponse ici..."
              />
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                <span>{wordCount} mots {wordCount < MIN_WORDS && `(min. ${MIN_WORDS})`}</span>
                {submission?.status && <span className="capitalize">{submission.status}</span>}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSaveDraft} disabled={saving || !essay.trim()} className="btn-secondary flex-1">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Sauvegarder brouillon
              </button>
              <button onClick={handleEvaluate} disabled={evaluating || !essay.trim()} className="btn-primary flex-1">
                {evaluating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Évaluer avec l'IA
              </button>
            </div>
          </div>

          <div>
            {feedback ? (
              <AiFeedbackPanel feedback={feedback} />
            ) : (
              <div className="card flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-sm text-slate-400">
                <Sparkles size={28} className="text-slate-300" />
                Soumets ton texte pour recevoir une évaluation détaillée par IA.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
