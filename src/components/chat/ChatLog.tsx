import { SparkIcon } from '@/components/common/icons'
import type { ChatTurn } from '@/hooks/useChatStream'

interface ChatLogProps {
  turns: ChatTurn[]
  isStreaming: boolean
  onSuggestionClick: (message: string) => void
}

/** Openers that show what the assistant can actually answer, rather than "Hi!". */
const SUGGESTIONS = [
  'What have you built with FastAPI?',
  'Tell me about your AI work',
  'What are you looking for next?',
]

// Append-only, never reordered — index is a stable enough key here.
export function ChatLog({ turns, isStreaming, onSuggestionClick }: ChatLogProps) {
  if (turns.length === 0) {
    return (
      <div className="flex flex-col items-start gap-5 py-2">
        <span className="border-pulse/25 bg-pulse/10 text-pulse flex size-10 items-center justify-center rounded-full border">
          <SparkIcon className="size-5" />
        </span>
        <p className="text-mist text-sm leading-6">
          Ask me anything about Devarsh&apos;s work — answers come from this site&apos;s own
          content.
        </p>
        {/* An empty state that hands over a next action instead of only explaining itself. */}
        <ul className="flex flex-col gap-2 self-stretch">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="border-edge bg-void/40 text-fog hover:border-pulse/40 hover:text-mist w-full rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {turns.map((turn, index) => {
        const isUser = turn.role === 'user'
        // The assistant's turn is appended empty and filled by the stream, so an
        // empty trailing turn means the first token is still on the wire.
        const isPending = !isUser && turn.content === '' && isStreaming

        return (
          <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={
                isUser
                  ? 'bg-pulse text-void max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-6'
                  : 'glass-soft text-mist max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-6'
              }
            >
              {isPending ? (
                <TypingDots />
              ) : (
                <span className="whitespace-pre-wrap">{turn.content}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Three dots on a staggered bounce, while the first token is still on the wire. */
function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" role="status" aria-label="Assistant is typing">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="typing-dot bg-fog size-1.5 rounded-full"
          style={{ animationDelay: `${index * 0.16}s` }}
        />
      ))}
    </span>
  )
}
