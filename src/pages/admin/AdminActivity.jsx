import { toastError } from '../../lib/errorMessages'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Search, Headphones, BookOpen, PenLine, Mic, RefreshCcw, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import { listAllActivity } from '../../services/adminActivityService'
import { supabase } from '../../lib/supabaseClient'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'

const MODULE_STYLES = {
  CO: { icon: Headphones, className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  CE: { icon: BookOpen, className: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  EE: { icon: PenLine, className: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
  EO: { icon: Mic, className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
}

const PAGE_SIZE = 25

/**
 * Group EE/EO activity into one row per (user, sujet).
 * CO/CE stay one row per series.
 */
function buildRows(activity) {
  const rows = []
  const sujetMap = new Map() // key -> grouped row

  for (const a of activity) {
    if (a.module !== 'EE' && a.module !== 'EO') {
      rows.push({ kind: 'single', ...a })
      continue
    }

    // label is "Sujet X — tâche Y"
    const match = String(a.label || '').match(/Sujet\s+(\d+)/i)
    const sujetNumber = match ? Number(match[1]) : null
    const taskMatch = String(a.label || '').match(/t[aâ]che\s+(\d+)/i)
    const taskNum = taskMatch ? Number(taskMatch[1]) : null

    if (sujetNumber == null) {
      rows.push({ kind: 'single', ...a })
      continue
    }

    const key = `${a.module}:${a.userId}:${sujetNumber}`
    let group = sujetMap.get(key)
    if (!group) {
      group = {
        kind: 'sujet',
        id: key,
        module: a.module,
        userId: a.userId,
        user: a.user,
        sujetNumber,
        dayNumber: a.dayNumber,
        date: a.date,
        tasks: { 1: null, 2: null, 3: null },
      }
      sujetMap.set(key, group)
      rows.push(group)
    }

    if (taskNum >= 1 && taskNum <= 3) {
      group.tasks[taskNum] = a
    }
    // Keep latest date and day
    if (new Date(a.date) > new Date(group.date)) group.date = a.date
    if (a.dayNumber != null) group.dayNumber = a.dayNumber
  }

  // Sort: newest group/single first
  rows.sort((a, b) => new Date(b.date) - new Date(a.date))
  return rows
}

function taskScoreBadge(task) {
  if (!task) {
    return <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
  }
  return (
    <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
      {task.scoreLabel || `${task.score}/20`}
    </span>
  )
}

function averageScore(tasks) {
  const scores = [1, 2, 3]
    .map((n) => tasks[n]?.score)
    .filter((s) => typeof s === 'number')
  if (!scores.length) return null
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
}

export default function AdminActivity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [moduleFilter, setModuleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null) // single item or { kind:'sujet', tasks, ... }
  const [viewingAudioUrl, setViewingAudioUrl] = useState(null)
  const [expandedTask, setExpandedTask] = useState(1)

  useEffect(() => {
    const item =
      viewing?.kind === 'sujet'
        ? viewing.tasks?.[expandedTask]
        : viewing
    if (item?.module === 'EO' && item.audioPath) {
      supabase.storage
        .from('eo-recordings')
        .createSignedUrl(item.audioPath, 60 * 15)
        .then(({ data }) => setViewingAudioUrl(data?.signedUrl || null))
    } else {
      setViewingAudioUrl(null)
    }
  }, [viewing, expandedTask])

  async function load() {
    setLoading(true)
    try {
      setActivity(await listAllActivity())
    } catch (err) {
      toastError(err, 'Impossible de charger l activite')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const knownUsers = useMemo(() => {
    const map = new Map()
    for (const a of activity) {
      if (a.user && !map.has(a.userId)) map.set(a.userId, a.user)
    }
    return [...map.values()]
  }, [activity])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return knownUsers
      .filter((u) => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
      .slice(0, 6)
  }, [knownUsers, query])

  const filteredFlat = useMemo(() => {
    return activity.filter((a) => {
      if (moduleFilter !== 'all' && a.module !== moduleFilter) return false
      if (selectedUser && a.userId !== selectedUser.id) return false
      return true
    })
  }, [activity, moduleFilter, selectedUser])

  const rows = useMemo(() => buildRows(filteredFlat), [filteredFlat])
  const paged = rows.slice(0, page * PAGE_SIZE)

  function selectUser(u) {
    setSelectedUser(u)
    setQuery(u.full_name || u.email || '')
    setShowSuggestions(false)
    setPage(1)
  }

  function clearUser() {
    setSelectedUser(null)
    setQuery('')
    setPage(1)
  }

  function openSujetView(group) {
    setExpandedTask(
      group.tasks[1] ? 1 : group.tasks[2] ? 2 : group.tasks[3] ? 3 : 1
    )
    setViewing(group)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl2 bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedUser(null)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Rechercher un utilisateur..."
            className="input-field w-full pl-9 pr-8"
          />
          {selectedUser && (
            <button
              onClick={clearUser}
              title="Effacer la sélection"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              ✕
            </button>
          )}

          {showSuggestions && query.trim() && !selectedUser && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-cardHover dark:border-slate-700 dark:bg-surface-darkCard">
              {suggestions.length === 0 ? (
                <p className="px-3.5 py-2.5 text-xs text-slate-400">Aucun utilisateur trouvé</p>
              ) : (
                suggestions.map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={() => selectUser(u)}
                    className="flex w-full flex-col items-start px-3.5 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="font-medium">{u.full_name || '—'}</span>
                    <span className="text-xs text-slate-400">{u.email}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold dark:bg-slate-800">
            {['all', 'CO', 'CE', 'EE', 'EO'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setModuleFilter(m)
                  setPage(1)
                }}
                className={clsx(
                  'rounded-md px-3 py-1.5 transition-colors',
                  moduleFilter === m ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500'
                )}
              >
                {m === 'all' ? 'Tout' : m}
              </button>
            ))}
          </div>
          <button onClick={load} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Rafraîchir">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        EE / EO : une ligne = un sujet (T1 · T2 · T3). CO / CE : une ligne = une série.
      </p>

      {rows.length === 0 ? (
        <EmptyState icon={Search} title="Aucune activité trouvée" description="Aucun exercice ne correspond à ces filtres." />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Module</th>
                  <th className="px-4 py-3 font-semibold">Exercice</th>
                  <th className="px-4 py-3 font-semibold">T1</th>
                  <th className="px-4 py-3 font-semibold">T2</th>
                  <th className="px-4 py-3 font-semibold">T3</th>
                  <th className="px-4 py-3 font-semibold">Moy.</th>
                  <th className="px-4 py-3 font-semibold">Jour</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => {
                  if (row.kind === 'sujet') {
                    const { icon: Icon, className } = MODULE_STYLES[row.module]
                    const avg = averageScore(row.tasks)
                    return (
                      <tr key={row.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/60">
                        <td className="px-4 py-3">
                          <p className="font-medium">{row.user?.full_name || '—'}</p>
                          <p className="text-xs text-slate-400">{row.user?.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', className)}>
                            <Icon size={12} /> {row.module}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                          Sujet {row.sujetNumber}
                        </td>
                        <td className="px-4 py-3">{taskScoreBadge(row.tasks[1])}</td>
                        <td className="px-4 py-3">{taskScoreBadge(row.tasks[2])}</td>
                        <td className="px-4 py-3">{taskScoreBadge(row.tasks[3])}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums">
                          {avg != null ? `${avg}/20` : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{row.dayNumber ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(row.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openSujetView(row)}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950"
                            title="Voir T1 · T2 · T3"
                          >
                            <Eye size={14} /> Voir
                          </button>
                        </td>
                      </tr>
                    )
                  }

                  // Single row (CO / CE)
                  const a = row
                  const { icon: Icon, className } = MODULE_STYLES[a.module]
                  return (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/60">
                      <td className="px-4 py-3">
                        <p className="font-medium">{a.user?.full_name || '—'}</p>
                        <p className="text-xs text-slate-400">{a.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', className)}>
                          <Icon size={12} /> {a.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300" colSpan={1}>
                        {a.label}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300" colSpan={3}>
                        —
                      </td>
                      <td className="px-4 py-3 font-semibold">{a.scoreLabel}</td>
                      <td className="px-4 py-3 text-slate-500">{a.dayNumber ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(a.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-right">—</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {paged.length < rows.length && (
            <button onClick={() => setPage((p) => p + 1)} className="btn-secondary mx-auto flex items-center gap-2">
              Voir plus ({rows.length - paged.length} restants)
            </button>
          )}
        </>
      )}

      {/* Detail modal — sujet group or single */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={
          viewing?.kind === 'sujet'
            ? `${viewing.module} — Sujet ${viewing.sujetNumber}`
            : viewing?.module === 'EO'
              ? 'Copie EO'
              : 'Copie EE'
        }
        maxWidth="max-w-2xl"
      >
        {viewing && viewing.kind === 'sujet' && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">{viewing.user?.full_name || '—'}</p>
              <p className="text-xs text-slate-400">{viewing.user?.email}</p>
            </div>

            {/* Task tabs */}
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {[1, 2, 3].map((n) => {
                const t = viewing.tasks[n]
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={!t}
                    onClick={() => setExpandedTask(n)}
                    className={clsx(
                      'flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors',
                      expandedTask === n
                        ? 'bg-white shadow-sm dark:bg-slate-700'
                        : t
                          ? 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                          : 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                    )}
                  >
                    T{n}
                    {t ? (
                      <span className="ml-1 tabular-nums text-slate-400">
                        {typeof t.score === 'number' ? `${t.score}/20` : ''}
                      </span>
                    ) : (
                      <span className="ml-1 text-slate-300">—</span>
                    )}
                  </button>
                )
              })}
            </div>

            {viewing.tasks[expandedTask] ? (
              <TaskDetail
                item={viewing.tasks[expandedTask]}
                audioUrl={viewingAudioUrl}
              />
            ) : (
              <p className="text-sm text-slate-400">Aucune copie pour cette tâche.</p>
            )}
          </div>
        )}

        {viewing && viewing.kind !== 'sujet' && (
          <TaskDetail item={viewing} audioUrl={viewingAudioUrl} />
        )}
      </Modal>
    </div>
  )
}

function TaskDetail({ item, audioUrl }) {
  if (!item) return null
  return (
    <div className="space-y-4 text-sm">
      {item.kind !== 'sujet' && item.user && (
        <div>
          <p className="font-medium">{item.user?.full_name || '—'}</p>
          <p className="text-xs text-slate-400">{item.user?.email}</p>
        </div>
      )}

      <div>
        <p className="label mb-1">Sujet / consigne</p>
        <p className="rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          {item.prompt || '—'}
        </p>
      </div>

      {item.module === 'EO' ? (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="label mb-0">Enregistrement du candidat</p>
            {item.durationSeconds != null && (
              <span className="text-xs text-slate-400">{item.durationSeconds}s</span>
            )}
          </div>
          {audioUrl ? (
            <audio controls src={audioUrl} className="w-full" />
          ) : item.audioPath ? (
            <p className="text-xs text-slate-400">Chargement de l'audio...</p>
          ) : (
            <p className="text-xs text-slate-400">Pas d'audio</p>
          )}
        </div>
      ) : item.essay ? (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="label mb-0">Réponse du candidat</p>
            {item.wordCount != null && (
              <span className="text-xs text-slate-400">{item.wordCount} mots</span>
            )}
          </div>
          <p className="whitespace-pre-wrap rounded-lg border border-slate-200 p-3 text-slate-700 dark:border-slate-700 dark:text-slate-200">
            {item.essay}
          </p>
        </div>
      ) : null}

      {item.feedback && (
        <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="label mb-0">
            Score : {item.feedback.estimated_score}/20 ({item.feedback.cefr_level || '—'})
          </p>
          {item.module === 'EO' ? (
            <>
              {item.feedback.transcript && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transcription</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.transcript}</p>
                </div>
              )}
              {item.feedback.fluency_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aisance et fluidité</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.fluency_feedback}</p>
                </div>
              )}
              {item.feedback.pronunciation_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Prononciation</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.pronunciation_feedback}</p>
                </div>
              )}
              {item.feedback.grammar_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grammaire</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.grammar_feedback}</p>
                </div>
              )}
              {item.feedback.vocabulary_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Vocabulaire</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.vocabulary_feedback}</p>
                </div>
              )}
              {item.feedback.coherence_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cohérence du discours</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.coherence_feedback}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {item.feedback.task_achievement_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adéquation à la tâche</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.task_achievement_feedback}</p>
                </div>
              )}
              {item.feedback.organization_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Organisation</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.organization_feedback}</p>
                </div>
              )}
              {item.feedback.grammar_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grammaire</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.grammar_feedback}</p>
                </div>
              )}
              {item.feedback.vocabulary_feedback && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Vocabulaire</p>
                  <p className="text-slate-600 dark:text-slate-300">{item.feedback.vocabulary_feedback}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
