import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, RefreshCcw, Check, X } from 'lucide-react'
import {
  listAllPayments,
  approvePayment,
  rejectPayment,
} from '../../services/subscriptionService'
import { listAllUsers } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'
import { toastError } from '../../lib/errorMessages'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminPayments() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const [payments, allUsers] = await Promise.all([listAllPayments(), listAllUsers()])
      setRows(payments)
      setUsers(Object.fromEntries(allUsers.map((u) => [u.id, u])))
    } catch (err) {
      toastError(err, 'Chargement des paiements impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onApprove(id) {
    setBusyId(id)
    try {
      const { paidUntil } = await approvePayment(id, user.id)
      toast.success(`Accès activé jusqu’au ${new Date(paidUntil).toLocaleString('fr-FR')}`)
      await load()
    } catch (err) {
      toastError(err, 'Approbation échouée')
    } finally {
      setBusyId(null)
    }
  }

  async function onReject(id) {
    const note = window.prompt('Motif du refus (optionnel) :') || ''
    setBusyId(id)
    try {
      await rejectPayment(id, user.id, note)
      toast.success('Demande refusée')
      await load()
    } catch (err) {
      toastError(err, 'Refus échoué')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold">Paiements manuels</h2>
          <p className="text-xs text-slate-400">MTN MoMo / Orange Money — valider après vérification du transfert</p>
        </div>
        <button onClick={load} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <RefreshCcw size={16} />
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Aucun paiement" description="Les déclarations des étudiants apparaîtront ici." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-800">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Opérateur</th>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const u = users[r.user_id]
                return (
                  <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u?.full_name || '—'}</p>
                      <p className="text-xs text-slate-400">{u?.email || r.user_id}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {r.amount} {r.currency}
                      <span className="block text-[11px] font-normal text-slate-400">{r.duration_days} j</span>
                    </td>
                    <td className="px-4 py-3 capitalize">{r.operator || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.reference_code || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          r.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 'pending' && (
                        <div className="inline-flex gap-1">
                          <button
                            disabled={busyId === r.id}
                            onClick={() => onApprove(r.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {busyId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Approuver
                          </button>
                          <button
                            disabled={busyId === r.id}
                            onClick={() => onReject(r.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            <X size={12} /> Refuser
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
