import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CreditCard, CheckCircle2, Clock, Smartphone, Loader2, PenLine, Sparkles,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import {
  WEEKLY_PLAN,
  PAYMENT_INFO,
  FREE_EE_LIMIT,
  createPaymentRequest,
  listMyPaymentRequests,
  getEeAccessState,
  hasActiveSubscription,
} from '../services/subscriptionService'
import { toastError } from '../lib/errorMessages'

export default function Pricing() {
  const { user, profile, refreshProfile } = useAuth()
  const [operator, setOperator] = useState('mtn')
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requests, setRequests] = useState([])
  const [access, setAccess] = useState(null)

  useEffect(() => {
    if (!user) return
    listMyPaymentRequests(user.id).then(setRequests).catch(() => {})
    getEeAccessState(user.id, profile).then(setAccess).catch(() => {})
  }, [user, profile])

  const active = hasActiveSubscription(profile)

  async function handleDeclarePayment(e) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      await createPaymentRequest(user.id, {
        operator,
        referenceCode: reference.trim() || undefined,
      })
      toast.success('Demande envoyée. Un admin activera ton accès après vérification du paiement.')
      setReference('')
      if (refreshProfile) await refreshProfile()
      setRequests(await listMyPaymentRequests(user.id))
    } catch (err) {
      toastError(err, 'Impossible d’envoyer la demande')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CreditCard}
        eyebrow="Tarifs"
        title="Accès premium"
        subtitle={`${FREE_EE_LIMIT} corrections EE gratuites, puis ${WEEKLY_PLAN.label} pour un accès illimité.`}
        accent="brand"
      />

      {/* Current status */}
      <div className="card p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ton statut</p>
        {active ? (
          <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Accès actif jusqu’au{' '}
            {new Date(profile.paid_until).toLocaleString('fr-FR', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </p>
        ) : access?.reason === 'quota_exhausted' ? (
          <p className="mt-1 text-sm font-semibold text-amber-600">
            Quota gratuit terminé ({access.used}/{access.limit} EE). Passe au forfait semaine pour continuer.
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Gratuit : il te reste <strong>{access?.remaining ?? '…'}</strong> correction(s) EE sur {FREE_EE_LIMIT}.
          </p>
        )}
        {profile?.subscription_status === 'pending' && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
            <Clock size={14} /> Paiement en attente de validation par un administrateur.
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Free */}
        <div className="card p-5">
          <div className="flex items-center gap-2 text-brand-600">
            <Sparkles size={18} />
            <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white">Gratuit</h2>
          </div>
          <p className="mt-1 text-2xl font-bold">0 FCFA</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> Guide & méthodologie EE</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> {FREE_EE_LIMIT} sujets EE corrigés par l’IA</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> Chat IA & centre d’apprentissage</li>
          </ul>
        </div>

        {/* Weekly */}
        <div className="card border-brand-200 p-5 ring-1 ring-brand-100 dark:border-brand-800 dark:ring-brand-900">
          <div className="flex items-center gap-2 text-brand-600">
            <PenLine size={18} />
            <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white">Semaine intensive</h2>
          </div>
          <p className="mt-1 text-2xl font-bold">{WEEKLY_PLAN.amount.toLocaleString('fr-FR')} FCFA</p>
          <p className="text-xs text-slate-400">valable {WEEKLY_PLAN.durationDays} jours · prolongé si tu renouvelles avant la fin</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> Corrections EE illimitées</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> Tous les sujets + retakes</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" /> Idéal juste avant l’examen</li>
          </ul>
        </div>
      </div>

      {/* How to pay */}
      <div className="card space-y-4 p-5">
        <h2 className="font-heading text-base font-bold text-ink-900 dark:text-white">Comment payer (MTN / Orange)</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>
            Envoie <strong>{WEEKLY_PLAN.amount.toLocaleString('fr-FR')} FCFA</strong> via MTN MoMo ou Orange Money au numéro ci-dessous.
          </li>
          <li>
            Dans le message / référence du transfert, indique ton <strong>email de compte</strong>
            {user?.email ? <> (<span className="font-mono text-xs">{user.email}</span>)</> : null}.
          </li>
          <li>
            Reviens ici, choisis l’opérateur, (optionnel) colle l’ID de transaction, puis clique <strong>J’ai payé</strong>.
          </li>
          <li>
            Un administrateur vérifie et active ton accès (souvent en quelques heures). Tu recevras le statut sur cette page.
          </li>
        </ol>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
              <Smartphone size={14} /> {PAYMENT_INFO.mtn.label}
            </p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wide">{PAYMENT_INFO.mtn.number}</p>
            <p className="text-xs text-slate-500">{PAYMENT_INFO.mtn.name}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
              <Smartphone size={14} /> {PAYMENT_INFO.orange.label}
            </p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wide">{PAYMENT_INFO.orange.number}</p>
            <p className="text-xs text-slate-500">{PAYMENT_INFO.orange.name}</p>
          </div>
        </div>

        {user && !active && (
          <form onSubmit={handleDeclarePayment} className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-sm font-semibold">Déclarer mon paiement</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'mtn', label: 'MTN MoMo' },
                { id: 'orange', label: 'Orange Money' },
                { id: 'other', label: 'Autre' },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOperator(o.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    operator === o.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <input
              className="input-field w-full"
              placeholder="ID / référence de transaction (optionnel)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <button type="submit" disabled={submitting} className="btn-primary inline-flex items-center gap-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              J’ai payé — activer mon accès
            </button>
          </form>
        )}

        {!user && (
          <p className="text-sm">
            <Link to="/login" className="font-semibold text-brand-600 underline">Connecte-toi</Link> pour déclarer un paiement.
          </p>
        )}
      </div>

      {requests.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold">Mes demandes</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 py-2 last:border-0 dark:border-slate-800">
                <span>
                  {r.amount} {r.currency} · {r.operator || '—'} ·{' '}
                  {new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    r.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : r.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {r.status === 'approved' ? 'Approuvé' : r.status === 'rejected' ? 'Refusé' : 'En attente'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
