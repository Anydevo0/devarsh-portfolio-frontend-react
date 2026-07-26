import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { ContactForm } from '@/components/contact/ContactForm'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ContactForm />
    </QueryClientProvider>,
  )
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Message'), 'Hello there!')
}

describe('ContactForm', () => {
  it('shows a success message after a valid submission', async () => {
    server.use(
      http.post(`${BASE}/contact`, () =>
        HttpResponse.json({ status: 'received' }, { status: 201 }),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText(/Message received/)).toBeInTheDocument()
  })

  it('maps a 422 validation error onto the matching field', async () => {
    server.use(
      http.post(`${BASE}/contact`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_error',
              message: 'The request contains invalid data.',
              details: [{ field: 'email', message: "That email address doesn't look valid." }],
            },
          },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText("That email address doesn't look valid.")).toBeInTheDocument()
  })

  it('shows a rate-limit message and disables submit while a Retry-After countdown runs', async () => {
    server.use(
      http.post(`${BASE}/contact`, () =>
        HttpResponse.json(
          { error: { code: 'rate_limited', message: 'Too many requests.', details: null } },
          { status: 429, headers: { 'Retry-After': '2' } },
        ),
      ),
    )
    const user = userEvent.setup()
    renderForm()

    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText(/Too many requests\./)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('keeps the honeypot field out of the tab order and the accessibility tree', () => {
    renderForm()
    const honeypot = document.getElementById('nickname')
    expect(honeypot).toHaveAttribute('tabIndex', '-1')
    expect(honeypot?.parentElement).toHaveAttribute('aria-hidden', 'true')
  })
})
