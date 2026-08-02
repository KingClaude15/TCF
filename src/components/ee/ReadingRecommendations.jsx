import { useState } from 'react'
import {
  ExternalLink, BookMarked, Monitor, FileDown,
  Headphones, Wrench, GraduationCap, Star,
  ChevronDown, ChevronUp, Sparkles, BookOpen,
} from 'lucide-react'
import clsx from 'clsx'
import { getRecommendations } from '../../data/readingRecommendations'
import { CEFR_BAND_STYLES } from '../../lib/cecrBands'

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  website: { label: 'Site web',      icon: Monitor,    color: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' },
  pdf:     { label: 'PDF gratuit',   icon: FileDown,   color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  video:   { label: 'Vidéo / Podcast', icon: Headphones, color: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  course:  { label: 'Cours en ligne', icon: GraduationCap, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  tool:    { label: 'Outil gratuit',  icon: Wrench,     color: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
}

// ── Badge styles ──────────────────────────────────────────────────────────────
const BADGE_STYLE = {
  '100% Gratuit':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Officiel FEI':   'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  'Blog gratuit':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'PDF Gratuit':    'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'Sujets réels':   'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'Outil gratuit':  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Gratuit (audit)':'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
}

// ── Format badge ──────────────────────────────────────────────────────────────
const FORMAT_STYLE = {
  'Site officiel':  'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  'Site web':       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  'PDF gratuit':    'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'Blog gratuit':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Cours en ligne': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'Outil':          'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Vidéo / Podcast':'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
}

// ── Resource card ─────────────────────────────────────────────────────────────
function ResourceCard({ resource }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.website
  const Icon = cfg.icon

  return (
    <div className="card overflow-hidden transition-shadow duration-200 hover:shadow-cardHover">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Emoji icon */}
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center
                          rounded-xl border border-slate-100 dark:border-slate-700
                          bg-slate-50 dark:bg-slate-800 text-xl">
            {resource.coverEmoji}
          </div>

          <div className="flex-1 min-w-0">
            {/* Type + format + badge row */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', cfg.color)}>
                <Icon size={10} />
                {cfg.label}
              </span>
              <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold', FORMAT_STYLE[resource.format] || FORMAT_STYLE['Site web'])}>
                {resource.format}
              </span>
              {resource.badge && (
                <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-bold', BADGE_STYLE[resource.badge] || 'bg-slate-100 text-slate-600')}>
                  {resource.badge}
                </span>
              )}
            </div>

            {/* Title + author */}
            <h4 className="text-sm font-bold text-ink-900 dark:text-white leading-snug">
              {resource.title}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{resource.author}</p>
          </div>

          {/* Free pill — always shown on the right */}
          <span className="flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950
                           text-emerald-700 dark:text-emerald-300 px-2.5 py-1
                           text-[10px] font-bold whitespace-nowrap">
            Gratuit
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 flex items-center gap-1.5 text-[11px] font-medium
                     text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                     transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Masquer les détails' : 'Voir les détails'}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 space-y-3 animate-fadeIn">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {resource.description}
            </p>
            <ul className="space-y-1.5">
              {resource.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Star size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            {/* CECRL levels */}
            <div className="flex flex-wrap gap-1 pt-1">
              {resource.level.map(l => (
                <span key={l} className={clsx('badge text-[10px]', CEFR_BAND_STYLES[l])}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA footer */}
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between border-t border-slate-100
                   dark:border-slate-800 px-4 py-2.5 text-xs font-semibold
                   text-brand-600 dark:text-brand-400 hover:bg-slate-50
                   dark:hover:bg-slate-800/30 transition-colors"
      >
        <span>Accéder gratuitement →</span>
        <ExternalLink size={12} />
      </a>
    </div>
  )
}

// ── Personalised next-step message ────────────────────────────────────────────
const NEXT_STEP = {
  'A1 non atteint': "Commence par te familiariser avec le format des 3 tâches et les structures de base. L'objectif immédiat est d'atteindre A1 en écrivant des phrases simples et cohérentes.",
  'A1':  "Travaille les formules de base pour chaque tâche et assure-toi de respecter le nombre de mots minimum. L'objectif est A2.",
  'A2':  "Tu maîtrises les bases. Concentre-toi sur les connecteurs logiques simples (d'abord, ensuite, enfin) et l'enrichissement de ton vocabulaire. L'objectif est B1.",
  'B1':  "Bon niveau ! Enrichis ta syntaxe, varie tes structures de phrases et entraîne-toi sur la Tâche 3 (argumentation). L'objectif est B2 pour l'immigration.",
  'B2':  "Très bien. Peaufine la précision lexicale, maîtrise le subjonctif et les connecteurs d'opposition. Un score de 14+ (C1) est à portée.",
  'C1':  "Excellent niveau. Travaille la nuance argumentative, la richesse stylistique et la fluidité. Tu es à deux points du maximum.",
  'C2':  "Niveau maximal atteint. Maintiens ce niveau en lisant régulièrement en français et en pratiquant l'argumentation sur des sujets complexes.",
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReadingRecommendations({ cefrBand, score }) {
  const [activeTab, setActiveTab] = useState('guides')

  if (!cefrBand) return null

  const { guides, resources } = getRecommendations(cefrBand)
  if (!guides.length && !resources.length) return null

  const bandStyle = CEFR_BAND_STYLES[cefrBand] || ''

  const TABS = [
    { key: 'guides',    label: 'Guides TCF',         icon: BookMarked, count: guides.length },
    { key: 'resources', label: 'Progression B1→C2',  icon: BookOpen,   count: resources.length },
  ]

  return (
    <div className="space-y-4">

      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800
                      bg-gradient-to-r from-slate-50 to-white
                      dark:from-slate-900/40 dark:to-transparent p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center
                          rounded-xl bg-brand-50 dark:bg-brand-950">
            <GraduationCap size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-ink-900 dark:text-white">
                Ressources gratuites recommandées
              </h3>
              <span className={clsx('badge text-xs font-bold', bandStyle)}>
                {cefrBand}
              </span>
              {score != null && (
                <span className="text-xs text-slate-400 font-medium">{score}/20</span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {NEXT_STEP[cefrBand]}
            </p>
          </div>
        </div>

        {/* Free-only notice */}
        <div className="mt-3 flex items-center gap-2 rounded-xl
                        bg-emerald-50 dark:bg-emerald-950/30
                        border border-emerald-100 dark:border-emerald-900
                        px-3 py-2">
          <span className="text-emerald-500 text-base">🎁</span>
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            Toutes ces ressources sont <strong>100% gratuites</strong> — aucun achat, aucune inscription requise pour la majorité d'entre elles.
          </p>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Sparkles size={10} />
          <span>Sélection personnalisée selon ton score · Vérifiées et mises à jour en 2026</span>
        </div>
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl border border-slate-200 dark:border-slate-800
                      bg-slate-50 dark:bg-slate-900/40 p-1">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
                activeTab === t.key
                  ? 'bg-white dark:bg-slate-800 text-ink-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <Icon size={13} />
              {t.label}
              <span className={clsx(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                activeTab === t.key
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              )}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Guides TCF tab ───────────────────────────────────────────── */}
      {activeTab === 'guides' && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-400 px-1 leading-relaxed">
            Des ressources spécifiquement conçues pour le TCF Canada Expression Écrite — méthodologie, sujets réels, modèles de réponses et critères d'examinateurs. Toutes gratuites.
          </p>
          {guides.map(r => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}

      {/* ── Progression resources tab ─────────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-400 px-1 leading-relaxed">
            Des outils et plateformes gratuits pour progresser durablement en français — grammaire, vocabulaire, style d'argumentation — de B1 jusqu'au C2.
          </p>
          {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center px-4 leading-relaxed">
        Ces recommandations sont éditoriales, non sponsorisées et vérifiées gratuites en août 2026. Les liens s'ouvrent dans un nouvel onglet.
      </p>
    </div>
  )
}
