import { useEffect, useRef, useState } from 'react'

import { ChatInput } from './ChatInput'
import { ChatLog } from './ChatLog'

import { useChatStream } from '@/hooks/useChatStream'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { turns, status, errorMessage, send } = useChatStream()
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns])

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with the assistant"
          className="flex h-[34rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl bg-paper shadow-2xl sm:w-96"
        >
          <div className="flex items-center justify-between bg-ink px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-paper">Ask about my work</h2>
              <p className="text-xs text-mute-on-ink">Answers pulled from this site's content</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize chat"
              className="text-mute-on-ink hover:text-paper"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ChatLog turns={turns} />
            <div ref={logEndRef} />
          </div>
          {status === 'error' && errorMessage && (
            <p role="alert" className="px-4 pb-2 text-sm text-signal">
              {errorMessage}
            </p>
          )}
          <div className="border-t border-line px-4 py-3">
            <ChatInput disabled={status === 'streaming'} onSend={send} />
            <p className="mt-2 text-center text-xs text-mute">
              Conversations may be logged to prevent abuse.
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="flex size-14 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition-transform hover:scale-105 hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wire"
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  )
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-6"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
