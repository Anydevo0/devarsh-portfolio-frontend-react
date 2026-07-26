import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ProjectListPage } from '@/admin/pages/ProjectListPage'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

const SAMPLE_PROJECT = {
  id: 1,
  title: 'Portfolio Backend',
  slug: 'portfolio-backend',
  short_description: 'A FastAPI backend.',
  description: 'Full description.',
  tech_stack: ['FastAPI', 'PostgreSQL'],
  repo_url: null,
  live_demo_url: null,
  image_urls: [],
  is_featured: true,
  display_order: 0,
  is_published: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProjectListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProjectListPage', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('renders projects with status pills', async () => {
    server.use(
      http.get(`${BASE}/admin/projects`, () =>
        HttpResponse.json({ items: [SAMPLE_PROJECT], total: 1, limit: 100, offset: 0 }),
      ),
    )
    renderPage()

    expect(await screen.findByText('Portfolio Backend')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('shows an empty state when there are no projects', async () => {
    server.use(
      http.get(`${BASE}/admin/projects`, () =>
        HttpResponse.json({ items: [], total: 0, limit: 100, offset: 0 }),
      ),
    )
    renderPage()

    expect(await screen.findByText('No projects yet.')).toBeInTheDocument()
  })

  it('deletes a project after confirming in the dialog', async () => {
    let deleted = false
    server.use(
      http.get(`${BASE}/admin/projects`, () =>
        HttpResponse.json({
          items: deleted ? [] : [SAMPLE_PROJECT],
          total: deleted ? 0 : 1,
          limit: 100,
          offset: 0,
        }),
      ),
      http.delete(`${BASE}/admin/projects/1`, () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Portfolio Backend')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete project' }))

    expect(await screen.findByText('No projects yet.')).toBeInTheDocument()
  })
})
