import { Link, useSearchParams } from 'react-router'

import { Pill } from '@/admin/components/Pill'
import { useAdminConversations } from '@/admin/hooks/useAdminConversations'

export function ChatListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const flaggedOnly = searchParams.get('flagged') === 'true'
  const { data, isLoading, isError } = useAdminConversations(flaggedOnly)

  function toggleFlaggedOnly(checked: boolean) {
    const next = new URLSearchParams(searchParams)
    if (checked) {
      next.set('flagged', 'true')
    } else {
      next.delete('flagged')
    }
    setSearchParams(next)
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Chat conversations</h1>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={flaggedOnly}
          onChange={(event) => toggleFlaggedOnly(event.target.checked)}
        />
        Flagged only
      </label>

      {isLoading && <p className="mt-6 font-mono text-sm text-mute">Loading…</p>}
      {isError && (
        <p role="alert" className="mt-6 font-mono text-sm text-signal">
          Couldn&apos;t load conversations.
        </p>
      )}
      {data && data.items.length === 0 && (
        <p className="mt-6 font-mono text-sm text-mute">No conversations yet.</p>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-mute uppercase">
                <th className="py-2 pr-4">Conversation</th>
                <th className="py-2 pr-4">Flagged</th>
                <th className="py-2 pr-4">Started</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((conversation) => (
                <tr key={conversation.id} className="border-b border-line">
                  <td className="py-3 pr-4 font-mono text-xs">{conversation.id.slice(0, 8)}…</td>
                  <td className="py-3 pr-4">
                    {conversation.is_flagged && <Pill tone="signal">Flagged</Pill>}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-mute">
                    {new Date(conversation.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-mute">
                    {new Date(conversation.updated_at).toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/admin/chat/${conversation.id}`}
                      className="font-mono text-xs text-wire hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
