import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { askAiTutor } from '../services/aiChatService'
import PageHeader from '../components/ui/PageHeader'

const WELCOME = {
  role: 'assistant',
  content:
    'Bonjour ! 👋 Je suis ton tuteur IA spécialisé TCF Canada. Tu peux me poser des questions sur :\n\n• Grammaire & conjugaison\n• Vocabulaire & connecteurs\n• Méthodologie EE (Tâche 1, 2, 3)\n• Expression Orale\n• Compréhension Orale / Écrite\n• Stratégies d’examen\n\nComment puis-je t’aider aujourd’hui ?',
}

export default function AiChat() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('tcf_ai_chat_history')
      if (saved) return JSON.parse(saved)
    } catch {}
    return [WELCOME]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('tcf_ai_chat_history', JSON.stringify(messages.slice(-40)))
    } catch {}
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
        content: error ? `⚠️ ${error}` : reply,
      },
    ])
    setLoading(false)
  }

  function clearHistory() {
    setMessages([WELCOME])
    localStorage.removeItem('tcf_ai_chat_history')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader
        title="Tuteur IA TCF"
        subtitle="Pose tes questions et obtiens des réponses instantanées d’un expert TCF Canada"
        action={
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Trash2 size={14} />
            Effacer l’historique
          </button>
        }
      />

      <div className="mt-4 flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-surface-darkCard">
        {/* Messages area */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  <Bot size={18} />
                </div>
              )}
              <div
                className={clsx(
                  'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]',
                  msg.role === 'user'
                    ? 'rounded-br-md bg-brand-600 text-white'
                    : 'rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                <Loader2 size={18} className="animate-spin text-brand-600" />
              </div>
              <span className="text-sm">Le tuteur IA réfléchit…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-100 p-4 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ta question ici… (ex: Comment utiliser le subjonctif ?)"
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Les réponses sont générées par IA et peuvent contenir des erreurs. Vérifie toujours avec un professeur si besoin.
          </p>
        </form>
      </div>
    </div>
  )
}
