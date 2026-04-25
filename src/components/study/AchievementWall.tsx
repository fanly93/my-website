import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/apiFetch'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlocked_at: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function AchievementWall() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/study/achievements')
      .then(r => r.ok ? r.json() : [])
      .then(setAchievements)
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false))
  }, [])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">成就</h2>
        {!loading && (
          <span className="text-xs text-gray-400">{unlockedCount}/{achievements.length} 已解锁</span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-16 rounded-xl bg-gray-100 animate-pulse dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {achievements.map(ach => (
            <div key={ach.id} className="group relative">
              <div
                className={[
                  'flex h-16 w-16 flex-col items-center justify-center rounded-xl border text-2xl transition-all',
                  ach.unlocked
                    ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
                    : 'border-gray-200 bg-gray-100 opacity-40 grayscale dark:border-gray-700 dark:bg-gray-800',
                ].join(' ')}
              >
                <span>{ach.icon}</span>
              </div>
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-44 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                <p className="font-semibold">{ach.name}</p>
                <p className="mt-0.5 text-gray-300">{ach.description}</p>
                {ach.unlocked && ach.unlocked_at && (
                  <p className="mt-1 text-yellow-300">{formatDate(ach.unlocked_at)} 解锁</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
