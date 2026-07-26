import { API_BASE_URL } from '@/lib/env'
import type { ApiErrorDetail, ApiErrorEnvelope } from '@/types/api-error'

export class ApiError extends Error {
  status: number
  code: string
  details: ApiErrorDetail[] | null
  retryAfterSeconds: number | null

  constructor(
    status: number,
    code: string,
    message: string,
    details: ApiErrorDetail[] | null = null,
    retryAfterSeconds: number | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/** For the public, unauthenticated endpoints. The admin panel has its own client
 * (src/admin/api/client.ts) that wraps this same ApiError with Bearer-header
 * attachment and 401 handling. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

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
