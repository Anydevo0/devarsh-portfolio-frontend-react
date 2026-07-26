import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'

import { AuthProvider } from '@/admin/auth/AuthContext'
import { ProtectedRoute } from '@/admin/auth/ProtectedRoute'
import { clearSession, saveSession } from '@/admin/auth/session'

function renderProtected(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<p>Login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<p>Admin dashboard</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    clearSession()
  })

  it('redirects to /admin/login when there is no session', () => {
    renderProtected('/admin')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects to /admin/login when the stored session has expired', () => {
    saveSession('a-token', -1)
    renderProtected('/admin')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the protected route when the session is valid', () => {
    saveSession('a-token', 60)
    renderProtected('/admin')
    expect(screen.getByText('Admin dashboard')).toBeInTheDocument()
  })
})
