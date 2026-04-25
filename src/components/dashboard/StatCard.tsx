import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  value: number | undefined | null
  unit?: string
  color?: string
}

export function StatCard({ icon, label, value, unit, color = 'text-violet-600 dark:text-violet-400' }: Props) {
  const display = value == null || isNaN(value as number) ? '--' : value

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className={`mb-3 w-fit rounded-lg p-2 ${color} bg-violet-50 dark:bg-violet-900/20`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
        {display}
        {value != null && unit && (
          <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>
        )}
      </p>
    </div>
  )
}
