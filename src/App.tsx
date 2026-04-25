import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MouseTrail } from './components/MouseTrail'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useTheme } from './hooks/useTheme'
import { AIChatPage } from './pages/AIChatPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { StudyRecordPage } from './pages/StudyRecordPage'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <HashRouter>
      <AuthProvider>
        {!reducedMotion && <MouseTrail theme={theme} />}
        <Routes>
          <Route path="/" element={<HomePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<DashboardPage theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/ai-chat" element={<AIChatPage />} />
            <Route path="/study-record" element={<StudyRecordPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
