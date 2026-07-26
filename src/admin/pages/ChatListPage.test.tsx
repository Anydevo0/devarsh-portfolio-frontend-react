import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ChatListPage } from '@/admin/pages/ChatListPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

const UNFLAGGED_CONVERSATION = {
  id: '11111111-1111-1111-1111-111111111111',
  ip_address_hash: 'hash1',
  user_agent: 'Mozilla/5.0',
  is_flagged: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const FLAGGED_CONVERSATION = {
  id: '22222222-2222-2222-2222-222222222222',
  ip_address_hash: 'hash2',
  user_agent: 'Mozilla/5.0',
  is_flagged: true,
  created_at: '2026-01-02T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
}

const ALL_CONVERSATIONS = [UNFLAGGED_CONVERSATION, FLAGGED_CONVERSATION]

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ChatListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ChatListPage', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('renders conversations with a Flagged pill only where applicable', async () => {
    server.use(
      http.get(`${BASE}/admin/chat/conversations`, () =>
        HttpResponse.json({ items: ALL_CONVERSATIONS, total: 2, limit: 100, offset: 0 }),
      ),
    )
    renderPage()

    expect(await screen.findByText('11111111…')).toBeInTheDocument()
    expect(screen.getByText('22222222…')).toBeInTheDocument()
    expect(screen.getAllByText('Flagged', { selector: 'span' })).toHaveLength(1)
  })

  it('requests only flagged conversations when the checkbox is checked', async () => {
    server.use(
      http.get(`${BASE}/admin/chat/conversations`, ({ request }) => {
        const url = new URL(request.url)
        const items =
          url.searchParams.get('flagged') === 'true' ? [FLAGGED_CONVERSATION] : ALL_CONVERSATIONS
        return HttpResponse.json({ items, total: items.length, limit: 100, offset: 0 })
      }),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findAllByRole('row')
    await user.click(screen.getByRole('checkbox', { name: 'Flagged only' }))

    const rows = await screen.findAllByRole('row')
    expect(rows).toHaveLength(2) // header + 1 flagged conversation
  })
})
