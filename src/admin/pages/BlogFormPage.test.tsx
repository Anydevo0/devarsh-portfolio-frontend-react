import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { BlogFormPage } from '@/admin/pages/BlogFormPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/blog/new']}>
        <Routes>
          <Route path="/admin/blog/new" element={<BlogFormPage />} />
          <Route path="/admin/blog" element={<p>Blog list</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BlogFormPage', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('shows client-side validation errors without hitting the network', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Content is required.')).toBeInTheDocument()
  })

  it('creates a post and navigates back to the list on success', async () => {
    server.use(
      http.post(`${BASE}/admin/blog/posts`, () =>
        HttpResponse.json({ id: 1, title: 'New Post' }, { status: 201 }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Title'), 'New Post')
    await user.type(screen.getByRole('textbox', { name: 'Content (Markdown)' }), 'Body content for the post.')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Blog list')).toBeInTheDocument()
  })

  it('never renders raw HTML in the live preview — XSS regression', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(
      screen.getByRole('textbox', { name: 'Content (Markdown)' }),
      '<img src=x onerror="window.__xss=true">',
    )

    expect(document.querySelector('img[onerror]')).not.toBeInTheDocument()
  })
})
