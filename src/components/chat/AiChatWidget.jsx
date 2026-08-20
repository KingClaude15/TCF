import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import clsx from 'clsx'
import { askAiTutor } from '../../services/aiChatService'
import { useAuth } from '../../context/AuthContext'

const WELCOME = {
  role: 'assistant',
  content:
    'Bonjour ! 👋 Je suis ton tuteur IA TCF Canada. Pose-moi n’importe quelle question sur la grammaire, le vocabulaire, la méthodologie EE/EO/CO/CE, ou demande des exemples de phrases. Comment puis-je t’aider aujourd’hui ?',
}

export default function AiChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages, loading])

  async function handleSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }))

    const { reply, error } = await askAiTutor(text, history)

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: error
          ? `⚠️ ${error}`
          : reply,
      },
    ])
    setLoading(false)
  }

  if (!user) return null // only for logged-in users

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:scale-105 hover:shadow-xl',
          open && 'rotate-90 scale-90 opacity-0 pointer-events-none'
        )}
        aria-label="Ouvrir le chat IA"
      >
        <MessageCircle size={24} strokeWidth={2.25} />
      </button>

      {/* Chat panel */}
      <div
        className={clsx(
          'fixed bottom-6 right-6 z-50 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 dark:border-slate-700 dark:bg-surface-darkCard',
          open
            ? 'h-[min(70vh,560px)] opacity-100 translate-y-0'
            : 'h-0 opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Tuteur IA TCF</p>
              <p className="text-[11px] opacity-80">Réponses instantanées</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 hover:bg-white/20"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                'flex gap-2',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={clsx(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'rounded-br-md bg-brand-600 text-white'
                    : 'rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                <Loader2 size={14} className="animate-spin text-brand-600" />
              </div>
              <span className="text-xs">Le tuteur réfléchit…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-100 p-3 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose ta question TCF…"
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
