import { type FormEvent, useState } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router'

import { useLogin } from '@/admin/hooks/useLogin'
import { ApiError } from '@/lib/apiClient'
import { useCountdown } from '@/hooks/useCountdown'

export function LoginPage() {
  const [password, setPassword] = useState('')
  const mutation = useLogin()
  const navigate = useNavigate()
  const location = useLocation()

  const apiError = mutation.error instanceof ApiError ? mutation.error : null
  const isLockedOut = apiError?.code === 'rate_limited'
  const countdown = useCountdown(isLockedOut ? apiError.retryAfterSeconds : null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate(password, {
      onSuccess: () => {
        const from = (location.state as { from?: Location } | null)?.from
        navigate(from ? `${from.pathname}${from.search}` : '/admin', { replace: true })
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-paper">Admin</h1>
        <div className="mt-8">
          <label htmlFor="admin-password" className="text-sm text-mute-on-ink">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-line-on-ink bg-transparent px-3 py-2 text-paper focus-visible:border-wire focus-visible:outline-none"
          />
        </div>
        {apiError && (
          <p role="alert" className="mt-3 font-mono text-sm text-signal">
            {apiError.message}
            {isLockedOut && countdown > 0 ? ` Try again in ${countdown}s.` : ''}
          </p>
        )}
        <button
          type="submit"
          disabled={mutation.isPending || (isLockedOut && countdown > 0)}
          className="mt-6 w-full rounded bg-paper px-5 py-2.5 font-mono text-sm text-ink hover:bg-paper/90 disabled:opacity-50"
        >
          {mutation.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
