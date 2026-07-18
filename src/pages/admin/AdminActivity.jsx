import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Search, Headphones, BookOpen, PenLine, RefreshCcw, Eye } from 'lucide-react'
import clsx from 'clsx'
import { listAllActivity } from '../../services/adminActivityService'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'

const MODULE_STYLES = {
  CO: { icon: Headphones, className: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  CE: { icon: BookOpen, className: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
  EE: { icon: PenLine, className: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
}

const PAGE_SIZE = 25

export default function AdminActivity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [moduleFilter, setModuleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)

  async function load() {
    setLoading(true)
    try {
      setActivity(await listAllActivity())
    } catch (err) {
      toast.error(err.message || "Impossible de charger l'activité")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Unique list of users who actually have activity, for the search suggestions.
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

  const filtered = useMemo(() => {
    return activity.filter((a) => {
      if (moduleFilter !== 'all' && a.module !== moduleFilter) return false
      if (selectedUser && a.userId !== selectedUser.id) return false
      return true
    })
  }, [activity, moduleFilter, selectedUser])

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

  const paged = filtered.slice(0, page * PAGE_SIZE)

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
            {['all', 'CO', 'CE', 'EE'].map((m) => (
              <button
                key={m}
                onClick={() => setModuleFilter(m)}
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

      {filtered.length === 0 ? (
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
                  <th className="px-4 py-3 font-semibold">Jour</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => {
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
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.label}</td>
                      <td className="px-4 py-3 text-slate-500">{a.dayNumber ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold">{a.scoreLabel}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(a.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.module === 'EE' && a.essay && (
                          <button
                            onClick={() => setViewing(a)}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950"
                            title="Voir la copie"
                          >
                            <Eye size={14} /> Voir
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {paged.length < filtered.length && (
            <button onClick={() => setPage((p) => p + 1)} className="btn-secondary mx-auto flex items-center gap-2">
              Voir plus ({filtered.length - paged.length} restants)
            </button>
          )}
        </>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Copie EE" maxWidth="max-w-2xl">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">{viewing.user?.full_name || '—'}</p>
              <p className="text-xs text-slate-400">{viewing.user?.email}</p>
            </div>

            <div>
              <p className="label mb-1">Sujet</p>
              <p className="rounded-lg bg-slate-50 p-3 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                {viewing.prompt}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="label mb-0">Réponse du candidat</p>
                {viewing.wordCount != null && (
                  <span className="text-xs text-slate-400">{viewing.wordCount} mots</span>
                )}
              </div>
              <p className="whitespace-pre-wrap rounded-lg border border-slate-200 p-3 text-slate-700 dark:border-slate-700 dark:text-slate-200">
                {viewing.essay}
              </p>
            </div>

            {viewing.feedback && (
              <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="label mb-0">
                  Score : {viewing.feedback.estimated_score}/20 ({viewing.feedback.cefr_level || '—'})
                </p>
                {viewing.feedback.task_achievement_feedback && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adéquation à la tâche</p>
                    <p className="text-slate-600 dark:text-slate-300">{viewing.feedback.task_achievement_feedback}</p>
                  </div>
                )}
                {viewing.feedback.organization_feedback && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Organisation</p>
                    <p className="text-slate-600 dark:text-slate-300">{viewing.feedback.organization_feedback}</p>
                  </div>
                )}
                {viewing.feedback.grammar_feedback && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grammaire</p>
                    <p className="text-slate-600 dark:text-slate-300">{viewing.feedback.grammar_feedback}</p>
                  </div>
                )}
                {viewing.feedback.vocabulary_feedback && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Vocabulaire</p>
                    <p className="text-slate-600 dark:text-slate-300">{viewing.feedback.vocabulary_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
