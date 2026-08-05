import { type FormEvent, useState } from 'react'

import { HoneypotField } from './HoneypotField'

import { ArrowIcon } from '@/components/common/icons'
import { useContactForm } from '@/hooks/useContactForm'
import { useCountdown } from '@/hooks/useCountdown'
import { ApiError } from '@/lib/apiClient'
import { CONTACT_EMAIL } from '@/lib/siteInfo'

const MAX_NAME_LENGTH = 200
const MAX_MESSAGE_LENGTH = 5000

const fieldClass =
  'border-edge bg-void/50 text-mist placeholder:text-fog/60 focus-visible:border-pulse mt-2 w-full rounded-xl border px-4 py-3 text-sm transition-colors'
const labelClass = 'text-mist text-sm font-medium'
const noticeClass = 'border-alert/20 bg-alert/5 text-alert rounded-xl border px-4 py-3 font-mono text-sm'

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
      <div className="flex flex-col items-start gap-3 py-6">
        <span className="border-live/30 bg-live/10 text-live flex size-11 items-center justify-center rounded-full border text-lg">
          ✓
        </span>
        <p className="font-tech text-mist text-lg font-semibold tracking-tight">Message received</p>
        <p className="text-fog text-sm leading-7">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5" noValidate>
      <HoneypotField value={nickname} onChange={setNickname} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
          {fieldErrors.name && <p className="text-alert mt-2 text-sm">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
          {fieldErrors.email && <p className="text-alert mt-2 text-sm">{fieldErrors.email}</p>}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="contact-message" className={labelClass}>
            Message
          </label>
          <span className="text-fog/70 font-mono text-xs">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          id="contact-message"
          required
          maxLength={MAX_MESSAGE_LENGTH}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${fieldClass} resize-y leading-7`}
        />
        {fieldErrors.message && <p className="text-alert mt-2 text-sm">{fieldErrors.message}</p>}
      </div>

      {isRateLimited && (
        <p className={noticeClass}>
          {apiError.message}
          {countdown > 0 ? ` Try again in ${countdown}s.` : ''}
        </p>
      )}
      {isGenericError && apiError && (
        <p className={noticeClass}>
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
        className="group bg-pulse text-void hover:shadow-pulse/25 inline-flex items-center gap-2 self-start rounded-full px-6 py-3 font-mono text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
      >
        {mutation.isPending ? 'Sending…' : 'Send message'}
        <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </form>
  )
}
