interface Props {
  id: string
  text: string
  estimatedMinutes: number
  checked: boolean
  onChange: (id: string, checked: boolean) => void
}

export function GoalItem({ id, text, estimatedMinutes, checked, onChange }: Props) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(id, e.target.checked)}
        className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 text-violet-600 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700"
      />
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${checked ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
          {text}
        </span>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">{estimatedMinutes} 分钟</p>
      </div>
    </label>
  )
}
