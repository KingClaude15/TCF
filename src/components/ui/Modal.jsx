import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-cardHover animate-pop dark:border-slate-800 dark:bg-surface-darkCard`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="font-heading text-lg font-bold text-ink-900 dark:text-white">
            {title}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
