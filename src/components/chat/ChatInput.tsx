import { type FormEvent, useState } from 'react'

import { SendIcon } from '@/components/common/icons'

const MAX_MESSAGE_LENGTH = 2000

interface ChatInputProps {
  disabled: boolean
  onSend: (message: string) => void
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor="chat-input" className="sr-only">
        Ask a question
      </label>
      <input
        id="chat-input"
        type="text"
        required
        maxLength={MAX_MESSAGE_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder={disabled ? 'Answering…' : 'Ask about my work…'}
        className="border-edge bg-void/60 text-mist placeholder:text-fog/70 focus-visible:border-pulse min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="bg-pulse text-void flex size-10 shrink-0 items-center justify-center rounded-full transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
      >
        <SendIcon className="size-4" />
      </button>
    </form>
  )
}
