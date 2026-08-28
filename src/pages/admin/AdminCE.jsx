import { toastError } from '../../lib/errorMessages'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import {
  listAllCeSeries,
  createCeSeries,
  updateCeSeries,
  deleteCeSeries,
  getNextCeSeriesNumber,
} from '../../services/ceSeriesService'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, Pencil, Trash2, BookOpen, Loader2, EyeOff, Eye, X, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'

function emptyQuestion() {
  return {
    id: `q${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    image: '',
    options: ['', '', '', ''],
    correct_index: 0,
  }
}

const EMPTY_FORM = {
  series_number: '',
  title: '',
  passage_text: '',
  difficulty: 'medium',
  questions: [emptyQuestion()],
  is_published: true,
}

export default function AdminCE() {
  const { user } = useAuth()
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await listAllCeSeries()
      setSeries(data || [])
    } catch (err) {
      console.error(err)
      setLoadError(err?.message || 'Impossible de charger les séries CE')
      toastError(err, 'Erreur de gestion CE — vérifie que tu es admin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function openCreate() {
    const nextNumber = await getNextCeSeriesNumber()
    setEditing({ ...EMPTY_FORM, series_number: nextNumber, questions: [emptyQuestion()] })
    setModalOpen(true)
  }

  function openEdit(s) {
    setEditing({
      ...s,
      questions: (s.questions?.length ? s.questions : [emptyQuestion()]).map((q) => ({
        ...emptyQuestion(),
        ...q,
        options: q.options?.length === 4 ? q.options : ['', '', '', ''],
        image: q.image || '',
      })),
    })
    setModalOpen(true)
  }

  async function handleTogglePublish(s) {
    setBusyId(s.id)
    try {
      await updateCeSeries(s.id, { is_published: !s.is_published })
      await load()
    } catch (err) {
      toastError(err, 'Erreur de gestion CE')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(s) {
    if (!confirm(`Supprimer la série CE ${s.series_number} ?`)) return
    setBusyId(s.id)
    try {
      await deleteCeSeries(s.id)
      toast.success('Série supprimée')
      await load()
    } catch (err) {
      toastError(err, 'Erreur de gestion CE')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {series.length} série(s) CE · clique <strong>Modifier</strong> pour régler les bonnes réponses (A/B/C/D).
          </p>
          {loadError && <p className="mt-1 text-xs text-red-600">{loadError}</p>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="btn-secondary !text-xs">
            Rafraîchir
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Nouvelle série
          </button>
        </div>
      </div>

      {series.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucune série CE"
          description="Si tu as déjà exécuté le SQL de la série 1, vérifie ton rôle admin (is_admin). Sinon crée une série ou relance la migration 0016_ce_serie_1.sql."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <div key={s.id} className="card flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Série {s.series_number}</span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    s.is_published
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  )}
                >
                  {s.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{s.title}</p>
              <p className="text-[11px] text-slate-400">
                {s.questions?.length ?? 0} question(s) · {s.difficulty}
                {s.questions?.[0]?.image ? ' · images' : ''}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <button onClick={() => openEdit(s)} className="btn-secondary flex-1 !py-1.5 !text-xs">
                  <Pencil size={13} /> Modifier / réponses
                </button>
                <button
                  onClick={() => handleTogglePublish(s)}
                  disabled={busyId === s.id}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={s.is_published ? 'Dépublier' : 'Publier'}
                >
                  {busyId === s.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : s.is_published ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  disabled={busyId === s.id}
                  className="rounded-md p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CeSeriesForm
          key={editing.id || 'new'}
          initial={editing}
          userId={user?.id}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setModalOpen(false)
            setEditing(null)
            await load()
          }}
        />
      )}
    </div>
  )
}

function CeSeriesForm({ initial, userId, open, onClose, onSaved }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
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
      .filter((q) => (q.text?.trim() || q.image?.trim()) && q.options.some((o) => o?.trim()))
      .map((q) => ({
        id: q.id,
        text: q.text?.trim() || 'Question',
        image: q.image?.trim() || undefined,
        image_crop: q.image ? 'document' : undefined,
        options: q.options.map((o) => o || ''),
        correct_index: Number(q.correct_index) || 0,
      }))

    if (!cleanQuestions.length) {
      toast.error('Ajoute au moins une question (texte ou image + options).')
      return
    }

    setSaving(true)
    try {
      const payload = {
        series_number: Number(form.series_number),
        title: form.title.trim(),
        passage_text: form.passage_text?.trim() || '',
        difficulty: form.difficulty,
        questions: cleanQuestions,
        is_published: !!form.is_published,
      }
      if (form.id) {
        await updateCeSeries(form.id, payload)
        toast.success('Série CE mise à jour')
      } else {
        await createCeSeries({ ...payload, created_by: userId })
        toast.success('Série CE créée')
      }
      onSaved()
    } catch (err) {
      toastError(err, 'Enregistrement impossible')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={form.id ? `Série CE ${form.series_number}` : 'Nouvelle série CE'} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-slate-500">N° série</span>
            <input
              required
              type="number"
              min={1}
              className="input-field"
              value={form.series_number}
              onChange={(e) => set('series_number', e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-slate-500">Difficulté</span>
            <select className="input-field" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Titre</span>
          <input required className="input-field" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Consigne (optionnel)</span>
          <textarea className="input-field min-h-[60px]" value={form.passage_text || ''} onChange={(e) => set('passage_text', e.target.value)} />
        </label>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Questions ({form.questions.length})</p>
          <button type="button" onClick={addQuestion} className="btn-secondary !py-1 !text-xs">
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="space-y-4">
          {form.questions.map((q, qIdx) => (
            <fieldset key={q.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500">Q{qIdx + 1}</span>
                {form.questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIdx)} className="rounded-md p-1 text-red-500 hover:bg-red-50">
                    <X size={14} />
                  </button>
                )}
              </div>
              <input
                className="input-field mb-2 !text-sm"
                placeholder="Énoncé de la question"
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
              />
              <div className="mb-2 flex items-center gap-2">
                <ImageIcon size={14} className="text-slate-400" />
                <input
                  className="input-field flex-1 !py-1.5 !text-xs"
                  placeholder="URL image ex. /ce/serie-1/1.png"
                  value={q.image || ''}
                  onChange={(e) => updateQuestion(qIdx, { image: e.target.value })}
                />
              </div>
              {q.image && (
                <img src={q.image} alt="" className="mb-2 max-h-24 rounded-lg object-cover object-top" />
              )}
              <p className="mb-1 text-[11px] font-semibold text-slate-500">
                Options — coche la <span className="text-emerald-600">bonne réponse</span>
              </p>
              <div className="space-y-1.5">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={Number(q.correct_index) === optIdx}
                      onChange={() => updateQuestion(qIdx, { correct_index: optIdx })}
                      title="Bonne réponse"
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="w-5 text-xs font-bold text-slate-400">{String.fromCharCode(65 + optIdx)}</span>
                    <input
                      className="input-field flex-1 !py-1.5 !text-sm"
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      value={opt}
                      onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
          Publié (visible par les étudiants)
        </label>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {form.id ? 'Enregistrer les bonnes réponses' : 'Créer la série'}
        </button>
      </form>
    </Modal>
  )
}
