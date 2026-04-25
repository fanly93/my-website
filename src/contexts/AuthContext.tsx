import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../utils/apiFetch'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export interface UserProfile {
  id: string
  email: string
  username: string
  avatar_url: string | null
  level: number
  streak_days: number
  created_at: string
}

interface AuthContextValue {
  user: UserProfile | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<boolean>
  refreshUser: () => Promise<void>
  apiBase: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('access_token'),
  )
  const [, setRefreshToken] = useState<string | null>(
    () => localStorage.getItem('refresh_token'),
  )
  const [user, setUser] = useState<UserProfile | null>(null)

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }, [])

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const rt = localStorage.getItem('refresh_token')
    if (!rt) return false
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      })
      if (!res.ok) { logout(); return false }
      const data = await res.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      setAccessToken(data.access_token)
      setRefreshToken(data.refresh_token)
      return true
    } catch {
      logout()
      return false
    }
  }, [logout])

  // Re-fetch user profile from server and update context state
  const refreshUser = useCallback(async () => {
    const at = localStorage.getItem('access_token')
    if (!at) return
    try {
      const res = await apiFetch('/users/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch {
      // silent — sidebar just keeps showing old data
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail ?? '登录失败')
    }
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
  }, [])

  // Sync accessToken state when apiFetch silently refreshes tokens in the background.
  useEffect(() => {
    function handleTokenRefreshed(e: Event) {
      const { accessToken: newAt } = (e as CustomEvent<{ accessToken: string }>).detail
      setAccessToken(newAt)
    }
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed)
    return () => window.removeEventListener('auth:token-refreshed', handleTokenRefreshed)
  }, [])

  // Fetch user profile on mount and whenever access token changes.
  // Uses apiFetch so 401 triggers refresh automatically.
  useEffect(() => {
    if (!accessToken) { setUser(null); return }
    apiFetch('/users/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data) setUser(data) })
      .catch(() => {})
  }, [accessToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        login,
        logout,
        refreshAuth,
        refreshUser,
        apiBase: API_BASE,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
