import { useEffect, useState } from 'react'
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import clsx from 'clsx'

/**
 * `progress` is a map of { [card.key]: 'known' | 'review' }, already loaded
 * from Supabase by the parent (LearningCenter). `onMark(cardKey, status)`
 * persists a change — this component stays a "dumb" presenter over that
 * data so it doesn't need to know about Supabase at all.
 */
export default function FlashcardDeck({ cards, progress = {}, onMark }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Cards can change (new EE corrections add vocabulary) without the
  // component unmounting — keep the shuffle order valid if the list length
  // changes under us.
  useEffect(() => {
    setOrder((prev) => (prev.length === cards.length ? prev : cards.map((_, i) => i)))
    setIndex((i) => Math.min(i, Math.max(0, cards.length - 1)))
  }, [cards.length])

  const card = cards[order[index]]
  const knownCount = cards.filter((c) => progress[c.key] === 'known').length
  const reviewCount = cards.filter((c) => progress[c.key] === 'review').length

  function goNext() {
    setFlipped(false)
    setIndex((i) => (i + 1) % order.length)
  }

  function goPrev() {
    setFlipped(false)
    setIndex((i) => (i - 1 + order.length) % order.length)
  }

  function shuffle() {
    const next = [...order].sort(() => Math.random() - 0.5)
    setOrder(next)
    setIndex(0)
    setFlipped(false)
  }

  function markKnown(isKnown) {
    onMark(card.key, isKnown ? 'known' : 'review')
    goNext()
  }

  if (!card) return null

  const status = progress[card.key]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Carte {index + 1} / {order.length}
        </span>
        <span className="flex items-center gap-3">
          <span className="text-emerald-500">{knownCount} sues</span>
          <span className="text-amber-500">{reviewCount} à revoir</span>
        </span>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="card flex min-h-[180px] w-full flex-col items-center justify-center gap-2 p-8 text-center transition-transform hover:-translate-y-0.5"
      >
        {!flipped ? (
          <>
            <span className="text-[11px] font-semibold uppercase text-slate-400">Terme simple</span>
            <span className="text-xl font-bold">{card.basic}</span>
          </>
        ) : (
          <>
            <span className="text-[11px] font-semibold uppercase text-brand-500">Version avancée</span>
            <span className="text-xl font-bold text-brand-600 dark:text-brand-400">{card.advanced}</span>
            {card.context && <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.context}</span>}
          </>
        )}
        <span className="mt-3 text-[11px] text-slate-400">Clique pour {flipped ? 'revenir' : 'retourner'} la carte</span>
      </button>

      <div className="flex items-center justify-center gap-2">
        <button onClick={goPrev} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronLeft size={18} />
        </button>
        <button onClick={shuffle} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Mélanger">
          <Shuffle size={16} />
        </button>
        <button onClick={goNext} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => markKnown(false)} className={clsx('btn-secondary flex-1', status === 'review' && '!bg-amber-100 dark:!bg-amber-950')}>
          <RotateCcw size={15} /> À revoir
        </button>
        <button onClick={() => markKnown(true)} className={clsx('btn-secondary flex-1', status === 'known' && '!bg-emerald-100 dark:!bg-emerald-950')}>
          Je savais ✓
        </button>
      </div>
    </div>
  )
}
