import { lazy, Suspense } from 'react'
import { StatsOverview } from '../components/dashboard/StatsOverview'
import { WidgetErrorBoundary } from '../components/dashboard/WidgetErrorBoundary'
import { StudyGoals } from '../components/study/StudyGoals'
import { AISuggestions } from '../components/study/AISuggestions'
import { QAHistory } from '../components/study/QAHistory'

const TrendCharts = lazy(() =>
  import('../components/dashboard/TrendCharts').then(m => ({ default: m.TrendCharts }))
)

interface Props {
  isDark: boolean
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 h-4 w-20 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="space-y-2">
        <div className="h-40 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-40 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  )
}

export function DashboardHome({ isDark }: Props) {
  return (
    <div className="space-y-5">
      <WidgetErrorBoundary>
        <StatsOverview />
      </WidgetErrorBoundary>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WidgetErrorBoundary>
          <StudyGoals />
        </WidgetErrorBoundary>
        <WidgetErrorBoundary>
          <AISuggestions />
        </WidgetErrorBoundary>
      </div>

      <WidgetErrorBoundary>
        <Suspense fallback={<ChartSkeleton />}>
          <TrendCharts isDark={isDark} />
        </Suspense>
      </WidgetErrorBoundary>

      <WidgetErrorBoundary>
        <QAHistory />
      </WidgetErrorBoundary>
    </div>
  )
}
