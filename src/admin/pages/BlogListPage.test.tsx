import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { BlogListPage } from '@/admin/pages/BlogListPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

const SAMPLE_POST = {
  id: 1,
  title: 'Building a Rate Limiter',
  slug: 'building-a-rate-limiter',
  excerpt: 'How the backend throttles abusive traffic.',
  cover_image_url: null,
  tags: ['backend', 'redis'],
  is_published: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BlogListPage', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('renders posts with status pills', async () => {
    server.use(
      http.get(`${BASE}/admin/blog/posts`, () =>
        HttpResponse.json({ items: [SAMPLE_POST], total: 1, limit: 100, offset: 0 }),
      ),
    )
    renderPage()

    expect(await screen.findByText('Building a Rate Limiter')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('shows an empty state when there are no posts', async () => {
    server.use(
      http.get(`${BASE}/admin/blog/posts`, () =>
        HttpResponse.json({ items: [], total: 0, limit: 100, offset: 0 }),
      ),
    )
    renderPage()

    expect(await screen.findByText('No posts yet.')).toBeInTheDocument()
  })

  it('deletes a post after confirming in the dialog', async () => {
    let deleted = false
    server.use(
      http.get(`${BASE}/admin/blog/posts`, () =>
        HttpResponse.json({
          items: deleted ? [] : [SAMPLE_POST],
          total: deleted ? 0 : 1,
          limit: 100,
          offset: 0,
        }),
      ),
      http.delete(`${BASE}/admin/blog/posts/1`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Building a Rate Limiter')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete post' }))

    expect(await screen.findByText('No posts yet.')).toBeInTheDocument()
  })
})
