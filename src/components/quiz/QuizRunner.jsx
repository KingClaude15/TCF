import { useState } from 'react'
import clsx from 'clsx'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

/**
 * Multiple-choice quiz. Answers can be changed freely until the student
 * clicks Valider. Supports optional question images (e.g. CE document scans).
 */
export default function QuizRunner({ questions, onFinish, submitting }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)
  const answeredCount = Object.keys(answers).length

  function selectAnswer(questionId, optionIndex) {
    if (submitted) return
    setAnswers((a) => ({ ...a, [questionId]: optionIndex }))
  }

  function handleSubmit() {
    const correctFlags = questions.map((q) => answers[q.id] === q.correct_index)
    const correctCount = correctFlags.filter(Boolean).length
    setSubmitted(true)
    onFinish(correctCount, questions.length, correctFlags)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">
        Réponses données : {answeredCount} / {questions.length}
        {!submitted && ' — tu peux changer une réponse à tout moment avant de valider.'}
      </p>

      {questions.map((q, qIdx) => (
        <div key={q.id} className="card overflow-hidden p-4">
          <p className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">
            {qIdx + 1}. {q.text}
          </p>

          {q.image && (
            <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
              <img
                src={q.image}
                alt={`Document question ${qIdx + 1}`}
                className="mx-auto max-h-[480px] w-full object-contain"
                loading="lazy"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {q.options.map((option, optIdx) => {
              const isSelected = answers[q.id] === optIdx
              const isCorrectOption = optIdx === q.correct_index
              const showResult = submitted
              const letter = String.fromCharCode(65 + optIdx) // A B C D

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => selectAnswer(q.id, optIdx)}
                  disabled={submitted}
                  className={clsx(
                    'flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors',
                    !showResult && isSelected && 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-400 dark:bg-brand-950 dark:text-brand-200',
                    !showResult && !isSelected && 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
                    showResult && isCorrectOption && 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
                    showResult && isSelected && !isCorrectOption && 'border-red-300 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                  )}
                >
                  <span className="text-xs font-bold text-slate-400">{letter}</span>
                  <span className="leading-snug">{option}</span>
                  {showResult && isCorrectOption && <CheckCircle2 size={14} className="text-emerald-500" />}
                  {showResult && isSelected && !isCorrectOption && <XCircle size={14} className="text-red-500" />}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {!submitted && (
        <button onClick={handleSubmit} disabled={!allAnswered || submitting} className="btn-primary w-full">
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Valider mes réponses
        </button>
      )}

      {submitted && (
        <div className="card bg-brand-50 p-4 text-center dark:bg-brand-950/40">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Score : {questions.filter((q) => answers[q.id] === q.correct_index).length} / {questions.length}
          </p>
        </div>
      )}
    </div>
  )
}
