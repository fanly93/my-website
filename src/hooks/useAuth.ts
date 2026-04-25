import { useAuthContext } from '../contexts/AuthContext'

export function useAuth() {
  const { user, isAuthenticated, login, logout, refreshUser } = useAuthContext()
  return { user, isAuthenticated, login, logout, refreshUser }
}
