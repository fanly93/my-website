const CATEGORY_COLORS: Record<string, string> = {
  RAG: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Agent: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  Prompt: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  多模态: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const DEFAULT_COLOR = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

interface Props {
  title: string
  category: string
  estimatedMinutes: number
}

export function SuggestionCard({ title, category, estimatedMinutes }: Props) {
  const badgeClass = CATEGORY_COLORS[category] ?? DEFAULT_COLOR

  return (
    <div className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{title}</p>
        <p className="mt-0.5 text-xs text-gray-400">{estimatedMinutes} 分钟</p>
      </div>
      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
        {category}
      </span>
    </div>
  )
}
