import { Link } from 'react-router-dom'

interface Session {
  id: string
  title: string
  created_at: string
}

interface Props {
  sessions: Session[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function ChatSessionSidebar({ sessions, activeId, onSelect, onNew, onDelete }: Props) {
  const display = sessions.slice(0, 5)

  return (
    <div className="flex w-52 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="p-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建对话
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {display.length === 0 && (
          <p className="px-2 text-xs text-gray-400 dark:text-gray-600">暂无对话记录</p>
        )}
        <ul className="space-y-0.5">
          {display.map((s) => {
            const isActive = s.id === activeId
            return (
              <li key={s.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={[
                    'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                  ].join(' ')}
                >
                  <p className="truncate font-medium leading-snug">{s.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600">
                    {new Date(s.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden rounded p-1 text-gray-400 hover:text-red-500 group-hover:block dark:text-gray-600"
                  title="删除对话"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 底部导航 */}
      <div className="border-t border-gray-200 p-2 dark:border-gray-700">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回 Dashboard
        </Link>
      </div>
    </div>
  )
}
