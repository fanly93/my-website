import { useState } from 'react'
import { GOALS } from '../../data/dashboard'
import { GoalItem } from './GoalItem'

function todayKey(): string {
  return `dashboard_goals_${new Date().toISOString().slice(0, 10)}`
}

function loadChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(todayKey())
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveChecked(state: Record<string, boolean>): void {
  try {
    localStorage.setItem(todayKey(), JSON.stringify(state))
  } catch {
    // localStorage 不可用时静默降级
  }
}

export function DailyGoals() {
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked)

  function handleChange(id: string, value: boolean) {
    const next = { ...checked, [id]: value }
    setChecked(next)
    saveChecked(next)
  }

  const completedCount = GOALS.filter(g => checked[g.id]).length

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">今日目标</h2>
        <span className="text-xs text-gray-400">{completedCount}/{GOALS.length} 完成</span>
      </div>

      {GOALS.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-600">今日暂无目标</p>
      ) : (
        <div className="space-y-1">
          {GOALS.map(goal => (
            <GoalItem
              key={goal.id}
              {...goal}
              checked={!!checked[goal.id]}
              onChange={handleChange}
            />
          ))}
        </div>
      )}
    </section>
  )
}
