import { useState, useEffect, useCallback } from 'react'

interface AuthUser {
  username: string
  display_name: string
  avatar_url: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: AuthUser | null
  authEnabled: boolean
  loading: boolean
  isAdmin: boolean
  login: () => void
  logout: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authEnabled, setAuthEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { user: AuthUser | null; auth_enabled: boolean }) => {
        setUser(data.user)
        setAuthEnabled(data.auth_enabled)
      })
      .catch(() => {
        // Auth endpoint not available — auth is disabled
        setAuthEnabled(false)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(() => {
    window.location.href = '/api/auth/login'
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }, [])

  return {
    user,
    authEnabled,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  }
}
