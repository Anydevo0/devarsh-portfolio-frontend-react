import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ProjectFormPage } from '@/admin/pages/ProjectFormPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/projects/new']}>
        <Routes>
          <Route path="/admin/projects/new" element={<ProjectFormPage />} />
          <Route path="/admin/projects" element={<p>Project list</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProjectFormPage', () => {
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
    expect(screen.getByText('Short description is required.')).toBeInTheDocument()
    expect(screen.getByText('Description is required.')).toBeInTheDocument()
  })

  it('creates a project and navigates back to the list on success', async () => {
    server.use(
      http.post(`${BASE}/admin/projects`, () =>
        HttpResponse.json({ id: 1, title: 'New Project' }, { status: 201 }),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Title'), 'New Project')
    await user.type(screen.getByLabelText('Short description'), 'A short description.')
    await user.type(screen.getByLabelText('Description (Markdown)'), 'Full description body.')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Project list')).toBeInTheDocument()
  })
})
