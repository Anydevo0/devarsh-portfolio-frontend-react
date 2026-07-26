import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ApiError, apiFetch } from '@/lib/apiClient'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

describe('apiFetch', () => {
  it('returns parsed JSON on success', async () => {
    server.use(
      http.get(`${BASE}/projects`, () =>
        HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 }),
      ),
    )
    const result = await apiFetch('/projects')
    expect(result).toEqual({ items: [], total: 0, limit: 20, offset: 0 })
  })

  it('throws ApiError with the envelope fields on a non-ok response', async () => {
    server.use(
      http.get(`${BASE}/projects/nope`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'not_found',
              message: 'No project found with that slug.',
              details: null,
            },
          },
          { status: 404 },
        ),
      ),
    )
    await expect(apiFetch('/projects/nope')).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'No project found with that slug.',
    })
  })

  it('parses Retry-After into retryAfterSeconds', async () => {
    server.use(
      http.post(`${BASE}/contact`, () =>
        HttpResponse.json(
          { error: { code: 'rate_limited', message: 'Too many requests.', details: null } },
          { status: 429, headers: { 'Retry-After': '42' } },
        ),
      ),
    )

    const error = await apiFetch('/contact', { method: 'POST' }).catch((err: unknown) => err)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).retryAfterSeconds).toBe(42)
  })

  it('returns undefined for a 204 response', async () => {
    server.use(
      http.delete(`${BASE}/admin/projects/1`, () => new HttpResponse(null, { status: 204 })),
    )
    const result = await apiFetch('/admin/projects/1', { method: 'DELETE' })
    expect(result).toBeUndefined()
  })
})
