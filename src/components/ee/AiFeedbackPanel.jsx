import { useState } from 'react'
import clsx from 'clsx'
import { CheckCircle2, AlertTriangle, Sparkles, BookText, FileText } from 'lucide-react'

const TABS = [
  { key: 'submitted', label: 'Ma réponse' },
  { key: 'overview', label: 'Aperçu' },
  { key: 'mistakes', label: 'Erreurs' },
  { key: 'corrected', label: 'Version corrigée' },
  { key: 'model', label: 'Modèle C2' },
  { key: 'vocab', label: 'Vocabulaire' },
]

export default function AiFeedbackPanel({ feedback, submittedText }) {
  const [tab, setTab] = useState('submitted')
  if (!feedback) return null

  const visibleTabs = submittedText ? TABS : TABS.filter((t) => t.key !== 'submitted')

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-ee-DEFAULT" />
          <h3 className="text-sm font-semibold">Évaluation IA</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-ee-light px-3 py-1 text-xs font-bold text-ee-dark dark:bg-pink-950 dark:text-pink-300">
            Niveau {feedback.cefr_level}
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {feedback.estimated_score} / 20
          </span>
        </div>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-100 dark:border-slate-800">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors',
              tab === t.key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'submitted' && submittedText && (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed dark:bg-slate-800/50">
          <FileText size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="whitespace-pre-wrap">{submittedText}</p>
        </div>
      )}

      {(tab === 'overview' || (tab === 'submitted' && !submittedText)) && (
        <div className="space-y-4 text-sm">
          <FeedbackBlock title="Grammaire" text={feedback.grammar_feedback} />
          <FeedbackBlock title="Vocabulaire" text={feedback.vocabulary_feedback} />
          <FeedbackBlock title="Organisation" text={feedback.organization_feedback} />
          <FeedbackBlock title="Réalisation de la tâche" text={feedback.task_achievement_feedback} />
          {feedback.recommendations && (
            <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-950/40">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                <Sparkles size={14} /> Recommandations personnalisées
              </p>
              <p className="text-sm text-brand-800 dark:text-brand-200">{feedback.recommendations}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'mistakes' && (
        <div className="space-y-3">
          {(feedback.mistakes || []).length === 0 && <p className="text-sm text-slate-400">Aucune erreur majeure détectée 🎉</p>}
          {(feedback.mistakes || []).map((m, idx) => (
            <div key={idx} className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
              <div className="mb-1 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">{m.category}</span>
              </div>
              <p><span className="text-red-500 line-through">{m.original}</span> → <span className="font-semibold text-emerald-600">{m.correction}</span></p>
              {m.explanation && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{m.explanation}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'corrected' && (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed dark:bg-slate-800/50">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          <p className="whitespace-pre-wrap">{feedback.corrected_version}</p>
        </div>
      )}

      {tab === 'model' && (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed dark:bg-slate-800/50">
          <BookText size={16} className="mt-0.5 shrink-0 text-brand-500" />
          <p className="whitespace-pre-wrap">{feedback.model_answer}</p>
        </div>
      )}

      {tab === 'vocab' && (
        <div className="space-y-2">
          {(feedback.vocabulary_suggestions || []).map((v, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800">
              <span className="text-slate-400 line-through">{v.basic}</span>
              <span>→</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">{v.advanced}</span>
              {v.context && <span className="ml-auto text-xs text-slate-400">{v.context}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FeedbackBlock({ title, text }) {
  if (!text) return null
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-slate-700 dark:text-slate-300">{text}</p>
    </div>
  )
}
