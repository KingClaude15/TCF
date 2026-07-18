import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useChallengeData } from '../hooks/useChallengeData'
import { updateProfile } from '../services/profileService'
import { Loader2, Save, UserRound, CalendarDays, Target } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'

export default function Profile() {
  const { user } = useAuth()
  const { profile, loading, refresh } = useChallengeData()
  const [fullName, setFullName] = useState('')
  const [targetScore, setTargetScore] = useState(17)
  const [saving, setSaving] = useState(false)

  if (loading || !profile) return <div className="h-64 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(user.id, {
        full_name: fullName || profile.full_name,
        target_score: Number(targetScore) || profile.target_score,
      })
      toast.success('Profil mis à jour')
      await refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        icon={UserRound}
        eyebrow="Espace personnel"
        title="Mon profil"
        subtitle="Gère tes informations personnelles et l'objectif de score que tu vises au TCF Canada."
        accent="brand"
      />

      <form onSubmit={handleSave} className="card space-y-5 p-6 sm:p-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-xl font-bold text-white shadow-sm">
            {(profile.full_name || user.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-heading text-base font-bold text-ink-900 dark:text-white">{profile.full_name || 'Candidat TCF'}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
        </div>

        <div>
          <label className="label">Nom complet</label>
          <input
            className="input-field"
            defaultValue={profile.full_name || ''}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ton nom"
          />
        </div>

        <div>
          <label className="label">Score TCF visé (sur 20 pour EE)</label>
          <input
            type="number"
            min={1}
            max={20}
            className="input-field"
            defaultValue={profile.target_score}
            onChange={(e) => setTargetScore(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
              <CalendarDays size={16} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Démarré le</p>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">{new Date(profile.challenge_start_date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300">
              <Target size={16} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Jour actuel</p>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">{profile.current_day} / 41</p>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Enregistrer
        </button>
      </form>
    </div>
  )
}
