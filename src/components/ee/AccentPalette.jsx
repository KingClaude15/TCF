import { useState } from 'react'
import { CaseSensitive } from 'lucide-react'

const LOWERCASE = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ä', 'ù', 'û', 'ü', 'ô', 'ö', 'î', 'ï', 'ç', 'œ', 'æ', 'ÿ']
const UPPERCASE = ['É', 'È', 'Ê', 'Ë', 'À', 'Â', 'Ä', 'Ù', 'Û', 'Ü', 'Ô', 'Ö', 'Î', 'Ï', 'Ç', 'Œ', 'Æ', 'Ÿ']
const PUNCTUATION = ['«', '»', '’', '…', '—']

/**
 * Inserts `char` at the current cursor position of the textarea referenced
 * by `textareaRef`, updates the controlled value via `onChange`, and puts
 * the cursor right after the inserted character.
 */
function insertAtCursor(textareaRef, value, onChange, char) {
  const el = textareaRef?.current
  if (!el) {
    onChange(value + char)
    return
  }
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const newValue = value.slice(0, start) + char + value.slice(end)
  onChange(newValue)
  requestAnimationFrame(() => {
    el.focus()
    el.selectionStart = el.selectionEnd = start + char.length
  })
}

export default function AccentPalette({ textareaRef, value, onChange }) {
  const [uppercase, setUppercase] = useState(false)
  const letters = uppercase ? UPPERCASE : LOWERCASE

  function handleInsert(char) {
    insertAtCursor(textareaRef, value, onChange, char)
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Caractères spéciaux
        </h3>
        <button
          onClick={() => setUppercase((u) => !u)}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            uppercase
              ? 'bg-brand-500 text-white'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
          title="Majuscules"
        >
          <CaseSensitive size={14} /> Maj
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {letters.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => handleInsert(char)}
            className="flex h-9 items-center justify-center rounded-md border border-slate-200 text-sm font-medium transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-brand-950"
          >
            {char}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
        {PUNCTUATION.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => handleInsert(char)}
            className="flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 px-2 text-sm font-medium transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-brand-950"
          >
            {char}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Clique sur un caractère pour l'insérer à la position du curseur dans ton texte.
      </p>
    </div>
  )
}
