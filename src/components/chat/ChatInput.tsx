import { type FormEvent, type KeyboardEvent, useLayoutEffect, useRef, useState } from 'react'

import { SendIcon } from '@/components/common/icons'

const MAX_MESSAGE_LENGTH = 2000

interface ChatInputProps {
  disabled: boolean
  onSend: (message: string) => void
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Layout effect, not a change handler: the height has to be settled before the
  // browser paints, or the field visibly jumps a frame behind the caret. Clearing
  // `value` on send runs this too, which is what collapses the field back to one row.
  useLayoutEffect(() => {
    const field = textareaRef.current
    if (!field) return
    // Shrinking needs a fresh measurement — `scrollHeight` never reports less than the
    // current height, so the previous inline height has to be released first.
    field.style.height = 'auto'
    // `scrollHeight` excludes the borders under `box-sizing: border-box`, so writing it
    // back verbatim would shave a pixel off the field on every keystroke.
    const borders = field.offsetHeight - field.clientHeight
    field.style.height = `${field.scrollHeight + borders}px`
  }, [value])

  function submitMessage() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submitMessage()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    // An IME is still resolving a candidate on this Enter — committing it is not a send.
    if (event.nativeEvent.isComposing) return
    event.preventDefault()
    submitMessage()
  }

  return (
    // Bottom-aligned rather than centred: once the field is several rows tall a centred
    // button floats away from the line being typed, while the bottom edge stays level
    // with the caret's row and with the field's resting height.
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <label htmlFor="chat-input" className="sr-only">
        Ask a question
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        rows={1}
        // Belt and braces with the guard in `submitMessage` — native validation no longer
        // sees Enter presses, since those are intercepted before the form submits.
        required
        maxLength={MAX_MESSAGE_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Answering…' : 'Ask about my work…'}
        // `min-h` holds the single-row height before the measurement runs; `max-h` caps
        // growth at five rows so the transcript above stays readable in a 32rem panel,
        // after which the field scrolls internally. Soft wrapping means no horizontal scroll.
        className="border-edge/60 bg-void/40 text-mist placeholder:text-fog/70 hover:border-edge focus-visible:border-pulse focus-visible:bg-void/70 max-h-[8.75rem] min-h-11 min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto rounded-3xl border px-4 py-2.5 text-sm leading-6 wrap-break-word transition-[height,background-color,border-color] duration-150 ease-out disabled:opacity-50 motion-reduce:transition-none"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="bg-pulse text-void flex size-11 shrink-0 items-center justify-center rounded-full transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
      >
        <SendIcon className="size-4" />
      </button>
    </form>
  )
}
