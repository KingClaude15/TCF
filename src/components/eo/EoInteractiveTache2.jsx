import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, MicOff, Volume2, RotateCcw, MessageCircle, Keyboard } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { fetchInteractiveReply } from '../../services/eoInteractiveService'

const MAX_TURNS = 8

function speakFrench(text, { onEnd } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.()
    return null
  }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  u.rate = 0.95
  const voices = window.speechSynthesis.getVoices() || []
  const fr =
    voices.find((v) => v.lang?.toLowerCase().startsWith('fr') && /google|thomas|amélie|amelie|julie|hortense|denise/i.test(v.name)) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('fr'))
  if (fr) u.voice = fr
  u.onend = () => onEnd?.()
  u.onerror = () => onEnd?.()
  window.speechSynthesis.speak(u)
  return u
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = 'fr-FR'
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1
  return rec
}

/**
 * Interactive EO Tâche 2: candidate asks questions by voice;
 * AI replies in character with TTS playback.
 */
export default function EoInteractiveTache2({ prompt, disabled }) {
  const [history, setHistory] = useState([]) // { role: 'user'|'assistant', content: string }
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [busy, setBusy] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [typed, setTyped] = useState('')
  const [showType, setShowType] = useState(false)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const recRef = useRef(null)
  const bottomRef = useRef(null)
  const sttSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  const ttsSupported = typeof window !== 'undefined' && !!window.speechSynthesis

  const turnsUsed = history.filter((h) => h.role === 'user').length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, interim, busy])

  useEffect(() => {
    // Chrome loads voices async
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      const h = () => window.speechSynthesis.getVoices()
      window.speechSynthesis.addEventListener?.('voiceschanged', h)
      return () => window.speechSynthesis.removeEventListener?.('voiceschanged', h)
    }
  }, [])

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort?.()
      } catch {
        /* ignore */
      }
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  const playReply = useCallback((text) => {
    if (!text) return
    if (!ttsSupported) {
      toast('Synthèse vocale indisponible sur cet appareil — lis la réponse à l’écran.')
      return
    }
    setSpeaking(true)
    speakFrench(text, { onEnd: () => setSpeaking(false) })
  }, [ttsSupported])

  const sendMessage = useCallback(
    async (text) => {
      const msg = String(text || '').trim()
      if (!msg || busy || done || disabled) return
      if (turnsUsed >= MAX_TURNS) {
        toast.error(`Maximum ${MAX_TURNS} questions atteint. Termine ou recommence.`)
        setDone(true)
        return
      }

      setBusy(true)
      setInterim('')
      const nextHistory = [...history, { role: 'user', content: msg }]
      setHistory(nextHistory)

      try {
        const reply = await fetchInteractiveReply({
          sujetPrompt: prompt,
          userMessage: msg,
          history: nextHistory.slice(0, -1),
        })
        const withAi = [...nextHistory, { role: 'assistant', content: reply }]
        setHistory(withAi)
        playReply(reply)
        if (withAi.filter((h) => h.role === 'user').length >= MAX_TURNS) {
          setDone(true)
        }
      } catch (e) {
        toast.error(e.message || 'Erreur IA')
        // keep user message in history so they can retry by speaking again
      } finally {
        setBusy(false)
        setTyped('')
      }
    },
    [busy, done, disabled, turnsUsed, history, prompt, playReply]
  )

  function startSession() {
    setStarted(true)
    setDone(false)
    setHistory([])
    const intro =
      'Bonjour. Je suis prêt à répondre à vos questions. Vous pouvez commencer.'
    setHistory([{ role: 'assistant', content: intro }])
    playReply(intro)
  }

  function resetSession() {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    try {
      recRef.current?.abort?.()
    } catch {
      /* ignore */
    }
    setListening(false)
    setInterim('')
    setBusy(false)
    setSpeaking(false)
    setHistory([])
    setDone(false)
    setStarted(false)
    setTyped('')
  }

  function toggleListen() {
    if (busy || disabled || done) return

    if (listening) {
      try {
        recRef.current?.stop?.()
      } catch {
        /* ignore */
      }
      setListening(false)
      return
    }

    if (!sttSupported) {
      setShowType(true)
      toast.error('La reconnaissance vocale n’est pas disponible (utilise Chrome) — tu peux écrire ta question.')
      return
    }

    const rec = getSpeechRecognition()
    if (!rec) {
      setShowType(true)
      return
    }
    recRef.current = rec
    let finalText = ''

    rec.onstart = () => {
      setListening(true)
      setInterim('')
    }
    rec.onresult = (event) => {
      let interimBuf = ''
      let finalBuf = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) finalBuf += r[0].transcript
        else interimBuf += r[0].transcript
      }
      if (finalBuf) finalText += finalBuf
      setInterim(finalText + interimBuf)
    }
    rec.onerror = (ev) => {
      setListening(false)
      if (ev.error === 'not-allowed') {
        toast.error('Micro refusé — autorise le micro ou écris ta question.')
        setShowType(true)
      } else if (ev.error !== 'aborted') {
        toast.error('Reconnaissance vocale interrompue — réessaie ou écris.')
        setShowType(true)
      }
    }
    rec.onend = () => {
      setListening(false)
      const text = (finalText || interim).trim()
      setInterim('')
      if (text) sendMessage(text)
    }

    try {
      rec.start()
    } catch {
      toast.error('Impossible de démarrer le micro.')
      setListening(false)
    }
  }

  return (
    <div className="card space-y-4 border-orange-200/60 p-4 dark:border-orange-900/40">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900 dark:text-white">Mode interactif — Tâche 2</p>
            <p className="text-[11px] text-slate-500">
              Pose des questions à voix haute. L’IA répond en français à l’oral (personnage de la consigne).
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {turnsUsed}/{MAX_TURNS} questions
        </span>
      </div>

      {!sttSupported && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Astuce : la reconnaissance vocale fonctionne mieux sur <strong>Chrome</strong>. Tu peux aussi taper tes questions.
        </p>
      )}

      {!started ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            L’IA joue le rôle de ton interlocuteur selon la consigne ci-dessus. Entraîne-toi à poser des questions claires
            (qui, quoi, où, quand, pourquoi, combien…).
          </p>
          <button type="button" className="btn-primary" disabled={disabled} onClick={startSession}>
            Démarrer la conversation
          </button>
        </div>
      ) : (
        <>
          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            {history.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={clsx(
                  'max-w-[90%] rounded-2xl px-3 py-2 text-sm',
                  m.role === 'assistant'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                    : 'ml-auto bg-brand-600 text-white'
                )}
              >
                <p className="mb-0.5 text-[10px] font-bold uppercase opacity-60">
                  {m.role === 'assistant' ? 'Interlocuteur' : 'Toi'}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                {m.role === 'assistant' && (
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300"
                    onClick={() => playReply(m.content)}
                    disabled={speaking}
                  >
                    <Volume2 size={12} /> Réécouter
                  </button>
                )}
              </div>
            ))}
            {interim && (
              <div className="ml-auto max-w-[90%] rounded-2xl bg-brand-600/70 px-3 py-2 text-sm text-white">
                <p className="text-[10px] font-bold uppercase opacity-80">Écoute…</p>
                <p>{interim}</p>
              </div>
            )}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={14} className="animate-spin" /> L’interlocuteur réfléchit…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {!done ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={clsx(
                    'btn-primary flex-1 sm:flex-none',
                    listening && 'bg-red-600 hover:bg-red-700'
                  )}
                  disabled={busy || disabled || speaking}
                  onClick={toggleListen}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  {listening ? 'Stop' : 'Poser une question (micro)'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowType((v) => !v)}
                  disabled={busy}
                >
                  <Keyboard size={16} /> Écrire
                </button>
                <button type="button" className="btn-secondary" onClick={resetSession}>
                  <RotateCcw size={16} /> Recommencer
                </button>
              </div>

              {showType && (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(typed)
                  }}
                >
                  <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Écris ta question en français…"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    disabled={busy || disabled}
                  />
                  <button type="submit" className="btn-primary" disabled={busy || !typed.trim()}>
                    Envoyer
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200">Session terminée</p>
              <p className="text-emerald-900/80 dark:text-emerald-100/80">
                Tu as posé {turnsUsed} question{turnsUsed > 1 ? 's' : ''}. Pour une note officielle TCF, utilise le{' '}
                <strong>mode examen</strong> (enregistrement continu) sur cette même tâche.
              </p>
              <button type="button" className="btn-secondary" onClick={resetSession}>
                Nouvelle conversation
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
