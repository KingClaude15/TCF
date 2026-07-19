import { useState } from 'react'
import clsx from 'clsx'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

/**
 * Renders a list of multiple-choice questions, lets the student answer all
 * of them, then reveals correctness per-question on submit and reports the
 * final score back via onFinish(correctCount, total).
 */
export default function QuizRunner({ questions, onFinish, submitting }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

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
      {questions.map((q, qIdx) => (
        <div key={q.id} className="card p-4">
          <p className="mb-3 text-sm font-semibold">
            {qIdx + 1}. {q.text}
          </p>
          <div className="space-y-2">
            {q.options.map((option, optIdx) => {
              const isSelected = answers[q.id] === optIdx
              const isCorrectOption = optIdx === q.correct_index
              const showResult = submitted

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => selectAnswer(q.id, optIdx)}
                  disabled={submitted}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors',
                    !showResult && isSelected && 'border-brand-500 bg-brand-50 dark:bg-brand-950',
                    !showResult && !isSelected && 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
                    showResult && isCorrectOption && 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
                    showResult && isSelected && !isCorrectOption && 'border-red-300 bg-red-50 dark:bg-red-950/40'
                  )}
                >
                  <span>{option}</span>
                  {showResult && isCorrectOption && <CheckCircle2 size={16} className="text-emerald-500" />}
                  {showResult && isSelected && !isCorrectOption && <XCircle size={16} className="text-red-500" />}
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
