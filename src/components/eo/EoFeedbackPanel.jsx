import { useState } from 'react'
import clsx from 'clsx'
import { Sparkles, FileText, Volume2 } from 'lucide-react'

const TABS = [
  { key: 'audio', label: 'Mon audio' },
  { key: 'overview', label: 'Aperçu' },
  { key: 'transcript', label: 'Transcription' },
]

export default function EoFeedbackPanel({ feedback, audioUrl }) {
  const [tab, setTab] = useState('audio')
  if (!feedback) return null

  const visibleTabs = audioUrl ? TABS : TABS.filter((t) => t.key !== 'audio')

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          <h3 className="text-sm font-semibold">Évaluation IA</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
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

      {tab === 'audio' && audioUrl && (
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
          <Volume2 size={16} className="shrink-0 text-slate-400" />
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {(tab === 'overview' || (tab === 'audio' && !audioUrl)) && (
        <div className="space-y-4 text-sm">
          <FeedbackBlock title="Aisance et fluidité" text={feedback.fluency_feedback} />
          <FeedbackBlock title="Prononciation" text={feedback.pronunciation_feedback} />
          <FeedbackBlock title="Grammaire" text={feedback.grammar_feedback} />
          <FeedbackBlock title="Vocabulaire" text={feedback.vocabulary_feedback} />
          <FeedbackBlock title="Cohérence du discours" text={feedback.coherence_feedback} />
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

      {tab === 'transcript' && (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed dark:bg-slate-800/50">
          <FileText size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="whitespace-pre-wrap">{feedback.transcript || 'Transcription indisponible.'}</p>
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
