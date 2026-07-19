import { useEffect, useRef, useState } from 'react'
import { Mic, Square, RotateCcw, Play, Pause } from 'lucide-react'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Records audio via the browser's MediaRecorder API. Calls onRecorded(blob,
 * durationSeconds) once the student stops recording. `existingUrl` lets a
 * previously-submitted recording be previewed without re-recording.
 */
export default function AudioRecorder({ maxSeconds = 120, disabled, onRecorded, existingUrl }) {
  const [state, setState] = useState('idle') // 'idle' | 'recording' | 'recorded'
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(existingUrl || null)
  const [playing, setPlaying] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const audioElRef = useRef(null)

  useEffect(() => {
    setPreviewUrl(existingUrl || null)
    setState(existingUrl ? 'recorded' : 'idle')
  }, [existingUrl])

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setState('recorded')
        clearInterval(intervalRef.current)
        stream.getTracks().forEach((t) => t.stop())
        onRecorded(blob, elapsed)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setState('recording')
      setElapsed(0)
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1
          if (next >= maxSeconds) {
            recorder.stop()
          }
          return next
        })
      }, 1000)
    } catch {
      setError("Impossible d'accéder au micro. Vérifie les permissions de ton navigateur.")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  function reRecord() {
    setState('idle')
    setPreviewUrl(null)
    setElapsed(0)
    setPlaying(false)
  }

  function togglePlayback() {
    if (!audioElRef.current) return
    if (playing) {
      audioElRef.current.pause()
    } else {
      audioElRef.current.play()
    }
  }

  return (
    <div className="card flex flex-col items-center gap-4 p-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {state === 'idle' && (
        <>
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Mic size={28} />
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Appuie pour enregistrer — {formatTime(maxSeconds)} max
          </p>
        </>
      )}

      {state === 'recording' && (
        <>
          <button
            onClick={stopRecording}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg animate-pulse"
          >
            <Square size={24} />
          </button>
          <p className="text-sm font-semibold text-red-500">
            ● Enregistrement... {formatTime(elapsed)} / {formatTime(maxSeconds)}
          </p>
        </>
      )}

      {state === 'recorded' && previewUrl && (
        <div className="flex w-full flex-col items-center gap-3">
          <audio
            ref={audioElRef}
            src={previewUrl}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            className="hidden"
          />
          <button
            onClick={togglePlayback}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600"
          >
            {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
          </button>
          <p className="text-xs text-slate-400">Écoute ta réponse avant de continuer</p>
          <button
            onClick={reRecord}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 disabled:opacity-50"
          >
            <RotateCcw size={13} /> Recommencer l'enregistrement
          </button>
        </div>
      )}
    </div>
  )
}
