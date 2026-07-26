const STORAGE_KEY = 'admin_session'

interface StoredSession {
  token: string
  expiresAt: number
}

export function saveSession(token: string, expiresInSeconds: number): void {
  const session: StoredSession = { token, expiresAt: Date.now() + expiresInSeconds * 1000 }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

function readSession(): StoredSession | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

/** A token can exist in storage yet be past its own `expires_in` — checked
 * client-side so an expired session is treated as logged-out even before the
 * backend ever sees the request. */
export function getValidToken(): string | null {
  const session = readSession()
  if (!session || session.expiresAt <= Date.now()) return null
  return session.token
}
