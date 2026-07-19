/**
 * ResetPassword.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles two flows:
 *
 *  1. REQUEST flow  — user arrives from the "Mot de passe oublié ?" link on
 *     Login. They enter their email and we call supabase.auth.resetPasswordForEmail.
 *     Supabase emails them a link that redirects back to /reset-password with
 *     a one-time token in the URL hash.
 *
 *  2. CONFIRM flow — user arrives from that email link (URL contains
 *     #access_token=... or type=recovery). We let them set a new password.
 *
 * The AuthContext.resetPassword helper already calls Supabase correctly so we
 * call it here. The confirm step calls supabase.auth.updateUser directly.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { toastError } from '../lib/errorMessages'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2, GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  // Detect whether we're in "confirm" mode (arrived via email link)
  const [mode, setMode] = useState('request') // 'request' | 'confirm' | 'done'
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Supabase v2 puts the recovery token in the URL hash as
    // #access_token=...&type=recovery  OR  as a PKCE code in the query string.
    // Either way, onAuthStateChange fires a PASSWORD_RECOVERY event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('confirm')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── REQUEST flow ────────────────────────────────────────────────────────────
  async function handleRequest(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setMode('done')
    } catch (err) {
      toastError(err, 'Impossible d\'envoyer l\'email de réinitialisation.')
    } finally {
      setLoading(false)
    }
  }

  // ── CONFIRM flow ────────────────────────────────────────────────────────────
  async function handleConfirm(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les deux mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Mot de passe mis à jour ! Vous pouvez maintenant vous connecter.')
      navigate('/login')
    } catch (err) {
      toastError(err, 'La mise à jour du mot de passe a échoué.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface dark:bg-surface-dark px-4 py-16">
      <div className="w-full max-w-md animate-fadeIn">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-sm">
            <GraduationCap size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            TCF 41-Day Challenge
          </p>
        </div>

        {/* ── DONE state ─────────────────────────────────────────────── */}
        {mode === 'done' && (
          <div className="card p-8 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 size={44} className="text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Email envoyé
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un email 
              avec un lien de réinitialisation dans quelques minutes. Vérifiez aussi vos 
              courriers indésirables.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Retour à la connexion
            </Link>
          </div>
        )}

        {/* ── REQUEST flow ──────────────────────────────────────────── */}
        {mode === 'request' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Mot de passe oublié ?
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <div className="card p-6 sm:p-8">
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">Adresse email</label>
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
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Envoyer le lien de réinitialisation
                </button>
              </form>
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500">
              <ArrowLeft size={14} />
              <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </>
        )}

        {/* ── CONFIRM flow ──────────────────────────────────────────── */}
        {mode === 'confirm' && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Nouveau mot de passe
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choisissez un nouveau mot de passe sécurisé pour votre compte.
              </p>
            </div>

            <div className="card p-6 sm:p-8">
              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="label" htmlFor="newPassword">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="newPassword"
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-9"
                      placeholder="Au moins 6 caractères"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-9"
                      placeholder="Répétez le mot de passe"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                {/* Strength hint */}
                {newPassword.length > 0 && (
                  <p className={`text-xs font-medium ${newPassword.length >= 12 ? 'text-emerald-600' : newPassword.length >= 8 ? 'text-amber-600' : 'text-red-500'}`}>
                    Force : {newPassword.length >= 12 ? 'Forte ✓' : newPassword.length >= 8 ? 'Moyenne' : 'Faible'}
                  </p>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Enregistrer le nouveau mot de passe
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
