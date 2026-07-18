import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2, GraduationCap, ShieldCheck, Headphones, BookOpen, PenLine } from 'lucide-react'

export default function Login() {
  const { signInWithEmail, signInWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      toast.success('Bon retour !')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Échec de la connexion')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error(err.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: brand / imagery panel */}
      <AuthShowcase />

      {/* Right: form panel */}
      <div className="flex items-center justify-center bg-surface px-4 py-12 dark:bg-surface-dark">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="mb-8 lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-sm">
              <GraduationCap size={22} />
            </div>
          </div>
          <div className="mb-8">
            <p className="eyebrow">Espace candidat</p>
            <h1 className="mt-1.5 font-heading text-2xl font-bold text-ink-900 dark:text-white">Bon retour parmi nous</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Connecte-toi pour continuer ton défi de 41 jours.</p>
          </div>

          <div className="card p-6 sm:p-8">
            <button onClick={handleGoogle} disabled={googleLoading} className="btn-secondary w-full">
              {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
              Continuer avec Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              OU
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-9"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="label !mb-0" htmlFor="password">Mot de passe</label>
                  <Link to="/reset-password" className="text-xs font-medium text-brand-600 hover:underline">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Se connecter
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="font-semibold text-brand-600 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=60"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchpriority="low"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-900/85 to-ink-900/60" />
      <div className="page-hero absolute inset-0 !rounded-none !border-0 !shadow-none" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
          <GraduationCap size={22} />
        </div>
        <div>
          <p className="font-heading text-base font-bold text-white">TCF 41-Day Challenge</p>
          <p className="text-xs text-white/60">Préparation officielle TCF Canada</p>
        </div>
      </div>

      <div className="relative">
        <h2 className="font-heading text-3xl font-bold leading-tight text-white xl:text-4xl">
          Prépare ton TCF Canada avec méthode.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
          41 jours de séries CO/CE, de mises en situation EE corrigées par IA et de suivi de progression,
          pensés comme un vrai programme académique.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <ShowcaseChip icon={Headphones} label="CO" />
          <ShowcaseChip icon={BookOpen} label="CE" />
          <ShowcaseChip icon={PenLine} label="EE" />
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs font-medium text-white/60">
          <ShieldCheck size={16} className="text-emerald-400" />
          Format aligné sur les épreuves officielles TCF Canada
        </div>
      </div>
    </div>
  )
}

function ShowcaseChip({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-white backdrop-blur">
      <Icon size={18} />
      <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.5 26.7 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 40.5 16.3 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.4-.1-2.5-.4-3.5z" />
    </svg>
  )
}
