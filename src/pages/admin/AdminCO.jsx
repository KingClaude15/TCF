import { toastError } from '../../lib/errorMessages'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import {
  listAllCoSeries,
  createCoSeries,
  updateCoSeries,
  deleteCoSeries,
  getNextCoSeriesNumber,
} from '../../services/coSeriesService'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, Pencil, Trash2, Headphones, Loader2, EyeOff, Eye, X } from 'lucide-react'
import clsx from 'clsx'

function emptyQuestion() {
  return { id: `q${Date.now()}${Math.random().toString(36).slice(2, 6)}`, text: '', options: ['', '', '', ''], correct_index: 0 }
}

const EMPTY_FORM = {
  series_number: '',
  title: '',
  audio_url: '',
  transcript: '',
  difficulty: 'medium',
  questions: [emptyQuestion()],
  is_published: true,
}

export default function AdminCO() {
  const { user } = useAuth()
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      setSeries(await listAllCoSeries())
    } catch (err) {
      toastError(err, 'Erreur de gestion CO')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function openCreate() {
    const nextNumber = await getNextCoSeriesNumber()
    setEditing({ ...EMPTY_FORM, series_number: nextNumber, questions: [emptyQuestion()] })
    setModalOpen(true)
  }

  function openEdit(s) {
    setEditing({ ...s, questions: s.questions?.length ? s.questions : [emptyQuestion()] })
    setModalOpen(true)
  }

  async function handleTogglePublish(s) {
    setBusyId(s.id)
    try {
      await updateCoSeries(s.id, { is_published: !s.is_published })
      await load()
    } catch (err) {
      toastError(err, 'Erreur de gestion CO')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(s) {
    if (!confirm(`Supprimer la série CO ${s.series_number} ?`)) return
    setBusyId(s.id)
    try {
      await deleteCoSeries(s.id)
      toast.success('Série supprimée')
      await load()
    } catch (err) {
      toastError(err, 'Erreur de gestion CO')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{series.length} série(s) de compréhension orale.</p>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nouvelle série
        </button>
      </div>

      {series.length === 0 ? (
        <EmptyState icon={Headphones} title="Aucune série" description="Crée la première série CO pour que les étudiants puissent s'entraîner." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <div key={s.id} className="card flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Série {s.series_number}</span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    s.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  )}
                >
                  {s.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{s.title}</p>
              <p className="text-[11px] text-slate-400">{s.questions?.length ?? 0} question(s) · {s.difficulty}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <button onClick={() => openEdit(s)} className="btn-secondary flex-1 !py-1.5 !text-xs">
                  <Pencil size={13} /> Modifier
                </button>
                <button
                  onClick={() => handleTogglePublish(s)}
                  disabled={busyId === s.id}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={s.is_published ? 'Dépublier' : 'Publier'}
                >
                  {busyId === s.id ? <Loader2 size={14} className="animate-spin" /> : s.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  disabled={busyId === s.id}
                  className="rounded-md p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CoFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        userId={user.id}
        onSaved={() => {
          setModalOpen(false)
          load()
        }}
      />
    </div>
  )
}

function CoFormModal({ open, onClose, initial, userId, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) setForm(initial)
  }, [initial])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function updateQuestion(qIdx, patch) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === qIdx ? { ...q, ...patch } : q)),
    }))
  }

  function updateOption(qIdx, optIdx, value) {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? value : o)) } : q
      ),
    }))
  }

  function addQuestion() {
    setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion()] }))
  }

  function removeQuestion(qIdx) {
    setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qIdx) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanQuestions = form.questions
      .filter((q) => q.text.trim() && q.options.every((o) => o.trim()))
      .map((q) => ({ ...q, correct_index: Number(q.correct_index) }))
    if (cleanQuestions.length === 0) {
      toast.error('Ajoute au moins une question complète (texte + 4 options).')
      return
    }
    setSaving(true)
    try {
      const payload = {
        series_number: Number(form.series_number),
        title: form.title,
        audio_url: form.audio_url || null,
        transcript: form.transcript || null,
        difficulty: form.difficulty,
        questions: cleanQuestions,
        is_published: form.is_published,
      }
      if (form.id) {
        await updateCoSeries(form.id, payload)
        toast.success('Série mise à jour')
      } else {
        await createCoSeries({ ...payload, created_by: userId })
        toast.success('Série créée')
      }
      onSaved()
    } catch (err) {
      toastError(err, 'Erreur de gestion CO')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={form.id ? `Modifier la série ${form.series_number}` : 'Nouvelle série CO'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">N° série</label>
            <input type="number" required className="input-field" value={form.series_number} onChange={(e) => set('series_number', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Titre</label>
            <input required className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex : Le télétravail en France" />
          </div>
        </div>

        <div>
          <label className="label">Difficulté</label>
          <select className="input-field" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>

        <div>
          <label className="label">URL audio (mp3 hébergé, ou lien YouTube)</label>
          <input
            className="input-field"
            value={form.audio_url}
            onChange={(e) => set('audio_url', e.target.value)}
            placeholder="https://... ou https://youtube.com/watch?v=..."
          />
          <p className="mt-1 text-[11px] text-slate-400">Laisse vide si tu n'as pas encore d'audio — les étudiants verront un avertissement.</p>
        </div>

        <div>
          <label className="label">Transcription (optionnel, révélée après soumission)</label>
          <textarea rows={4} className="input-field" value={form.transcript} onChange={(e) => set('transcript', e.target.value)} placeholder="Texte de l'audio, pour révision après le quiz..." />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label !mb-0">Questions à choix multiple</label>
            <button type="button" onClick={addQuestion} className="text-xs font-semibold text-brand-600 hover:underline">
              + Ajouter une question
            </button>
          </div>

          {form.questions.map((q, qIdx) => (
            <fieldset key={q.id} className="space-y-2.5 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <input
                  required
                  className="input-field flex-1"
                  placeholder={`Question ${qIdx + 1}`}
                  value={q.text}
                  onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
                />
                {form.questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIdx)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={Number(q.correct_index) === optIdx}
                      onChange={() => updateQuestion(qIdx, { correct_index: optIdx })}
                      title="Bonne réponse"
                    />
                    <input
                      required
                      className="input-field flex-1 !py-1.5 !text-sm"
                      placeholder={`Option ${optIdx + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">Sélectionne le bouton radio devant la bonne réponse.</p>
            </fieldset>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
          Publié (visible par les étudiants)
        </label>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {form.id ? 'Enregistrer les modifications' : 'Créer la série'}
        </button>
      </form>
    </Modal>
  )
}
