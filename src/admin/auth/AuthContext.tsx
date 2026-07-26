import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { clearSession, getValidToken, saveSession } from './session'

// Fired by the non-React admin fetch client (src/admin/api/client.ts) on a 401,
// so it can trigger the same logout side effect without importing React context.
export const UNAUTHORIZED_EVENT = 'admin-auth:unauthorized'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (token: string, expiresInSeconds: number) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getValidToken() !== null)

  useEffect(() => {
    function handleUnauthorized() {
      clearSession()
      setIsAuthenticated(false)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  function login(token: string, expiresInSeconds: number) {
    saveSession(token, expiresInSeconds)
    setIsAuthenticated(true)
  }

  function logout() {
    clearSession()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
