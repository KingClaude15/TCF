import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { listAllUsers, createUser, setUserStatus, setUserRole, deleteUser } from '../../services/adminService'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { UserPlus, Users, Trash2, Loader2, ShieldCheck, Search } from 'lucide-react'
import clsx from 'clsx'

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}
const STATUS_LABELS = { pending: 'En attente', approved: 'Approuvé', suspended: 'Suspendu' }
const ROLE_LABELS = { student: 'Étudiant', moderator: 'Modérateur', admin: 'Admin', super_admin: 'Super Admin' }

export default function AdminUsers() {
  const { user: currentUser, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    try {
      setUsers(await listAllUsers())
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleStatus(userId, status) {
    setBusyId(userId)
    try {
      await setUserStatus(userId, status)
      toast.success('Statut mis à jour')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleRole(userId, role) {
    setBusyId(userId)
    try {
      await setUserRole(userId, role)
      toast.success('Rôle mis à jour')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(userId) {
    if (!confirm('Supprimer définitivement ce compte ? Cette action est irréversible.')) return
    setBusyId(userId)
    try {
      await deleteUser(userId)
      toast.success('Utilisateur supprimé')
      await load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (filter !== 'all' && u.status !== filter) return false
      if (!q) return true
      const name = (u.full_name || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [users, filter, query])
  const pendingCount = users.filter((u) => u.status === 'pending').length

  if (loading) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="input-field w-64 pl-9"
            />
          </div>
          {['all', 'pending', 'approved', 'suspended'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                filter === f ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              )}
            >
              {f === 'all' ? `Tous (${users.length})` : `${STATUS_LABELS[f]}${f === 'pending' && pendingCount ? ` (${pendingCount})` : ''}`}
            </button>
          ))}
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <UserPlus size={16} /> Créer un utilisateur
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Aucun utilisateur" description="Aucun compte ne correspond à ce filtre." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Jour</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5 font-medium">
                    {u.full_name || '—'}
                    {u.id === currentUser.id && <span className="ml-1.5 text-[10px] text-slate-400">(toi)</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <select
                      value={u.role}
                      disabled={busyId === u.id || u.id === currentUser.id}
                      onChange={(e) => handleRole(u.id, e.target.value)}
                      className="rounded-md border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-700"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value} disabled={['admin', 'super_admin'].includes(value) && !isSuperAdmin}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={clsx('rounded-full px-2.5 py-1 text-[11px] font-semibold', STATUS_STYLES[u.status])}>
                      {STATUS_LABELS[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{u.current_day}/41</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {busyId === u.id ? (
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                      ) : (
                        <>
                          {u.status !== 'approved' && (
                            <button
                              onClick={() => handleStatus(u.id, 'approved')}
                              className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              title="Approuver"
                            >
                              <ShieldCheck size={16} />
                            </button>
                          )}
                          {u.status !== 'suspended' ? (
                            <button
                              onClick={() => handleStatus(u.id, 'suspended')}
                              className="rounded-md px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                            >
                              Suspendre
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatus(u.id, 'approved')}
                              className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                            >
                              Réactiver
                            </button>
                          )}
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} isSuperAdmin={isSuperAdmin} />
    </div>
  )
}

function CreateUserModal({ open, onClose, onCreated, isSuperAdmin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('student')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createUser(email, password, fullName, role)
      toast.success('Utilisateur créé et approuvé')
      setEmail('')
      setPassword('')
      setFullName('')
      setRole('student')
      onClose()
      onCreated()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Créer un utilisateur">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nom complet</label>
          <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Mot de passe temporaire</label>
          <input type="text" required minLength={6} className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
            <option value="student">Étudiant</option>
            <option value="moderator">Modérateur</option>
            {isSuperAdmin && <option value="admin">Admin</option>}
            {isSuperAdmin && <option value="super_admin">Super Admin</option>}
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving && <Loader2 size={16} className="animate-spin" />}
          Créer (compte pré-approuvé)
        </button>
      </form>
    </Modal>
  )
}
