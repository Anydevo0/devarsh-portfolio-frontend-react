import { type FormEvent, useState } from 'react'

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
        placeholder="Message..."
        className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm focus-visible:border-wire focus-visible:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-opacity hover:bg-ink/90 disabled:opacity-40"
      >
        <SendIcon />
      </button>
    </form>
  )
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-4 translate-x-px"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />
    </svg>
  )
}
