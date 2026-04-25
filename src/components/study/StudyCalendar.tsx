import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/apiFetch'

interface CalendarDay {
  date: string
  duration_minutes: number
  checked_in: boolean
}

function intensityClass(minutes: number): string {
  if (minutes === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (minutes <= 30) return 'bg-green-200 dark:bg-green-900'
  if (minutes <= 60) return 'bg-green-400 dark:bg-green-700'
  return 'bg-green-600 dark:bg-green-500'
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function StudyCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [days, setDays] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiFetch(`/study/calendar?year=${year}&month=${month}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: CalendarDay[]) => setDays(data))
      .catch(() => setDays([]))
      .finally(() => setLoading(false))
  }, [year, month])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const n = new Date()
    if (year > n.getFullYear() || (year === n.getFullYear() && month >= n.getMonth() + 1)) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  // First weekday of the month (0=Sun)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const checkedInCount = days.filter(d => d.checked_in).length

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">学习日历</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">本月打卡 {checkedInCount} 天</span>
          <button
            onClick={prevMonth}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="min-w-[72px] text-center text-xs font-medium text-gray-700 dark:text-gray-300">
            {year}.{String(month).padStart(2, '0')}
          </span>
          <button
            onClick={nextMonth}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-0.5 text-center text-xs text-gray-400">{d}</div>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Leading empty cells */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map(day => {
              const dayNum = parseInt(day.date.split('-')[2], 10)
              const isFuture = new Date(day.date) > new Date()
              return (
                <div
                  key={day.date}
                  title={isFuture ? '' : `${day.date}${day.duration_minutes > 0 ? `（${day.duration_minutes} 分钟）` : ''}`}
                  className={[
                    'group relative flex h-8 items-center justify-center rounded text-xs transition-opacity',
                    isFuture ? 'opacity-30' : '',
                    intensityClass(day.duration_minutes),
                  ].join(' ')}
                >
                  <span className={day.checked_in ? 'font-semibold text-green-900 dark:text-green-100' : 'text-gray-500 dark:text-gray-400'}>
                    {dayNum}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-1.5 justify-end">
            <span className="text-xs text-gray-400">少</span>
            {['bg-gray-100 dark:bg-gray-800', 'bg-green-200 dark:bg-green-900', 'bg-green-400 dark:bg-green-700', 'bg-green-600 dark:bg-green-500'].map((cls, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${cls}`} />
            ))}
            <span className="text-xs text-gray-400">多</span>
          </div>
        </>
      )}
    </section>
  )
}
