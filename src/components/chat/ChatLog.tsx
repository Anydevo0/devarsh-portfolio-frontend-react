import type { ChatTurn } from '@/hooks/useChatStream'

interface ChatLogProps {
  turns: ChatTurn[]
}

// Append-only, never reordered — index is a stable enough key here.
export function ChatLog({ turns }: ChatLogProps) {
  if (turns.length === 0) {
    return (
      <p className="text-sm text-fog">
        Ask me anything about my work — try &quot;what have you built with FastAPI?&quot;
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {turns.map((turn, index) => (
        <div key={index} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={
              turn.role === 'user'
                ? 'max-w-[80%] rounded-2xl rounded-br-md bg-pulse px-4 py-2.5 text-sm text-void'
                : 'max-w-[80%] rounded-2xl rounded-bl-md border border-edge bg-void px-4 py-2.5 text-sm text-mist'
            }
          >
            <span className="whitespace-pre-wrap">
              {turn.content || (turn.role === 'assistant' ? '…' : '')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
