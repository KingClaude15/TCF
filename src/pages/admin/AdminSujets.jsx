import { toastError } from '../../lib/errorMessages'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { listAllSujets, createSujet, updateSujet, deleteSujet, getNextSujetNumber } from '../../services/sujetsService'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, Pencil, Trash2, FileText, Loader2, EyeOff, Eye } from 'lucide-react'
import clsx from 'clsx'

const EMPTY_FORM = {
  sujet_number: '',
  tache1_prompt: '',
  tache1_min: 60,
  tache1_max: 120,
  tache2_prompt: '',
  tache2_min: 120,
  tache2_max: 150,
  tache3_theme: '',
  tache3_doc1: '',
  tache3_doc2: '',
  tache3_min: 120,
  tache3_max: 180,
  is_published: true,
}

export default function AdminSujets() {
  const { user } = useAuth()
  const [sujets, setSujets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      setSujets(await listAllSujets())
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
    const nextNumber = await getNextSujetNumber()
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
      await updateSujet(sujet.id, { is_published: !sujet.is_published })
      await load()
    } catch (err) {
      toastError(err, 'Erreur de gestion des sujets')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(sujet) {
    if (!confirm(`Supprimer le Sujet ${sujet.sujet_number} ? Les copies déjà soumises par les étudiants resteront intactes.`)) return
    setBusyId(sujet.id)
    try {
      await deleteSujet(sujet.id)
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
        <EmptyState icon={FileText} title="Aucun sujet" description="Crée le premier sujet EE pour que les étudiants puissent s'entraîner." />
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

      <SujetFormModal
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

function SujetFormModal({ open, onClose, initial, userId, onSaved }) {
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
        tache1_prompt: form.tache1_prompt,
        tache1_min: Number(form.tache1_min),
        tache1_max: Number(form.tache1_max),
        tache2_prompt: form.tache2_prompt,
        tache2_min: Number(form.tache2_min),
        tache2_max: Number(form.tache2_max),
        tache3_theme: form.tache3_theme,
        tache3_doc1: form.tache3_doc1,
        tache3_doc2: form.tache3_doc2,
        tache3_min: Number(form.tache3_min),
        tache3_max: Number(form.tache3_max),
        is_published: form.is_published,
      }
      if (form.id) {
        await updateSujet(form.id, payload)
        toast.success('Sujet mis à jour')
      } else {
        await createSujet({ ...payload, created_by: userId })
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
        <div>
          <label className="label">Numéro du sujet</label>
          <input type="number" required className="input-field" value={form.sujet_number} onChange={(e) => set('sujet_number', e.target.value)} />
        </div>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-xs font-bold uppercase text-brand-600">Tâche 1 — Message</legend>
          <textarea required rows={3} className="input-field" placeholder="Consigne du message..." value={form.tache1_prompt} onChange={(e) => set('tache1_prompt', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input-field" value={form.tache1_min} onChange={(e) => set('tache1_min', e.target.value)} placeholder="Min mots" />
            <input type="number" className="input-field" value={form.tache1_max} onChange={(e) => set('tache1_max', e.target.value)} placeholder="Max mots" />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-xs font-bold uppercase text-brand-600">Tâche 2 — Article de blog</legend>
          <textarea required rows={3} className="input-field" placeholder="Consigne de l'article..." value={form.tache2_prompt} onChange={(e) => set('tache2_prompt', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input-field" value={form.tache2_min} onChange={(e) => set('tache2_min', e.target.value)} placeholder="Min mots" />
            <input type="number" className="input-field" value={form.tache2_max} onChange={(e) => set('tache2_max', e.target.value)} placeholder="Max mots" />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-xs font-bold uppercase text-brand-600">Tâche 3 — Texte argumentatif</legend>
          <input required className="input-field" placeholder="Thème (ex: Le télétravail généralisé)" value={form.tache3_theme} onChange={(e) => set('tache3_theme', e.target.value)} />
          <textarea required rows={3} className="input-field" placeholder="Document 1..." value={form.tache3_doc1} onChange={(e) => set('tache3_doc1', e.target.value)} />
          <textarea required rows={3} className="input-field" placeholder="Document 2..." value={form.tache3_doc2} onChange={(e) => set('tache3_doc2', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input-field" value={form.tache3_min} onChange={(e) => set('tache3_min', e.target.value)} placeholder="Min mots" />
            <input type="number" className="input-field" value={form.tache3_max} onChange={(e) => set('tache3_max', e.target.value)} placeholder="Max mots" />
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
