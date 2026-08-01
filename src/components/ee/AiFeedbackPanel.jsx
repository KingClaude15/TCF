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

export default function AiFeedbackPanel({ feedback, submittedText }) {
  const [tab, setTab] = useState('submitted')
  if (!feedback) return null

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
            Niveau {feedback.cefr_level}
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {feedback.estimated_score} / 20
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
              <FeedbackBlock title="Grammaire"             text={feedback.grammar_feedback} />
              <FeedbackBlock title="Vocabulaire"           text={feedback.vocabulary_feedback} />
              <FeedbackBlock title="Organisation"          text={feedback.organization_feedback} />
              <FeedbackBlock title="Réalisation de la tâche" text={feedback.task_achievement_feedback} />
            </div>
            {feedback.recommendations && (
              <div className="rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900 p-4">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                  <Sparkles size={13} /> Recommandations personnalisées
                </p>
                <p className="text-sm text-brand-800 dark:text-brand-200 leading-relaxed">{feedback.recommendations}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'mistakes' && (
          <div className="space-y-3">
            {(feedback.mistakes || []).length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 size={28} className="text-emerald-500" />
                <p className="text-sm font-semibold text-ink-900 dark:text-white">Aucune erreur majeure détectée 🎉</p>
              </div>
            )}
            {(feedback.mistakes || []).map((m, idx) => (
              <div key={idx} className="rounded-xl border border-amber-100 dark:border-amber-900
                                        bg-amber-50 dark:bg-amber-950/30 p-3.5">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">{m.category}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="text-red-500 line-through">{m.original}</span>
                  <ArrowRight size={13} className="text-slate-300 flex-shrink-0" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{m.correction}</span>
                </div>
                {m.explanation && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'corrected' && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20
                          border border-emerald-100 dark:border-emerald-900 p-4 text-sm leading-relaxed">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{feedback.corrected_version}</p>
          </div>
        )}

        {tab === 'model' && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/30
                          border border-brand-100 dark:border-brand-900 p-4 text-sm leading-relaxed">
            <BookText size={15} className="mt-0.5 shrink-0 text-brand-500" />
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{feedback.model_answer}</p>
          </div>
        )}

        {tab === 'vocab' && (
          <div className="space-y-2">
            {(feedback.vocabulary_suggestions || []).map((v, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-100
                                        dark:border-slate-800 bg-white dark:bg-slate-900/20 p-3 text-sm">
                <span className="text-slate-400 dark:text-slate-500 line-through flex-shrink-0">{v.basic}</span>
                <ArrowRight size={13} className="text-slate-300 flex-shrink-0" />
                <span className="font-semibold text-brand-600 dark:text-brand-400 flex-1">{v.advanced}</span>
                {v.context && <span className="text-[11px] text-slate-400 dark:text-slate-500 text-right">{v.context}</span>}
              </div>
            ))}
          </div>
        )}

        {/* ── NEW: Lectures tab ─────────────────────────────────────── */}
        {tab === 'lectures' && (
          <ReadingRecommendations
            cefrBand={feedback.cefr_level}
            score={feedback.estimated_score}
          />
        )}

      </div>
    </div>
  )
}

function FeedbackBlock({ title, text }) {
  if (!text) return null
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100
                    dark:border-slate-700 p-3.5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{text}</p>
    </div>
  )
}
