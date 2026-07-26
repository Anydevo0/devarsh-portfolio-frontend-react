import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { Pill } from '@/admin/components/Pill'
import { useAdminConversation } from '@/admin/hooks/useAdminConversation'
import {
  useDeleteConversation,
  useSetConversationFlag,
} from '@/admin/hooks/useConversationMutations'

export function ChatConversationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: conversation, isLoading, isError } = useAdminConversation(id)
  const flagMutation = useSetConversationFlag()
  const deleteMutation = useDeleteConversation()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (isLoading) {
    return <p className="font-mono text-sm text-mute">Loading…</p>
  }

  if (isError || !conversation || !id) {
    return (
      <p role="alert" className="font-mono text-sm text-signal">
        Couldn&apos;t load that conversation.
      </p>
    )
  }

  return (
    <div>
      <Link to="/admin/chat" className="font-mono text-sm text-wire hover:underline">
        ← All conversations
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{conversation.id.slice(0, 8)}…</h1>
          <p className="mt-1 font-mono text-xs text-mute">
            {conversation.user_agent ?? 'Unknown user agent'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => flagMutation.mutate({ id, isFlagged: !conversation.is_flagged })}
            className="rounded border border-line px-3 py-1.5 font-mono text-xs hover:bg-line/20"
          >
            {conversation.is_flagged ? 'Unflag conversation' : 'Flag conversation'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="font-mono text-xs text-signal hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {/* The admin-set conversation-level flag — distinct from each message's
          system-set is_flagged badge below (prompt-leak detection). */}
      {conversation.is_flagged && (
        <div className="mt-3">
          <Pill tone="signal">Conversation flagged</Pill>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 rounded border border-line p-6">
        {conversation.messages.map((message) => (
          <div key={message.id}>
            <p className="font-mono text-sm">
              <span className={message.role === 'user' ? 'text-wire' : 'text-signal'}>
                {message.role === 'user' ? 'you' : 'assistant'}:
              </span>{' '}
              <span className="whitespace-pre-wrap text-ink">{message.content}</span>
            </p>
            {message.is_flagged && (
              <div className="mt-1">
                <Pill tone="signal">Flagged by system</Pill>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this conversation?"
        description="This conversation and all its messages will be permanently removed. This can't be undone."
        confirmLabel="Delete conversation"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate(id, { onSuccess: () => navigate('/admin/chat') })
        }}
      />
    </div>
  )
}
