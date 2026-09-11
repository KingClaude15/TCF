import { useState } from 'react'
import clsx from 'clsx'
import {
  CheckCircle2, AlertTriangle, Sparkles, BookText,
  FileText, ArrowRight, GraduationCap,
} from 'lucide-react'
import ReadingRecommendations from './ReadingRecommendations'

const TABS = [
  { key: 'submitted', label: 'Ma réponse',        icon: FileText },
  { key: 'overview',  label: 'Aperçu',             icon: Sparkles },
  { key: 'mistakes',  label: 'Erreurs',             icon: AlertTriangle },
  { key: 'corrected', label: 'Version corrigée',   icon: CheckCircle2 },
  { key: 'model',     label: 'Modèle C2',           icon: BookText },
  { key: 'vocab',     label: 'Vocabulaire',          icon: ArrowRight },
  { key: 'lectures',  label: 'Lectures',             icon: GraduationCap },
]

const CATEGORY_STYLES = {
  grammaire: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  conjugaison: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  orthographe: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  syntaxe: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  lexique: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  structure: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  registre: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}

function asText(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function asArray(value) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * Render feedback text as structured sections + bullet lists.
 * Recognizes headings like "Points forts :", lines starting with - • *,
 * and numbered lines 1. 2.
 */
function StructuredText({ text }) {
  const raw = asText(text).trim()
  if (!raw) return null

  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const blocks = []
  let current = { title: null, items: [], prose: [] }

  const flush = () => {
    if (current.title || current.items.length || current.prose.length) {
      blocks.push(current)
      current = { title: null, items: [], prose: [] }
    }
  }

  const isHeading = (line) =>
    /^(points?\s+forts?|points?\s+[àa]\s+corriger|synth[eè]se|recommandations?|erreurs?|forces?|faiblesses?)\b/i.test(
      line.replace(/[:：]\s*$/, '')
    ) || (/[:：]\s*$/.test(line) && line.length < 60)

  const isBullet = (line) => /^([•\-\*–—]|\d+[.)])\s+/.test(line)

  for (const line of lines) {
    if (isHeading(line) && !isBullet(line)) {
      flush()
      current.title = line.replace(/[:：]\s*$/, '')
      continue
    }
    if (isBullet(line)) {
      current.items.push(line.replace(/^([•\-\*–—]|\d+[.)])\s+/, ''))
      continue
    }
    // Plain sentence: if we already have bullets, treat as item; else prose
    if (current.items.length) {
      current.items.push(line)
    } else {
      current.prose.push(line)
    }
  }
  flush()

  // Fallback: no structure detected → keep paragraph breaks
  if (blocks.length === 1 && !blocks[0].title && !blocks[0].items.length) {
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {raw.split(/\n+/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => (
        <div key={bi}>
          {block.title && (
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {block.title}
            </p>
          )}
          {block.prose.length > 0 && (
            <div className="mb-1.5 space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {block.prose.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {block.items.length > 0 && (
            <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function FeedbackBlock({ title, text }) {
  const body = asText(text)
  if (!body) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/40">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <StructuredText text={body} />
    </div>
  )
}

export default function AiFeedbackPanel({ feedback, submittedText }) {
  const [tab, setTab] = useState('overview')
  if (!feedback) return null

  const cefr = asText(feedback.cefr_level) || '—'
  const score = typeof feedback.estimated_score === 'number'
    ? feedback.estimated_score
    : asText(feedback.estimated_score) || '—'
  const mistakes = asArray(feedback.mistakes).map((m) =>
    m && typeof m === 'object'
      ? m
      : { category: 'Autre', original: asText(m), correction: '', explanation: '' }
  )
  const vocab = asArray(feedback.vocabulary_suggestions).map((v) =>
    v && typeof v === 'object'
      ? v
      : { basic: asText(v), advanced: '', context: '' }
  )

  const visibleTabs = submittedText
    ? TABS
    : TABS.filter((t) => t.key !== 'submitted')

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900 dark:text-white">Évaluation IA</p>
            <p className="text-[11px] text-slate-500">Feedback structuré — erreurs, points et recommandations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Niveau {cefr}
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {score} / 20
          </span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-2 dark:border-slate-800">
        {visibleTabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={clsx(
                'relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors',
                active
                  ? 'text-brand-600 dark:text-brand-300'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <Icon size={13} />
              {label}
              {key === 'mistakes' && mistakes.length > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  {mistakes.length}
                </span>
              )}
              {key === 'lectures' && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Nouveau
                </span>
              )}
              {active && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-500" />
              )}
            </button>
          )
        })}
      </div>

      <div className="p-5">
        {tab === 'submitted' && submittedText && (
          <div className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed dark:border-slate-700 dark:bg-slate-800/50">
            <FileText size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{submittedText}</p>
          </div>
        )}

        {(tab === 'overview' || (tab === 'submitted' && !submittedText)) && (
          <div className="space-y-4 text-sm">
            {mistakes.length > 0 && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-3.5 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle size={13} />
                  {mistakes.length} erreur{mistakes.length > 1 ? 's' : ''} identifiée{mistakes.length > 1 ? 's' : ''} — détail dans l&apos;onglet Erreurs
                </p>
                <ul className="space-y-1.5 text-xs text-amber-900/90 dark:text-amber-200/90">
                  {mistakes.slice(0, 4).map((m, i) => (
                    <li key={i} className="flex flex-wrap gap-1">
                      <span className="font-medium line-through opacity-80">{asText(m.original)}</span>
                      <span>→</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{asText(m.correction)}</span>
                    </li>
                  ))}
                  {mistakes.length > 4 && (
                    <li className="text-amber-700 dark:text-amber-400">+ {mistakes.length - 4} autre(s) dans l&apos;onglet Erreurs</li>
                  )}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FeedbackBlock title="Grammaire" text={asText(feedback.grammar_feedback)} />
              <FeedbackBlock title="Vocabulaire" text={asText(feedback.vocabulary_feedback)} />
              <FeedbackBlock title="Organisation" text={asText(feedback.organization_feedback)} />
              <FeedbackBlock title="Réalisation de la tâche" text={asText(feedback.task_achievement_feedback)} />
            </div>

            {feedback.recommendations && (
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/40">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                  <Sparkles size={13} /> Recommandations personnalisées
                </p>
                <StructuredText text={asText(feedback.recommendations)} />
              </div>
            )}
          </div>
        )}

        {tab === 'mistakes' && (
          <div className="space-y-3">
            {mistakes.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 size={28} className="text-emerald-500" />
                <p className="text-sm font-semibold text-ink-900 dark:text-white">Aucune erreur majeure détectée 🎉</p>
              </div>
            )}
            {mistakes.map((m, idx) => {
              const cat = asText(m.category).toLowerCase() || 'autre'
              const badge = CATEGORY_STYLES[cat] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-100 bg-white p-4 dark:border-amber-900/50 dark:bg-slate-900/40"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">#{idx + 1}</span>
                    <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', badge)}>
                      {asText(m.category) || 'Autre'}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold uppercase text-slate-400">Votre texte</p>
                      <p className="text-sm text-red-600/90 line-through dark:text-red-400">{asText(m.original)}</p>
                    </div>
                    <ArrowRight size={14} className="mx-auto hidden text-slate-300 sm:mt-5 sm:block" />
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold uppercase text-slate-400">Correction</p>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{asText(m.correction)}</p>
                    </div>
                  </div>
                  {m.explanation && (
                    <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                      <p className="mb-0.5 text-[10px] font-bold uppercase text-slate-400">Explication</p>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{asText(m.explanation)}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'corrected' && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-relaxed dark:border-emerald-900 dark:bg-emerald-950/20">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{asText(feedback.corrected_version)}</p>
          </div>
        )}

        {tab === 'model' && (
          <div className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm leading-relaxed dark:border-brand-900 dark:bg-brand-950/30">
            <BookText size={15} className="mt-0.5 shrink-0 text-brand-500" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{asText(feedback.model_answer)}</p>
          </div>
        )}

        {tab === 'vocab' && (
          <div className="space-y-2">
            {vocab.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">Aucune suggestion de vocabulaire pour cette copie.</p>
            )}
            {vocab.map((v, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900/20"
              >
                <span className="flex-shrink-0 text-slate-400 line-through dark:text-slate-500">{asText(v.basic)}</span>
                <ArrowRight size={13} className="flex-shrink-0 text-slate-300" />
                <span className="flex-1 font-semibold text-brand-600 dark:text-brand-400">{asText(v.advanced)}</span>
                {v.context && (
                  <span className="text-right text-[11px] text-slate-400 dark:text-slate-500">{asText(v.context)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'lectures' && (
          <ReadingRecommendations
            cefrBand={asText(feedback.cefr_level)}
            score={feedback.estimated_score}
          />
        )}
      </div>
    </div>
  )
}
