import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-500 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
          该模块加载失败，请刷新页面重试。
        </div>
      )
    }
    return this.props.children
  }
}
