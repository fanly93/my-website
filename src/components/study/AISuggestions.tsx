import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/apiFetch'

interface Suggestion {
  title: string
  category: string
  estimated_minutes: number
}

const CATEGORY_COLORS: Record<string, string> = {
  RAG: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Agent: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'Prompt Engineering': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Python: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'LLM 原理': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '实战项目': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

function categoryClass(cat: string): string {
  return CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noLlm, setNoLlm] = useState(false)

  function load() {
    setLoading(true)
    setError(null)
    setNoLlm(false)
    apiFetch('/study/suggestions')
      .then(async r => {
        if (r.status === 400) { setNoLlm(true); return }
        if (!r.ok) { const d = await r.json().catch(() => ({})); setError(d.detail ?? '建议生成失败'); return }
        const data = await r.json()
        setSuggestions(data.suggestions ?? [])
      })
      .catch(() => setError('网络错误，请稍后重试'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI 推荐学习</h2>
        {!loading && !noLlm && !error && (
          <button onClick={load} className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            刷新
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
          ))}
        </div>
      )}

      {!loading && noLlm && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          请先在{' '}
          <a href="#/ai-chat" className="font-medium underline">AI Chat 页</a>
          {' '}配置 API Key 后查看个性化建议
        </div>
      )}

      {!loading && error && (
        <div className="space-y-2">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
          <button onClick={load} className="w-full rounded-lg border border-gray-200 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
            重试
          </button>
        </div>
      )}

      {!loading && !noLlm && !error && suggestions.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-600">暂无推荐内容</p>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.slice(0, 5).map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-gray-800 dark:text-gray-200">{s.title}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${categoryClass(s.category)}`}>
                {s.category}
              </span>
              <span className="shrink-0 text-xs text-gray-400">{s.estimated_minutes}min</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
