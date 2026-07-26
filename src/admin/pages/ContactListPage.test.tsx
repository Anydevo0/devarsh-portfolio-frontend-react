import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ContactListPage } from '@/admin/pages/ContactListPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

const SUBMISSIONS = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'Loved the site!',
    email_status: 'sent',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Grace Hopper',
    email: 'grace@example.com',
    message: 'Question about your rate limiter.',
    email_status: 'failed',
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
  },
]

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ContactListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ContactListPage', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('renders submissions with a status pill per email_status', async () => {
    server.use(
      http.get(`${BASE}/admin/contact`, () =>
        HttpResponse.json({ items: SUBMISSIONS, total: 2, limit: 100, offset: 0 }),
      ),
    )
    renderPage()

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('shows an empty state when there are no submissions', async () => {
    server.use(
      http.get(`${BASE}/admin/contact`, () =>
        HttpResponse.json({ items: [], total: 0, limit: 100, offset: 0 }),
      ),
    )
    renderPage()

    expect(await screen.findByText('No submissions yet.')).toBeInTheDocument()
  })
})
