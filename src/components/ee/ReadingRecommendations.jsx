import { ExternalLink, BookOpen, Monitor, BookMarked, Star, ChevronDown, ChevronUp, GraduationCap, Sparkles } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { getRecommendations } from '../../data/readingRecommendations'
import { CEFR_BAND_STYLES } from '../../lib/cecrBands'

const TYPE_CONFIG = {
  guide:    { label: 'Guide TCF',  icon: BookMarked, color: 'bg-ee-light text-ee-dark dark:bg-pink-950 dark:text-pink-300' },
  textbook: { label: 'Manuel',     icon: BookOpen,   color: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' },
  website:  { label: 'Site web',   icon: Monitor,    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  video:    { label: 'Vidéo',      icon: Monitor,    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
}

const FORMAT_BADGE = {
  'PDF':      'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'Print':    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  'Print+PDF':'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Online':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'App':      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
}

const BADGE_STYLE = {
  'Bestseller':     'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'Gratuit':        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Blog gratuit':   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Officiel':       'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  'Tâche 3':        'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  'Débutants':      'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'Incontournable': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'Référence mondiale': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'B1→B2':          'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  'B2→C2':          'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  'B2→C1/C2':       'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'Méthode complète':'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  'Essentiel':      'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

function ResourceCard({ resource }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.guide
  const Icon = cfg.icon

  return (
    <div className="card overflow-hidden transition-all duration-200">
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Emoji cover */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl
                          bg-slate-50 dark:bg-slate-800 text-2xl border border-slate-100
                          dark:border-slate-700">
            {resource.coverEmoji}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', cfg.color)}>
                <Icon size={10} />
                {cfg.label}
              </span>
              <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold', FORMAT_BADGE[resource.format] || FORMAT_BADGE['Online'])}>
                {resource.format}
              </span>
              {resource.badge && (
                <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold', BADGE_STYLE[resource.badge] || 'bg-slate-100 text-slate-600')}>
                  {resource.badge}
                </span>
              )}
              {resource.price === null && (
                <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold">
                  Gratuit
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-ink-900 dark:text-white leading-snug">{resource.title}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{resource.author}</p>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right">
            <p className={clsx(
              'text-sm font-bold',
              resource.price === null ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
            )}>
              {resource.price === null ? 'Gratuit' : resource.price}
            </p>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 flex w-full items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Masquer les détails' : 'Voir les détails'}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 animate-fadeIn">
            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {resource.description}
            </p>

            {/* Highlights */}
            <ul className="space-y-1.5">
              {resource.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Star size={11} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

            {/* CECRL levels */}
            <div className="flex flex-wrap gap-1">
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
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <span>
            {resource.type === 'website' ? 'Accéder gratuitement' :
             resource.price === null ? 'Accéder gratuitement' :
             'Voir sur Amazon / site officiel'}
          </span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}

export default function ReadingRecommendations({ cefrBand, score }) {
  const [activeTab, setActiveTab] = useState('guides')
  const { guides, books } = getRecommendations(cefrBand)

  if (!cefrBand || (!guides.length && !books.length)) return null

  const bandStyle = CEFR_BAND_STYLES[cefrBand] || ''

  const NEXT_STEP_MSG = {
    'A1 non atteint': 'Commence par les bases de la grammaire et la structure des tâches TCF.',
    'A1': 'Concentre-toi sur la compréhension du format et les structures de base.',
    'A2': 'Travaille la grammaire intermédiaire et apprends les formules de politesse.',
    'B1': 'Enrichis ton vocabulaire et renforce la structure de tes argumentations.',
    'B2': 'Vise la précision lexicale et maîtrise les connecteurs logiques avancés.',
    'C1': 'Perfectionne ton style, ta nuance argumentative et la richesse de tes constructions.',
    'C2': 'Maintiens ce niveau — lis des textes académiques et continue à pratiquer régulièrement.',
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-r from-slate-50 to-white dark:from-navy-900/30 dark:to-transparent">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
            <GraduationCap size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-ink-900 dark:text-white">
                Ressources recommandées pour ton niveau
              </h3>
              <span className={clsx('badge text-xs font-bold', bandStyle)}>{cefrBand}</span>
              {score != null && (
                <span className="text-xs text-slate-400">({score}/20)</span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {NEXT_STEP_MSG[cefrBand] || 'Voici les meilleures ressources pour progresser.'}
            </p>
          </div>
        </div>

        {/* Source note */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Sparkles size={10} />
          <span>Sélection basée sur les résultats de ta correction · Mis à jour 2026</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-slate-200 dark:border-slate-800
                      bg-slate-50 dark:bg-slate-900/40 p-1">
        <button
          onClick={() => setActiveTab('guides')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
            activeTab === 'guides'
              ? 'bg-white dark:bg-slate-800 text-ink-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <BookMarked size={13} />
          Guides TCF
          <span className="rounded-full bg-ee-light text-ee-dark dark:bg-pink-950 dark:text-pink-300 px-1.5 py-0.5 text-[10px] font-bold">
            {guides.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
            activeTab === 'books'
              ? 'bg-white dark:bg-slate-800 text-ink-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <BookOpen size={13} />
          Manuels B1→C2
          <span className="rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 px-1.5 py-0.5 text-[10px] font-bold">
            {books.length}
          </span>
        </button>
      </div>

      {/* Tab: Guides TCF */}
      {activeTab === 'guides' && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-400 px-1">
            Ces guides sont spécifiquement conçus pour l'Expression Écrite du TCF Canada — méthodologie, modèles de réponses et critères d'examinateurs.
          </p>
          {guides.map(r => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}

      {/* Tab: Manuels de français */}
      {activeTab === 'books' && (
        <div className="space-y-3 animate-fadeIn">
          <p className="text-xs text-slate-400 px-1">
            Ces manuels t'aident à progresser durablement en français — grammaire, vocabulaire, style — pour aller de B1 à C2 et maintenir ce niveau bien après l'examen.
          </p>
          {books.map(r => <ResourceCard key={r.id} resource={r} />)}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center px-4">
        Ces recommandations sont éditoriales et non sponsorisées. Les liens Amazon et sites tiers s'ouvrent dans un nouvel onglet.
      </p>
    </div>
  )
}
