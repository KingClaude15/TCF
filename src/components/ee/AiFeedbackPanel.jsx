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

export default function AiFeedbackPanel({ feedback, submittedText }) {
  const [tab, setTab] = useState('submitted')
  if (!feedback) return null

  // Normalize AI payload so unexpected shapes never crash the UI
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
      {/* Panel header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4
                      border-b border-slate-100 dark:border-slate-800
                      bg-slate-50 dark:bg-slate-900/30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ee-light dark:bg-pink-950">
            <Sparkles size={14} className="text-ee-DEFAULT" />
          </div>
          <h3 className="text-sm font-semibold text-ink-900 dark:text-white">Évaluation IA</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ee-light px-3 py-1 text-xs font-bold text-ee-dark dark:bg-pink-950 dark:text-pink-300">
            Niveau {cefr}
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {score} / 20
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
        {visibleTabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition-colors',
                t.key === 'lectures'
                  ? tab === t.key
                    ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-amber-500'
                  : tab === t.key
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon size={12} />
              {t.label}
              {t.key === 'lectures' && (
                <span className="ml-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-bold">
                  Nouveau
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="p-5">

        {tab === 'submitted' && submittedText && (
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50
                          border border-slate-100 dark:border-slate-700 p-4 text-sm leading-relaxed">
            <FileText size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{submittedText}</p>
          </div>
        )}

        {(tab === 'overview' || (tab === 'submitted' && !submittedText)) && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FeedbackBlock title="Grammaire"             text={asText(feedback.grammar_feedback)} />
              <FeedbackBlock title="Vocabulaire"           text={asText(feedback.vocabulary_feedback)} />
              <FeedbackBlock title="Organisation"          text={asText(feedback.organization_feedback)} />
              <FeedbackBlock title="Réalisation de la tâche" text={asText(feedback.task_achievement_feedback)} />
            </div>
            {feedback.recommendations && (
              <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                  <Sparkles size={13} /> Recommandations personnalisées
                </p>
                <p className="text-sm text-brand-800 dark:text-brand-200 leading-relaxed">{asText(feedback.recommendations)}</p>
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
            {mistakes.map((m, idx) => (
              <div key={idx} className="rounded-xl border border-amber-100 dark:border-amber-900
                                        bg-amber-50 dark:bg-amber-950/30 p-3.5">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">{asText(m.category)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="text-red-500 line-through">{asText(m.original)}</span>
                  <ArrowRight size={13} className="text-slate-300 flex-shrink-0" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{asText(m.correction)}</span>
                </div>
                {m.explanation && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{asText(m.explanation)}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'corrected' && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20
                          border border-emerald-100 dark:border-emerald-900 p-4 text-sm leading-relaxed">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{asText(feedback.corrected_version)}</p>
          </div>
        )}

        {tab === 'model' && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/30
                          border border-brand-100 dark:border-brand-900 p-4 text-sm leading-relaxed">
            <BookText size={15} className="mt-0.5 shrink-0 text-brand-500" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{asText(feedback.model_answer)}</p>
          </div>
        )}

        {tab === 'vocab' && (
          <div className="space-y-2">
            {vocab.map((v, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-100
                                        dark:border-slate-800 bg-white dark:bg-slate-900/20 p-3 text-sm">
                <span className="text-slate-400 dark:text-slate-500 line-through flex-shrink-0">{asText(v.basic)}</span>
                <ArrowRight size={13} className="text-slate-300 flex-shrink-0" />
                <span className="font-semibold text-brand-600 dark:text-brand-400 flex-1">{asText(v.advanced)}</span>
                {v.context && <span className="text-[11px] text-slate-400 dark:text-slate-500 text-right">{asText(v.context)}</span>}
              </div>
            ))}
          </div>
        )}

        {/* ── NEW: Lectures tab ─────────────────────────────────────── */}
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

function FeedbackBlock({ title, text }) {
  const body = asText(text)
  if (!body) return null
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100
                    dark:border-slate-700 p-3.5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{body}</p>
    </div>
  )
}
