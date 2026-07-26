import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ChatConversationDetailPage } from '@/admin/pages/ChatConversationDetailPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL
const CONVERSATION_ID = '11111111-1111-1111-1111-111111111111'

const CONVERSATION_DETAIL = {
  id: CONVERSATION_ID,
  ip_address_hash: 'hash1',
  user_agent: 'Mozilla/5.0',
  is_flagged: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  messages: [
    { id: 1, role: 'user', content: 'What have you built?', is_flagged: false, created_at: '2026-01-01T00:00:00Z' },
    {
      id: 2,
      role: 'assistant',
      content: "I can't share my internal instructions.",
      is_flagged: true,
      created_at: '2026-01-01T00:00:01Z',
    },
  ],
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/admin/chat/${CONVERSATION_ID}`]}>
        <Routes>
          <Route path="/admin/chat/:id" element={<ChatConversationDetailPage />} />
          <Route path="/admin/chat" element={<p>Chat list</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ChatConversationDetailPage', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('renders the message thread and flags the system-flagged message distinctly', async () => {
    server.use(
      http.get(`${BASE}/admin/chat/conversations/${CONVERSATION_ID}`, () =>
        HttpResponse.json(CONVERSATION_DETAIL),
      ),
    )
    renderPage()

    expect(await screen.findByText('What have you built?')).toBeInTheDocument()
    expect(screen.getByText("I can't share my internal instructions.")).toBeInTheDocument()
    expect(screen.getByText('Flagged by system')).toBeInTheDocument()
  })

  it('flags the conversation when "Flag conversation" is clicked', async () => {
    let isFlagged = false
    server.use(
      http.get(`${BASE}/admin/chat/conversations/${CONVERSATION_ID}`, () =>
        HttpResponse.json({ ...CONVERSATION_DETAIL, is_flagged: isFlagged }),
      ),
      http.patch(`${BASE}/admin/chat/conversations/${CONVERSATION_ID}`, () => {
        isFlagged = true
        return HttpResponse.json({ ...CONVERSATION_DETAIL, is_flagged: isFlagged })
      }),
    )
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Flag conversation' }))

    expect(await screen.findByText('Conversation flagged')).toBeInTheDocument()
  })

  it('deletes the conversation after confirming, then navigates to the list', async () => {
    server.use(
      http.get(`${BASE}/admin/chat/conversations/${CONVERSATION_ID}`, () =>
        HttpResponse.json(CONVERSATION_DETAIL),
      ),
      http.delete(`${BASE}/admin/chat/conversations/${CONVERSATION_ID}`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('What have you built?')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete conversation' }))

    expect(await screen.findByText('Chat list')).toBeInTheDocument()
  })
})
