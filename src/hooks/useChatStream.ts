import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError } from '@/lib/apiClient'
import { API_BASE_URL } from '@/lib/env'
import { parseSseStream } from '@/lib/sse'
import type { ApiErrorEnvelope } from '@/types/api-error'
import type { ChatDonePayload, ChatErrorPayload, ChatTokenPayload } from '@/types/chat'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export type ChatStatus = 'idle' | 'streaming' | 'error'

const UNAVAILABLE_MESSAGE = 'The assistant is temporarily unavailable. Please try again shortly.'

export function useChatStream() {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const conversationIdRef = useRef<string | undefined>(undefined)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const appendToLastAssistantTurn = useCallback((delta: string) => {
    setTurns((prev) => {
      const last = prev[prev.length - 1]
      if (!last) return prev
      return [...prev.slice(0, -1), { ...last, content: last.content + delta }]
    })
  }, [])

  const send = useCallback(
    async (message: string) => {
      setStatus('streaming')
      setErrorMessage(null)
      setTurns((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: '' },
      ])

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, conversation_id: conversationIdRef.current }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          // Pre-stream failures (e.g. the burst/daily rate limiter) reject the
          // request outright with the standard JSON error envelope — no SSE
          // frame is ever sent for these.
          const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | null
          const envelope = body?.error ?? {
            code: 'unknown',
            message: UNAVAILABLE_MESSAGE,
            details: null,
          }
          const retryAfter = res.headers.get('Retry-After')
          throw new ApiError(
            res.status,
            envelope.code,
            envelope.message,
            envelope.details,
            retryAfter ? Number(retryAfter) : null,
          )
        }

        for await (const evt of parseSseStream(res.body)) {
          if (evt.event === 'token') {
            const payload = JSON.parse(evt.data) as ChatTokenPayload
            appendToLastAssistantTurn(payload.content)
          } else if (evt.event === 'error') {
            // A terminal in-stream error (prompt-leak guardrail or an upstream
            // Groq failure) — distinct from the pre-stream 429 above.
            const payload = JSON.parse(evt.data) as ChatErrorPayload
            setStatus('error')
            setErrorMessage(payload.message)
            return
          } else if (evt.event === 'done') {
            const payload = JSON.parse(evt.data) as ChatDonePayload
            conversationIdRef.current = payload.conversation_id
          }
        }
        setStatus('idle')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setStatus('error')
        setErrorMessage(error instanceof ApiError ? error.message : UNAVAILABLE_MESSAGE)
      }
    },
    [appendToLastAssistantTurn],
  )

  return { turns, status, errorMessage, send }
}
