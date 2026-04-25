import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { apiFetch } from '../../utils/apiFetch'

type Period = 'week' | 'month'

interface TrendPoint {
  date: string
  studyMinutes: number
  completedCount: number
}

interface Props {
  isDark: boolean
}

const AXIS_COLOR = {
  light: '#9ca3af',
  dark: '#4b5563',
}

const GRID_COLOR = {
  light: '#f3f4f6',
  dark: '#1f2937',
}

export function TrendCharts({ isDark }: Props) {
  const [period, setPeriod] = useState<Period>('week')
  const [data, setData] = useState<TrendPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiFetch(`/study/trends?period=${period}`)
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [period])

  const axisColor = isDark ? AXIS_COLOR.dark : AXIS_COLOR.light
  const gridColor = isDark ? GRID_COLOR.dark : GRID_COLOR.light

  const tickFormatter = (dateStr: string) => {
    const d = new Date(dateStr)
    return period === 'week'
      ? `${d.getMonth() + 1}/${d.getDate()}`
      : d.getDate() % 5 === 0 ? `${d.getDate()}日` : ''
  }

  const hasData = data.some(p => p.studyMinutes > 0 || p.completedCount > 0)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">学习趋势</h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {(['week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                period === p
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
              ].join(' ')}
            >
              {p === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
          <div className="h-40 rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
        </div>
      ) : !hasData ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-600">暂无趋势数据，开始学习后将在此显示</p>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs text-gray-400">学习时长（分钟）</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tickFormatter={tickFormatter} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? '#111827' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={v => String(v)}
                />
                <Line type="monotone" dataKey="studyMinutes" stroke="#7c3aed" strokeWidth={2} dot={false} name="学习时长" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-400">完成目标数</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tickFormatter={tickFormatter} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: isDark ? '#111827' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={v => String(v)}
                />
                <Bar dataKey="completedCount" fill="#7c3aed" radius={[3, 3, 0, 0]} name="完成目标数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  )
}
