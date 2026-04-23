import { useScrolled } from '../hooks/useScrolled'
import { useActiveSection } from '../hooks/useActiveSection'
import { ThemeToggle } from './ThemeToggle'

type Theme = 'light' | 'dark'

interface Props {
  theme: Theme
  toggleTheme: () => void
}

const NAV_LINKS = [
  { label: '首页', href: '#home', id: 'home' },
  { label: '项目', href: '#projects', id: 'projects' },
  { label: '联系我', href: '#contact', id: 'contact' },
]

const SECTION_IDS = NAV_LINKS.map(l => l.id)

export function Navbar({ theme, toggleTheme }: Props) {
  const scrolled = useScrolled(60)
  const activeId = useActiveSection(SECTION_IDS)

  return (
    <header
      className={[
        'fixed top-0 z-50 w-full h-16 flex items-center px-6 transition-all duration-300',
        scrolled
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60'
          : 'bg-transparent',
      ].join(' ')}
    >
      {/* 左侧 Logo */}
      <a
        href="#home"
        className="text-lg font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm"
      >
        小林fanly
      </a>

      {/* 右侧导航 + ThemeToggle */}
      <nav className="ml-auto flex items-center gap-1 sm:gap-2">
        {NAV_LINKS.map(link => (
          <a
            key={link.id}
            href={link.href}
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
              activeId === link.id
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            ].join(' ')}
          >
            {link.label}
          </a>
        ))}
        <div className="ml-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </nav>
    </header>
  )
}
