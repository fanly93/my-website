import { useState } from 'react'

const MAX_CHARS = 100

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days === 1) return '昨天'
  if (days < 30) return `${days} 天前`
  return `${Math.floor(days / 30)} 个月前`
}

interface Props {
  question: string
  answer: string
  createdAt: string
}

export function QaCard({ question, answer, createdAt }: Props) {
  const [expanded, setExpanded] = useState(false)
  const needsTrunc = answer.length > MAX_CHARS
  const displayAnswer = needsTrunc && !expanded ? answer.slice(0, MAX_CHARS) + '…' : answer

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{question}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{displayAnswer}</p>
      {needsTrunc && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-1 text-xs text-violet-600 hover:underline dark:text-violet-400"
        >
          {expanded ? '收起' : '展开'}
        </button>
      )}
      <p className="mt-2 text-xs text-gray-400">{relativeTime(createdAt)}</p>
    </div>
  )
}
