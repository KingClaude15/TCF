/**
 * ErrorBoundary.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React class error boundary that catches any unhandled JS runtime error thrown
 * inside the component tree and renders a graceful fallback instead of a blank
 * white screen.
 *
 * Wraps the entire <App> in main.jsx so no route, lazy chunk, or context
 * provider can crash the whole application silently.
 *
 * What it handles
 * ───────────────
 *  • Uncaught render errors in any descendant component
 *  • Errors thrown during componentDidMount / useEffect (via the boundary)
 *  • Lazy-loaded chunk failures (Suspense + ErrorBoundary together)
 *
 * What it does NOT handle (by design)
 * ────────────────────────────────────
 *  • Async errors in event handlers → those stay in try/catch + toastError()
 *  • Errors outside React's render tree (e.g. setTimeout) → window.onerror
 */

import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null, showDetails: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    // In production you'd send to Sentry / LogRocket here:
    // logErrorToService(error, info)
    console.error('[ErrorBoundary] Uncaught error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null, showDetails: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { error, info, showDetails } = this.state
    const isDev = import.meta.env.DEV

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface dark:bg-surface-dark px-4 py-16 text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950 shadow-sm">
          <AlertTriangle size={36} className="text-red-500 dark:text-red-400" strokeWidth={1.75} />
        </div>

        {/* Headline */}
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Erreur inattendue
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Quelque chose s'est mal passé
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Une erreur inattendue a interrompu l'application. Ton activité récente est sauvegardée — 
            recharge la page ou retourne au tableau de bord pour continuer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => { this.handleReset(); window.location.href = '/dashboard' }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <Home size={16} />
            Tableau de bord
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={15} />
            Recharger la page
          </button>
        </div>

        {/* Dev-only details panel */}
        {isDev && error && (
          <div className="w-full max-w-xl text-left">
            <button
              onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors mb-2"
            >
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? 'Masquer' : 'Afficher'} les détails techniques (dev)
            </button>
            {showDetails && (
              <div className="rounded-xl bg-slate-900 p-4 text-left overflow-x-auto">
                <p className="text-xs font-bold text-red-400 mb-2">{error.name}: {error.message}</p>
                {error.stack && (
                  <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {error.stack}
                  </pre>
                )}
                {info?.componentStack && (
                  <>
                    <p className="text-xs font-bold text-slate-500 mt-3 mb-1">Component stack:</p>
                    <pre className="text-[11px] text-slate-500 whitespace-pre-wrap leading-relaxed">
                      {info.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="text-[11px] text-slate-400">
          Si le problème persiste, contactez l'administrateur en mentionnant l'heure et l'action effectuée.
        </p>
      </div>
    )
  }
}
