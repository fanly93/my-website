import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/apiFetch'

interface Session {
  id: string
  title: string
  created_at: string
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function QAHistory() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch('/chat/sessions')
      .then(r => r.ok ? r.json() : [])
      .then((data: Session[]) => setSessions(data.slice(0, 10)))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  function handleClick(id: string) {
    navigate('/ai-chat', { state: { sessionId: id } })
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">问答历史</h2>
        <a href="#/ai-chat" className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          去对话 →
        </a>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />)}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-600">还没有对话记录</p>
          <a href="#/ai-chat" className="mt-2 inline-block text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400">
            去 AI Chat 开始学习 →
          </a>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-1">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => handleClick(s.id)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300">{s.title}</span>
              <span className="shrink-0 text-xs text-gray-400">{relativeTime(s.created_at)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
