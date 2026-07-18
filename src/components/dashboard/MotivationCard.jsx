import { Link } from 'react-router-dom'
import { Quote, Lightbulb, ArrowRight, Languages } from 'lucide-react'
import { WORDS_OF_DAY, STUDY_TIPS, MOTIVATIONAL_MESSAGES, dayOfYearIndex } from '../../data/motivation'

export default function MotivationCard({ activeDay }) {
  const word = WORDS_OF_DAY[dayOfYearIndex(WORDS_OF_DAY.length)]
  const tip = STUDY_TIPS[dayOfYearIndex(STUDY_TIPS.length)]
  const message = MOTIVATIONAL_MESSAGES[dayOfYearIndex(MOTIVATIONAL_MESSAGES.length)]

  return (
    <div className="card grid grid-cols-1 gap-0 overflow-hidden md:grid-cols-3">
      <div className="border-b border-slate-100 p-5 dark:border-slate-800 md:border-b-0 md:border-r">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-brand-600 dark:text-brand-400">
          <Languages size={14} /> Mot du jour
        </p>
        <p className="text-lg font-bold">{word.word}</p>
        <p className="text-xs text-slate-400">{word.translation}</p>
        <p className="mt-2 text-xs italic leading-relaxed text-slate-500 dark:text-slate-400">« {word.example} »</p>
      </div>

      <div className="border-b border-slate-100 p-5 dark:border-slate-800 md:border-b-0 md:border-r">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-amber-600 dark:text-amber-400">
          <Lightbulb size={14} /> Astuce du jour
        </p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{tip}</p>
      </div>

      <div className="flex flex-col justify-between gap-3 p-5">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-ee-DEFAULT">
            <Quote size={14} /> Motivation
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <Link
          to="/calendar"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Continuer le jour {activeDay} <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
