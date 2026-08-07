import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronRight, Lightbulb, XCircle, BookOpen } from 'lucide-react'
import clsx from 'clsx'

/**
 * Interactive lesson: theory → examples → quiz → recap with explanations.
 * onComplete(lessonId) when quiz finished.
 */
export default function LessonPlayer({ lesson, completed, onBack, onComplete }) {
  const [step, setStep] = useState(0) // 0 theory, 1 examples, 2 quiz, 3 done
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ ok: 0, total: 0 })
  const [history, setHistory] = useState([]) // { q, options, answer, picked, explain, correct }

  const quiz = lesson.quiz || []
  const current = quiz[qi]

  function startQuiz() {
    setStep(2)
    setQi(0)
    setPicked(null)
    setScore({ ok: 0, total: 0 })
    setHistory([])
  }

  function answer(idx) {
    if (picked !== null) return
    setPicked(idx)
    const correct = idx === current.answer
    setScore((s) => ({ ok: s.ok + (correct ? 1 : 0), total: s.total + 1 }))
    setHistory((h) => [
      ...h,
      {
        q: current.q,
        options: current.options,
        answer: current.answer,
        picked: idx,
        explain: current.explain,
        correct,
      },
    ])
  }

  function nextQuestion() {
    if (qi + 1 < quiz.length) {
      setQi((i) => i + 1)
      setPicked(null)
    } else {
      setStep(3)
      onComplete?.(lesson.id)
    }
  }

  const steps = useMemo(
    () => [
      { key: 0, label: 'Leçon' },
      { key: 1, label: 'Exemples' },
      { key: 2, label: 'Exercice' },
    ],
    []
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="btn-secondary">
          <ArrowLeft size={16} /> Modules
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{lesson.moduleTitle}</p>
          <h2 className="font-heading text-lg font-bold text-ink-900 dark:text-white">{lesson.title}</h2>
        </div>
        {completed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={14} /> Terminé
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {steps.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(s.key)}
            className={clsx(
              'rounded-full px-3 py-1 text-xs font-semibold',
              step === s.key || (step === 3 && s.key === 2)
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="card space-y-4 p-5">
          <p className="text-xs font-bold uppercase text-slate-400">À retenir · ~{lesson.minutes} min</p>
          <ul className="space-y-3">
            {(lesson.theory || []).map((t) => (
              <li key={t} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-gold-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          {lesson.connectors && (
            <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              {Object.entries(lesson.connectors).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-1 text-xs font-bold uppercase text-brand-600">{group}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{items.join(' · ')}</p>
                </div>
              ))}
            </div>
          )}

          {lesson.expressions && (
            <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              {Object.entries(lesson.expressions).map(([group, items]) => (
                <div key={group}>
                  <p className="mb-1 text-xs font-bold uppercase text-ee-DEFAULT">{group}</p>
                  <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                    {items.map((x) => (
                      <li key={x} className="rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800/60">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {lesson.wordBank && (
            <div className="overflow-x-auto border-t border-slate-100 pt-4 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-slate-400">
                    <th className="py-1 pr-3">Simple</th>
                    <th className="py-1">Plus précis / avancé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lesson.wordBank.map((w) => (
                    <tr key={w.basic}>
                      <td className="py-2 pr-3 text-slate-500">{w.basic}</td>
                      <td className="py-2 font-medium text-brand-700 dark:text-brand-300">{w.advanced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setStep(1)}>
            Voir les exemples <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="card space-y-4 p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Exemples</p>
          <div className="space-y-3">
            {(lesson.examples || []).map((ex, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <p className="text-sm text-red-600 line-through dark:text-red-400">{ex.bad}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{ex.good}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => setStep(0)}>
              Retour théorie
            </button>
            <button type="button" className="btn-primary" onClick={startQuiz}>
              Passer à l’exercice <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && current && (
        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question {qi + 1} / {quiz.length}
            </span>
            <span>
              Score : {score.ok}/{score.total}
            </span>
          </div>
          <p className="text-sm font-semibold text-ink-900 dark:text-white">{current.q}</p>
          <div className="space-y-2">
            {current.options.map((opt, idx) => {
              const isPicked = picked === idx
              const isRight = idx === current.answer
              const show = picked !== null
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => answer(idx)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    !show &&
                      'border-slate-200 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-brand-950/30',
                    show && isRight && 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40',
                    show && isPicked && !isRight && 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
                  )}
                >
                  <span>{opt}</span>
                  {show && isRight && <CheckCircle2 size={16} className="text-emerald-600" />}
                  {show && isPicked && !isRight && <XCircle size={16} className="text-red-500" />}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className="space-y-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900 dark:bg-brand-950/30">
              <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <BookOpen size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <span>
                  <strong className="text-brand-700 dark:text-brand-300">Explication : </strong>
                  {current.explain}
                </span>
              </p>
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={nextQuestion}>
                {qi + 1 < quiz.length ? 'Question suivante' : 'Voir le bilan'} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="card space-y-3 p-6 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <h3 className="font-heading text-lg font-bold">Leçon terminée</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Score : {score.ok} / {score.total}
              {score.total > 0 ? ` (${Math.round((score.ok / score.total) * 100)} %)` : ''}
            </p>
          </div>

          {history.length > 0 && (
            <div className="card space-y-4 p-5">
              <h4 className="font-heading text-base font-bold text-ink-900 dark:text-white">
                Bilan détaillé des réponses
              </h4>
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'rounded-xl border p-4 text-sm',
                      h.correct
                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                        : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                    )}
                  >
                    <div className="mb-2 flex items-start gap-2">
                      {h.correct ? (
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                      )}
                      <p className="font-medium text-ink-900 dark:text-white">
                        {i + 1}. {h.q}
                      </p>
                    </div>
                    <p className="ml-6 text-slate-600 dark:text-slate-400">
                      Ta réponse : <span className="font-medium">{h.options[h.picked]}</span>
                      {!h.correct && (
                        <>
                          {' '}
                          · Correct :{' '}
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                            {h.options[h.answer]}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="ml-6 mt-2 text-slate-700 dark:text-slate-300">
                      <strong>Pourquoi :</strong> {h.explain}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="button" className="btn-primary" onClick={onBack}>
            Retour aux modules
          </button>
        </div>
      )}
    </div>
  )
}
