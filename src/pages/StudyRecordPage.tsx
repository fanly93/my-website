import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { AchievementWall } from '../components/study/AchievementWall'
import { AISuggestions } from '../components/study/AISuggestions'
import { QAHistory } from '../components/study/QAHistory'
import { StudyCalendar } from '../components/study/StudyCalendar'
import { StudyGoals } from '../components/study/StudyGoals'
import { StatsOverview } from '../components/dashboard/StatsOverview'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

function resolveAvatar(url: string | null | undefined, name: string): string {
  if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`
  return url
}

export function StudyRecordPage() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const avatarSrc = resolveAvatar(user?.avatar_url, user?.username ?? 'U')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Dashboard
          </Link>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white">学习记录</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          {user && (
            <img
              src={avatarSrc}
              alt={user.username}
              loading="lazy"
              className="h-7 w-7 rounded-full object-cover"
            />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl space-y-5 p-6">
        {/* Stats cards */}
        <StatsOverview />

        {/* Calendar + Achievements */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <StudyCalendar />
          <AchievementWall />
        </div>

        {/* Goals + AI Suggestions */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <StudyGoals />
          <AISuggestions />
        </div>

        {/* QA History */}
        <QAHistory />
      </main>
    </div>
  )
}
