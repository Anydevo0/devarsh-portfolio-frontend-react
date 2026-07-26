import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ContactDetailPage } from '@/admin/pages/ContactDetailPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/contact/1']}>
        <Routes>
          <Route path="/admin/contact/:id" element={<ContactDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ContactDetailPage', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('renders the message as preserved-whitespace plain text, never as Markdown', async () => {
    server.use(
      http.get(`${BASE}/admin/contact/1`, () =>
        HttpResponse.json({
          id: 1,
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          message: '**not bold** and a line\nbreak',
          email_status: 'sent',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        }),
      ),
    )
    renderPage()

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    // The literal asterisks must survive — a real <strong> would mean this ran
    // through MarkdownRenderer, which visitor-submitted text must never do.
    expect(screen.getByText(/\*\*not bold\*\*/)).toBeInTheDocument()
    expect(document.querySelector('strong')).not.toBeInTheDocument()
  })
})
