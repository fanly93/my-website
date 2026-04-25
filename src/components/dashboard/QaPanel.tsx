import { QA_HISTORY } from '../../data/dashboard'
import { QaCard } from './QaCard'

export function QaPanel() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">问答历史</h2>

      {QA_HISTORY.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-600">暂无问答记录</p>
      ) : (
        <div className="space-y-3">
          {QA_HISTORY.map(record => (
            <QaCard key={record.id} {...record} />
          ))}
        </div>
      )}
    </section>
  )
}
