import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChallengeData } from '../hooks/useChallengeData'
import { updateProfile } from '../services/profileService'
import { toastError } from '../lib/errorMessages'
import toast from 'react-hot-toast'
import {
  Loader2, Save, UserRound, CalendarDays, Target, Flame,
  Trophy, TrendingUp, Headphones, BookOpen, PenLine,
  ShieldCheck, Mail, BadgeCheck, Clock, Mic,
} from 'lucide-react'
import clsx from 'clsx'

// CECR colours — matches cecrBands.js
const CEFR_CONFIG = {
  C2:             { label: 'C2',             bg: 'bg-emerald-500', light: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  C1:             { label: 'C1',             bg: 'bg-teal-500',    light: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
  B2:             { label: 'B2',             bg: 'bg-brand-500',   light: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' },
  B1:             { label: 'B1',             bg: 'bg-sky-500',     light: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  A2:             { label: 'A2',             bg: 'bg-amber-500',   light: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  A1:             { label: 'A1',             bg: 'bg-orange-500',  light: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  'A1 non atteint':{ label: 'Non atteint',  bg: 'bg-red-500',     light: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', icon: ShieldCheck, cls: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  admin:       { label: 'Admin',       icon: ShieldCheck, cls: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  moderator:   { label: 'Modérateur', icon: ShieldCheck, cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  student:     { label: 'Candidat',   icon: UserRound,   cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
}

function avatarInitials(name, email) {
  if (name) {
    const parts = name.trim().split(' ').filter(Boolean)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return (email?.[0] || 'U').toUpperCase()
}

function ScoreBadge({ score, max, label, icon: Icon, cecrLevel, color }) {
  const pct = max ? Math.round((score / max) * 100) : 0
  const cfg = CEFR_CONFIG[cecrLevel] || CEFR_CONFIG['A1 non atteint']
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={clsx('flex h-7 w-7 items-center justify-center rounded-lg', color)}>
            <Icon size={14} className="text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        {cecrLevel && (
          <span className={clsx('badge text-[10px] font-bold', cfg.light)}>{cfg.label}</span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="font-heading text-2xl font-bold text-ink-900 dark:text-white tabular-nums">
            {score ?? '—'}
          </p>
          <p className="text-[11px] text-slate-400">sur {max}</p>
        </div>
        {pct > 0 && (
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pct}%</p>
          </div>
        )}
      </div>
      {pct > 0 && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={clsx('h-full rounded-full transition-all duration-700', cfg.bg)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const { profile, loading, refresh, coResults, ceResults, eeSubmissions, coAverage, ceAverage, eeAverage } = useChallengeData()

  const [fullName,    setFullName]    = useState('')
  const [targetScore, setTargetScore] = useState(17)
  const [examDate,    setExamDate]    = useState('')
  const [saving,      setSaving]      = useState(false)
  const [activeTab,   setActiveTab]   = useState('info')

  // Sync form with loaded profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setTargetScore(profile.target_score || 17)
      setExamDate(profile.exam_date || '')
    }
  }, [profile])

  if (loading || !profile) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
        </div>
      </div>
    )
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(user.id, {
        full_name:    fullName   || profile.full_name,
        target_score: Number(targetScore) || profile.target_score,
        exam_date:    examDate   || null,
      })
      toast.success('Profil mis à jour')
      await refresh()
    } catch (err) {
      toastError(err, 'Impossible de mettre à jour le profil')
    } finally {
      setSaving(false)
    }
  }

  // Derived stats
  const initials    = avatarInitials(profile.full_name, user.email)
  const roleCfg     = ROLE_CONFIG[profile.role] || ROLE_CONFIG.student
  const RoleIcon    = roleCfg.icon
  const startDate   = new Date(profile.challenge_start_date)
  const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / 86_400_000)
  const lastCoCecr  = coResults?.slice(-1)[0]?.cecr_level
  const lastCeCecr  = ceResults?.slice(-1)[0]?.cecr_level

  // Best EE score
  const eeScores = (eeSubmissions || [])
    .flatMap(s => s.ai_feedback || [])
    .map(f => f.estimated_score)
    .filter(s => s != null)
  const bestEe  = eeScores.length ? Math.max(...eeScores) : null
  const lastEeCecr = eeScores.length
    ? (() => {
        const s = eeScores[eeScores.length - 1]
        if (s >= 18) return 'C2'; if (s >= 14) return 'C1'; if (s >= 10) return 'B2'
        if (s >= 6)  return 'B1'; if (s >= 2)  return 'A2'; if (s >= 1)  return 'A1'
        return 'A1 non atteint'
      })()
    : null

  const TABS = [
    { key: 'info',   label: 'Informations' },
    { key: 'scores', label: 'Mes scores' },
    { key: 'settings', label: 'Paramètres' },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Top banner */}
        <div className="h-24 bg-gradient-to-r from-brand-600 via-brand-700 to-ink-900 relative">
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl
                              bg-gradient-to-br from-brand-400 to-brand-700
                              text-2xl font-bold text-white shadow-lg ring-4 ring-white dark:ring-surface-dark">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center
                              rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-dark">
                <BadgeCheck size={14} className="text-white" />
              </div>
            </div>
            <span className={clsx('badge flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold', roleCfg.cls)}>
              <RoleIcon size={12} />
              {roleCfg.label}
            </span>
          </div>

          {/* Name & email */}
          <h1 className="font-heading text-xl font-bold text-ink-900 dark:text-white">
            {profile.full_name || 'Candidat TCF'}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-0.5">
            <Mail size={13} />
            {user.email}
          </p>

          {/* Quick stats row */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: CalendarDays, label: 'Jour actuel',   value: `${profile.current_day} / 41` },
              { icon: Flame,        label: 'Série actuelle', value: `${profile.current_streak} j.` },
              { icon: Trophy,       label: 'Meilleure série',value: `${profile.longest_streak} j.` },
              { icon: Clock,        label: 'Jours écoulés',  value: `${daysElapsed} j.` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                                bg-white dark:bg-slate-900 shadow-sm">
                  <Icon size={15} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-ink-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-slate-200 dark:border-slate-800
                      bg-slate-50 dark:bg-slate-900/40 p-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={clsx(
              'flex-1 rounded-lg py-2 text-sm font-semibold transition-all',
              activeTab === t.key
                ? 'bg-white dark:bg-slate-800 text-ink-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Informations ─────────────────────────────────────────── */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="font-heading text-base font-bold text-ink-900 dark:text-white">
              Informations du compte
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: 'Email',            value: user.email },
                { label: 'Rôle',             value: roleCfg.label },
                { label: 'Démarré le',        value: startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Score cible (EE)', value: `${profile.target_score} / 20` },
                { label: 'Statut du compte', value: profile.status === 'approved' ? 'Approuvé ✓' : profile.status },
                { label: 'Date d\'examen',   value: profile.exam_date ? new Date(profile.exam_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-800/40 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Challenge progress bar */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-base font-bold text-ink-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-500" />
                Progression du défi
              </h2>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {profile.current_day} / 41 jours
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
                style={{ width: `${Math.round((profile.current_day / 41) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {Math.round((profile.current_day / 41) * 100)}% complété · {41 - profile.current_day} jours restants
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: Scores ───────────────────────────────────────────────── */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ScoreBadge
              label="CO moyen"
              icon={Headphones}
              score={coAverage}
              max={699}
              cecrLevel={lastCoCecr}
              color="bg-co-DEFAULT"
            />
            <ScoreBadge
              label="CE moyen"
              icon={BookOpen}
              score={ceAverage}
              max={699}
              cecrLevel={lastCeCecr}
              color="bg-ce-DEFAULT"
            />
            <ScoreBadge
              label="EE meilleur"
              icon={PenLine}
              score={bestEe}
              max={20}
              cecrLevel={lastEeCecr}
              color="bg-ee-DEFAULT"
            />
          </div>

          {/* Activity summary */}
          <div className="card p-5">
            <h3 className="font-heading text-sm font-bold text-ink-900 dark:text-white mb-4">
              Activité par module
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Compréhension Orale',  icon: Headphones, count: coResults?.length ?? 0, color: 'bg-co-DEFAULT',  max: 41 },
                { label: 'Compréhension Écrite', icon: BookOpen,   count: ceResults?.length ?? 0, color: 'bg-ce-DEFAULT',  max: 41 },
                { label: 'Expression Écrite',    icon: PenLine,    count: (eeSubmissions || []).filter(s => s.ai_feedback?.[0]).length, color: 'bg-ee-DEFAULT', max: 41 },
              ].map(({ label, icon: Icon, count, color, max }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', color)}>
                    <Icon size={13} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all duration-700', color)}
                        style={{ width: `${Math.min(100, Math.round((count / max) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Paramètres ───────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSave} className="card p-6 space-y-5">
          <h2 className="font-heading text-base font-bold text-ink-900 dark:text-white">
            Modifier mon profil
          </h2>

          <div>
            <label className="label" htmlFor="fullName">Nom complet</label>
            <input
              id="fullName"
              className="input-field"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ton nom complet"
            />
          </div>

          <div>
            <label className="label" htmlFor="targetScore">
              Score EE visé
              <span className="ml-2 text-[11px] font-normal text-slate-400">(sur 20 — ex : 14 = niveau C1)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                id="targetScore"
                type="range"
                min={1}
                max={20}
                step={1}
                value={targetScore}
                onChange={e => setTargetScore(e.target.value)}
                className="flex-1 accent-brand-600"
              />
              <div className="flex h-10 w-14 items-center justify-center rounded-lg
                              border border-slate-200 dark:border-slate-700
                              bg-white dark:bg-slate-900 text-sm font-bold
                              text-ink-900 dark:text-white tabular-nums">
                {targetScore}
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 select-none">
              {['A1','A2','B1','B2','C1','C2'].map(l => <span key={l}>{l}</span>)}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="examDate">
              Date d'examen prévue
              <span className="ml-2 text-[11px] font-normal text-slate-400">(optionnel — utilisé par le Coach IA)</span>
            </label>
            <input
              id="examDate"
              type="date"
              className="input-field"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
            />
          </div>

          <div className="pt-1">
            <button type="submit" disabled={saving} className="btn-primary w-full py-3">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
