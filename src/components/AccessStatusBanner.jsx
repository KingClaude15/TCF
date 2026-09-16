import { Link } from 'react-router-dom'
import { Clock, AlertTriangle, Infinity, CheckCircle2 } from 'lucide-react'
import { getAccessSummary } from '../services/subscriptionService'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

/**
 * Shows remaining access days for students with a paid period.
 * Place on Dashboard (and optionally layout).
 */
export default function AccessStatusBanner({ compact = false }) {
  const { profile } = useAuth()
  const summary = getAccessSummary(profile)

  if (!profile || summary.kind === 'staff') return null

  if (summary.kind === 'active') {
    const urgent = summary.daysLeft <= 3
    const dateStr = summary.until.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return (
      <div
        className={clsx(
          'flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
          urgent
            ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
            : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100'
        )}
      >
        <div className="flex items-start gap-2.5">
          {urgent ? (
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          ) : (
            <Clock size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          )}
          <div>
            <p className="text-sm font-bold">
              {summary.daysLeft === 1
                ? 'Il vous reste 1 jour d’accès'
                : `Il vous reste ${summary.daysLeft} jours d’accès`}
            </p>
            {!compact && (
              <p className="text-xs opacity-80">
                Accès valable jusqu’au <strong>{dateStr}</strong>
                {urgent ? ' — pensez à renouveler bientôt.' : '.'}
              </p>
            )}
          </div>
        </div>
        {urgent && (
          <Link
            to="/pricing"
            className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-amber-700"
          >
            Renouveler
          </Link>
        )}
      </div>
    )
  }

  if (summary.kind === 'expired') {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Votre période d’accès est terminée</p>
            {!compact && (
              <p className="text-xs opacity-80">
                Renouvelez pour continuer les corrections illimitées et les modules payants.
              </p>
            )}
          </div>
        </div>
        <Link
          to="/pricing"
          className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-red-700"
        >
          Voir les offres
        </Link>
      </div>
    )
  }

  if (summary.kind === 'pending') {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <Clock size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold">Paiement en cours de validation</p>
          {!compact && (
            <p className="text-xs opacity-80">
              Un administrateur activera votre accès dès confirmation du paiement.
            </p>
          )}
        </div>
      </div>
    )
  }

  // free — optional light info, not alarming
  if (compact) return null
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
      <Infinity size={18} className="mt-0.5 shrink-0 text-slate-400" />
      <div>
        <p className="text-sm font-semibold">Compte gratuit</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Quota limité sur les corrections EE. Un accès payant débloque plus de jours d’utilisation.
        </p>
      </div>
    </div>
  )
}

/** Compact chip for sidebar / header */
export function AccessDaysChip() {
  const { profile } = useAuth()
  const summary = getAccessSummary(profile)
  if (!profile || summary.kind === 'staff' || summary.kind === 'free') return null

  if (summary.kind === 'active') {
    const urgent = summary.daysLeft <= 3
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold',
          urgent
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
        )}
        title={summary.until.toLocaleString('fr-FR')}
      >
        <Clock size={12} />
        {summary.daysLeft} j restant{summary.daysLeft > 1 ? 's' : ''}
      </span>
    )
  }

  if (summary.kind === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-800 dark:bg-red-950 dark:text-red-200">
        <AlertTriangle size={12} /> Accès expiré
      </span>
    )
  }

  if (summary.kind === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
        <Clock size={12} /> En validation
      </span>
    )
  }

  return null
}
