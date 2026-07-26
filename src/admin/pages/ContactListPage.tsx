import { Link } from 'react-router'

import { Pill } from '@/admin/components/Pill'
import { useAdminContactSubmissions } from '@/admin/hooks/useAdminContactSubmissions'
import type { ContactEmailStatus } from '@/types/api'

// No true red exists in the palette — `failed` uses signal (amber), which does
// double duty here as "needs attention".
const STATUS_TONE: Record<ContactEmailStatus, 'wire' | 'signal' | 'outline'> = {
  sent: 'wire',
  pending: 'outline',
  skipped_breaker_open: 'outline',
  failed: 'signal',
}

const STATUS_LABEL: Record<ContactEmailStatus, string> = {
  sent: 'Sent',
  pending: 'Pending',
  skipped_breaker_open: 'Skipped',
  failed: 'Failed',
}

export function ContactListPage() {
  const { data, isLoading, isError } = useAdminContactSubmissions()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Contact submissions</h1>

      {isLoading && <p className="mt-6 font-mono text-sm text-mute">Loading…</p>}
      {isError && (
        <p role="alert" className="mt-6 font-mono text-sm text-signal">
          Couldn&apos;t load submissions.
        </p>
      )}
      {data && data.items.length === 0 && (
        <p className="mt-6 font-mono text-sm text-mute">No submissions yet.</p>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-mute uppercase">
                <th className="py-2 pr-4">From</th>
                <th className="py-2 pr-4">Message</th>
                <th className="py-2 pr-4">Email status</th>
                <th className="py-2 pr-4">Received</th>
                <th className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((submission) => (
                <tr key={submission.id} className="border-b border-line">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{submission.name}</p>
                    <p className="font-mono text-xs text-mute">{submission.email}</p>
                  </td>
                  <td className="max-w-sm truncate py-3 pr-4 text-ink/80">
                    {submission.message}
                  </td>
                  <td className="py-3 pr-4">
                    <Pill tone={STATUS_TONE[submission.email_status]}>
                      {STATUS_LABEL[submission.email_status]}
                    </Pill>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-mute">
                    {new Date(submission.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/admin/contact/${submission.id}`}
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
