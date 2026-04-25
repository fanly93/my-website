import { Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { DashboardHome } from './DashboardHome'

type Theme = 'light' | 'dark'

interface Props {
  theme: Theme
  toggleTheme: () => void
}

export function DashboardPage({ theme, toggleTheme }: Props) {
  return (
    <Routes>
      <Route element={<DashboardLayout theme={theme} toggleTheme={toggleTheme} />}>
        <Route index element={<DashboardHome isDark={theme === 'dark'} />} />
      </Route>
    </Routes>
  )
}
