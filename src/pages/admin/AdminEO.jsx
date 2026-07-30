import { toastError } from '../../lib/errorMessages'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { listAllEoSujets, createEoSujet, updateEoSujet, deleteEoSujet, getNextEoSujetNumber } from '../../services/sujetsService'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, Pencil, Trash2, Mic, Loader2, EyeOff, Eye } from 'lucide-react'
import clsx from 'clsx'

const EMPTY_FORM = {
  sujet_number: '',
  title: '',
  tache1_prompt: '',
  tache1_max_seconds: 120,
  tache2_prompt: '',
  tache2_prep_seconds: 120,
  tache2_max_seconds: 210,
  tache3_topic: '',
  tache3_prep_seconds: 0,
  tache3_max_seconds: 270,
  is_published: true,
}

export default function AdminEO() {
  const { user } = useAuth()
  const [sujets, setSujets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      setSujets(await listAllEoSujets())
    } catch (err) {
      toastError(err, 'Erreur de gestion des sujets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function openCreate() {
    const nextNumber = await getNextEoSujetNumber()
    setEditing({ ...EMPTY_FORM, sujet_number: nextNumber })
    setModalOpen(true)
  }

  function openEdit(sujet) {
    setEditing(sujet)
    setModalOpen(true)
  }

  async function handleTogglePublish(sujet) {
    setBusyId(sujet.id)
    try {
      await updateEoSujet(sujet.id, { is_published: !sujet.is_published })
      await load()
    } catch (err) {
      toastError(err, 'Erreur de gestion des sujets')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(sujet) {
    if (!confirm(`Supprimer le Sujet ${sujet.sujet_number} ? Les enregistrements déjà soumis par les étudiants resteront intacts.`)) return
    setBusyId(sujet.id)
    try {
      await deleteEoSujet(sujet.id)
      toast.success('Sujet supprimé')
      await load()
    } catch (err) {
      toastError(err, 'Erreur de gestion des sujets')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{sujets.length} sujet(s) — chacun contient les Tâches 1, 2 et 3.</p>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nouveau sujet
        </button>
      </div>

      {sujets.length === 0 ? (
        <EmptyState icon={Mic} title="Aucun sujet" description="Crée le premier sujet EO pour que les étudiants puissent s'entraîner à l'oral." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sujets.map((sujet) => (
            <div key={sujet.id} className="card flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Sujet {sujet.sujet_number}</span>
                <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold', sujet.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800')}>
                  {sujet.is_published ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{sujet.tache1_prompt}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <button onClick={() => openEdit(sujet)} className="btn-secondary flex-1 !py-1.5 !text-xs">
                  <Pencil size={13} /> Modifier
                </button>
                <button
                  onClick={() => handleTogglePublish(sujet)}
                  disabled={busyId === sujet.id}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={sujet.is_published ? 'Dépublier' : 'Publier'}
                >
                  {busyId === sujet.id ? <Loader2 size={14} className="animate-spin" /> : sujet.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(sujet)}
                  disabled={busyId === sujet.id}
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

      <EoSujetFormModal
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

function EoSujetFormModal({ open, onClose, initial, userId, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) setForm(initial)
  }, [initial])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        sujet_number: Number(form.sujet_number),
        title: form.title || null,
        tache1_prompt: form.tache1_prompt,
        tache1_max_seconds: Number(form.tache1_max_seconds),
        tache2_prompt: form.tache2_prompt,
        tache2_prep_seconds: Number(form.tache2_prep_seconds),
        tache2_max_seconds: Number(form.tache2_max_seconds),
        tache3_topic: form.tache3_topic,
        tache3_prep_seconds: Number(form.tache3_prep_seconds),
        tache3_max_seconds: Number(form.tache3_max_seconds),
        is_published: form.is_published,
      }
      if (form.id) {
        await updateEoSujet(form.id, payload)
        toast.success('Sujet mis à jour')
      } else {
        await createEoSujet({ ...payload, created_by: userId })
        toast.success('Sujet créé')
      }
      onSaved()
    } catch (err) {
      toastError(err, 'Erreur de gestion des sujets')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={form.id ? `Modifier le Sujet ${form.sujet_number}` : 'Nouveau sujet'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Numéro du sujet</label>
            <input type="number" required className="input-field" value={form.sujet_number} onChange={(e) => set('sujet_number', e.target.value)} />
          </div>
          <div>
            <label className="label">Titre (optionnel)</label>
            <input className="input-field" placeholder="Ex: Sujet 4" value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
          </div>
        </div>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-xs font-bold uppercase text-brand-600">Tâche 1 — Entretien dirigé (sans préparation)</legend>
          <textarea required rows={3} className="input-field" placeholder="Consigne de l'entretien dirigé..." value={form.tache1_prompt} onChange={(e) => set('tache1_prompt', e.target.value)} />
          <input type="number" className="input-field" value={form.tache1_max_seconds} onChange={(e) => set('tache1_max_seconds', e.target.value)} placeholder="Durée max (secondes)" />
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-xs font-bold uppercase text-brand-600">Tâche 2 — Poser des questions (avec préparation)</legend>
          <textarea required rows={3} className="input-field" placeholder="Situation à préparer, consigne pour poser des questions..." value={form.tache2_prompt} onChange={(e) => set('tache2_prompt', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input-field" value={form.tache2_prep_seconds} onChange={(e) => set('tache2_prep_seconds', e.target.value)} placeholder="Préparation (secondes)" />
            <input type="number" className="input-field" value={form.tache2_max_seconds} onChange={(e) => set('tache2_max_seconds', e.target.value)} placeholder="Durée max (secondes)" />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-xs font-bold uppercase text-brand-600">Tâche 3 — Point de vue (sans préparation)</legend>
          <textarea required rows={3} className="input-field" placeholder="Question / affirmation à commenter..." value={form.tache3_topic} onChange={(e) => set('tache3_topic', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input-field" value={form.tache3_prep_seconds} onChange={(e) => set('tache3_prep_seconds', e.target.value)} placeholder="Préparation (secondes)" />
            <input type="number" className="input-field" value={form.tache3_max_seconds} onChange={(e) => set('tache3_max_seconds', e.target.value)} placeholder="Durée max (secondes)" />
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
          Publié (visible par les étudiants)
        </label>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {form.id ? 'Enregistrer les modifications' : 'Créer le sujet'}
        </button>
      </form>
    </Modal>
  )
}
