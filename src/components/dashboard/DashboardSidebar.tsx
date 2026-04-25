import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

function resolveAvatar(url: string | null | undefined, name: string): string {
  if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
  return url
}

const NAV_ITEMS = [
  {
    label: '首页概览',
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: '学习记录',
    href: '/study-record',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: 'AI 助手',
    href: '/ai-chat',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: '个人资料',
    href: '/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export function DashboardSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const avatarSrc = resolveAvatar(user?.avatar_url, user?.username ?? 'U')

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5 dark:border-gray-800">
        <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
          AI 学习助手
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href ? location.pathname === item.href : false
            if (item.href) {
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={[
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
                    ].join(' ')}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              )
            }
            return (
              <li key={item.label}>
                <span
                  title="即将推出"
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600"
                >
                  {item.icon}
                  {item.label}
                  <span className="ml-auto rounded-full bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                    即将
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 用户信息 + 登出 */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-800 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={avatarSrc}
              alt={user.username}
              loading="lazy"
              className="h-7 w-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">Lv.{user.level}</p>
            </div>
          </div>
        )}
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          返回主页
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          退出登录
        </button>
      </div>
    </aside>
  )
}
