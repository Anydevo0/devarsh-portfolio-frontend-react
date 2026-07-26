import { UNAUTHORIZED_EVENT } from '@/admin/auth/AuthContext'
import { clearSession, getValidToken } from '@/admin/auth/session'
import { ApiError } from '@/lib/apiClient'
import { API_BASE_URL } from '@/lib/env'
import type { ApiErrorEnvelope } from '@/types/api-error'

function reportUnauthorized(): never {
  clearSession()
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  throw new ApiError(401, 'unauthorized', 'Your session has expired. Please log in again.')
}

/** For the admin panel's authenticated endpoints. Wraps the same `ApiError` the
 * public `apiFetch` throws, adding the Bearer header and a 401 → logout side
 * effect (fired as a DOM event so non-React callers can react the same way). */
export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getValidToken()
  if (!token) reportUnauthorized()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })

  if (res.status === 401) reportUnauthorized()

  if (res.status === 204) {
    return undefined as T
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null
    const envelope = body?.error ?? {
      code: 'unknown',
      message: 'Something went wrong.',
      details: null,
    }
    const retryAfter = res.headers.get('Retry-After')
    throw new ApiError(
      res.status,
      envelope.code,
      envelope.message,
      envelope.details,
      retryAfter ? Number(retryAfter) : null,
    )
  }

  return res.json() as Promise<T>
}
