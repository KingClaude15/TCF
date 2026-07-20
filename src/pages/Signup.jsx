import { toastError } from '../lib/errorMessages'
import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Loader2, GraduationCap } from 'lucide-react'
import { AuthShowcase } from './Login'

export default function Signup() {
  const { signUpWithEmail, signInWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setLoading(true)
    try {
      await signUpWithEmail(email, password, fullName)
      toast.success('Compte créé ! Un administrateur doit approuver ton accès avant de commencer.')
      navigate('/dashboard')
    } catch (err) {
      toastError(err, 'Echec de l inscription')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      toastError(err, 'Echec de l inscription')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthShowcase />

      <div className="flex items-center justify-center bg-surface px-4 py-12 dark:bg-surface-dark">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="mb-8 lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-sm">
              <GraduationCap size={22} />
            </div>
          </div>
          <div className="mb-8">
            <p className="eyebrow">Nouvelle inscription</p>
            <h1 className="mt-1.5 font-heading text-2xl font-bold text-ink-900 dark:text-white">Commence ton défi</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">41 jours pour réussir ton TCF Canada.</p>
          </div>

          <div className="card p-6 sm:p-8">
            <button onClick={handleGoogle} disabled={googleLoading} className="btn-secondary w-full">
              {googleLoading && <Loader2 size={16} className="animate-spin" />}
              S'inscrire avec Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              OU
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="fullName">Nom complet</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-9"
                    placeholder="Jong Claude"
                  />
                </div>
              </div>
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
                <label className="label" htmlFor="password">Mot de passe</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-9"
                    placeholder="Au moins 6 caractères"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Créer mon compte
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
