import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { ChatInput } from './ChatInput'
import { ChatLog } from './ChatLog'

import { ChatIcon, CloseIcon, SparkIcon } from '@/components/common/icons'
import { useChatStream } from '@/hooks/useChatStream'

/**
 * The site assistant.
 *
 * Presentation only — the transport is untouched: `useChatStream` still POSTs to
 * `/chat` and reads the SSE frames, and every accessible name here is load-bearing
 * for the widget's test suite.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { turns, status, errorMessage, send } = useChatStream()
  const logEndRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const isStreaming = status === 'streaming'

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
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {isOpen && (
          <m.div
            role="dialog"
            aria-label="Chat with the assistant"
            // Scales up from the launcher in the bottom-right, so the panel reads as
            // coming out of the button rather than appearing over it.
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="glass-panel flex h-[32rem] max-h-[calc(100dvh-8rem)] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl sm:w-96"
          >
            <div className="border-edge/70 flex items-center justify-between gap-3 border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="border-pulse/25 bg-pulse/10 text-pulse flex size-9 shrink-0 items-center justify-center rounded-full border">
                  <SparkIcon className="size-[1.1rem]" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-tech text-mist text-sm font-semibold tracking-tight">
                    Ask about my work
                  </h2>
                  <p className="text-fog flex items-center gap-1.5 font-mono text-[0.6875rem]">
                    <span
                      className={`size-1.5 rounded-full ${isStreaming ? 'bg-pulse animate-live-pulse' : 'bg-live'}`}
                      aria-hidden="true"
                    />
                    {isStreaming ? 'Thinking…' : 'Online'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
                className="text-fog hover:text-mist shrink-0 transition-colors"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ChatLog turns={turns} isStreaming={isStreaming} onSuggestionClick={send} />
              <div ref={logEndRef} />
            </div>

            {status === 'error' && errorMessage && (
              <p
                role="alert"
                className="border-alert/20 bg-alert/5 text-alert mx-4 mb-2 rounded-xl border px-3.5 py-2.5 text-sm leading-6"
              >
                {errorMessage}
              </p>
            )}

            <div className="border-edge/70 border-t px-4 py-3">
              <ChatInput disabled={isStreaming} onSend={send} />
              <p className="text-fog/70 mt-2.5 text-center font-mono text-[0.625rem]">
                Conversations may be logged to prevent abuse.
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="bg-pulse text-void shadow-pulse/25 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 hover:brightness-110"
      >
        {isOpen ? <CloseIcon className="size-6" /> : <ChatIcon className="size-6" />}
      </button>
    </div>
  )
}
