import { SUGGESTIONS } from '../../data/dashboard'
import { SuggestionCard } from './SuggestionCard'

const MAX_VISIBLE = 5

export function LearningPanel() {
  const visible = SUGGESTIONS.slice(0, MAX_VISIBLE)
  const hasMore = SUGGESTIONS.length > MAX_VISIBLE

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI 推荐学习</h2>
        <span className="text-xs text-gray-400">示例数据</span>
      </div>

      {visible.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-600">暂无推荐内容</p>
      ) : (
        <>
          <div className="space-y-1">
            {visible.map(s => (
              <SuggestionCard key={s.id} {...s} />
            ))}
          </div>
          {hasMore && (
            <button className="mt-3 w-full rounded-lg py-1.5 text-xs text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              查看更多
            </button>
          )}
        </>
      )}
    </section>
  )
}
