import { type FormEvent, useState } from 'react'

import { useContactForm } from '@/hooks/useContactForm'
import { useCountdown } from '@/hooks/useCountdown'
import { ApiError } from '@/lib/apiClient'
import { CONTACT_EMAIL } from '@/lib/siteInfo'

import { HoneypotField } from './HoneypotField'

const MAX_NAME_LENGTH = 200
const MAX_MESSAGE_LENGTH = 5000

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [nickname, setNickname] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mutation = useContactForm()
  const apiError = mutation.error instanceof ApiError ? mutation.error : null
  const isRateLimited = apiError?.code === 'rate_limited'
  const isGenericError = Boolean(apiError && !isRateLimited && apiError.code !== 'validation_error')
  const countdown = useCountdown(isRateLimited ? apiError.retryAfterSeconds : null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFieldErrors({})
    mutation.mutate(
      { name, email, message, nickname: nickname || undefined },
      {
        onSuccess: () => {
          setName('')
          setEmail('')
          setMessage('')
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === 'validation_error' && error.details) {
            const nextErrors: Record<string, string> = {}
            for (const detail of error.details) {
              nextErrors[detail.field] = detail.message
            }
            setFieldErrors(nextErrors)
          }
        },
      },
    )
  }

  if (mutation.isSuccess) {
    return (
      <p className="rounded-2xl border border-line/60 bg-paper p-6 font-mono text-sm text-wire shadow-sm">
        Message received — I&apos;ll get back to you soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-4" noValidate>
      <HoneypotField value={nickname} onChange={setNickname} />

      <div>
        <label htmlFor="contact-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          required
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm transition-shadow focus-visible:border-wire focus-visible:ring-4 focus-visible:ring-wire/10 focus-visible:outline-none"
        />
        {fieldErrors.name && <p className="mt-1 text-sm text-signal">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm transition-shadow focus-visible:border-wire focus-visible:ring-4 focus-visible:ring-wire/10 focus-visible:outline-none"
        />
        {fieldErrors.email && <p className="mt-1 text-sm text-signal">{fieldErrors.email}</p>}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message
          </label>
          <span className="font-mono text-xs text-mute">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          id="contact-message"
          required
          maxLength={MAX_MESSAGE_LENGTH}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm transition-shadow focus-visible:border-wire focus-visible:ring-4 focus-visible:ring-wire/10 focus-visible:outline-none"
        />
        {fieldErrors.message && <p className="mt-1 text-sm text-signal">{fieldErrors.message}</p>}
      </div>

      {isRateLimited && (
        <p className="font-mono text-sm text-signal">
          {apiError.message}
          {countdown > 0 ? ` Try again in ${countdown}s.` : ''}
        </p>
      )}
      {isGenericError && apiError && (
        <p className="font-mono text-sm text-signal">
          {apiError.message} You can also reach me directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || (isRateLimited && countdown > 0)}
        className="self-start rounded-full bg-ink px-6 py-2.5 font-mono text-sm text-paper transition-all hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
      >
        {mutation.isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
