import { ThemeToggle } from '../ThemeToggle'

type Theme = 'light' | 'dark'

interface Props {
  theme: Theme
  toggleTheme: () => void
  title?: string
  onMenuClick?: () => void
}

export function DashboardTopBar({ theme, toggleTheme, title = '首页概览', onMenuClick }: Props) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 bg-white px-5 dark:border-gray-800 dark:bg-gray-900">
      {/* 窄屏菜单按钮 */}
      <button
        onClick={onMenuClick}
        className="mr-3 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
        aria-label="打开菜单"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="ml-auto">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  )
}
