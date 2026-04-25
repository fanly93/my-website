import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../../utils/apiFetch'

interface Goal {
  id: string
  title: string
  estimated_minutes: number
  completed: boolean
  date: string
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function StudyGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newMinutes, setNewMinutes] = useState(30)
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMinutes, setEditMinutes] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiFetch(`/study/goals?date_str=${todayISO()}`)
      .then(r => r.ok ? r.json() : [])
      .then(setGoals)
      .catch(() => setGoals([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (showAdd) inputRef.current?.focus()
  }, [showAdd])

  async function handleAdd() {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const res = await apiFetch('/study/goals', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim(), estimated_minutes: newMinutes }),
      })
      if (res.ok) {
        const goal: Goal = await res.json()
        setGoals(prev => [...prev, goal])
        setNewTitle('')
        setNewMinutes(30)
        setShowAdd(false)
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleToggle(goal: Goal) {
    const next = !goal.completed
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: next } : g))
    await apiFetch(`/study/goals/${goal.id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: next }),
    }).catch(() => {
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, completed: goal.completed } : g))
    })
  }

  async function handleDelete(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id))
    await apiFetch(`/study/goals/${id}`, { method: 'DELETE' }).catch(() => {
      // silent fail — UI already updated optimistically
    })
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id)
    setEditTitle(goal.title)
    setEditMinutes(goal.estimated_minutes)
  }

  async function commitEdit(id: string) {
    if (!editTitle.trim()) { setEditingId(null); return }
    setGoals(prev => prev.map(g => g.id === id ? { ...g, title: editTitle.trim(), estimated_minutes: editMinutes } : g))
    setEditingId(null)
    await apiFetch(`/study/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: editTitle.trim(), estimated_minutes: editMinutes }),
    }).catch(() => {})
  }

  const completedCount = goals.filter(g => g.completed).length

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">今日目标</h2>
        <div className="flex items-center gap-2">
          {!loading && <span className="text-xs text-gray-400">{completedCount}/{goals.length} 完成</span>}
          <button
            onClick={() => setShowAdd(v => !v)}
            className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 transition-colors"
          >
            + 添加
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false) }}
            placeholder="输入目标内容…"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
          <input
            type="number"
            value={newMinutes}
            onChange={e => setNewMinutes(Number(e.target.value))}
            min={1}
            className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            title="预计分钟数"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            确认
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />)}
        </div>
      ) : goals.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-600">今日暂无目标，点击「+ 添加」开始吧</p>
      ) : (
        <div className="space-y-1">
          {goals.map(goal => (
            <div key={goal.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => handleToggle(goal)}
                className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
              />

              {editingId === goal.id ? (
                <div className="flex flex-1 gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(goal.id); if (e.key === 'Escape') setEditingId(null) }}
                    onBlur={() => commitEdit(goal.id)}
                    className="flex-1 rounded border border-indigo-400 px-2 py-0.5 text-sm text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="number"
                    value={editMinutes}
                    onChange={e => setEditMinutes(Number(e.target.value))}
                    min={1}
                    className="w-14 rounded border border-indigo-400 px-1 py-0.5 text-sm dark:bg-gray-800 dark:text-white focus:outline-none"
                  />
                </div>
              ) : (
                <span
                  onDoubleClick={() => startEdit(goal)}
                  className={[
                    'flex-1 cursor-default select-none text-sm',
                    goal.completed ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200',
                  ].join(' ')}
                  title="双击编辑"
                >
                  {goal.title}
                  {goal.estimated_minutes > 0 && (
                    <span className="ml-1.5 text-xs text-gray-400">{goal.estimated_minutes}min</span>
                  )}
                </span>
              )}

              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => startEdit(goal)}
                  className="rounded p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="编辑"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  title="删除"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
