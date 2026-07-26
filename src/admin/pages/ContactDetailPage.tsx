import { Link, useParams } from 'react-router'

import { Pill } from '@/admin/components/Pill'
import { useAdminContactSubmission } from '@/admin/hooks/useAdminContactSubmission'
import type { ContactEmailStatus } from '@/types/api'

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

export function ContactDetailPage() {
  const { id } = useParams()
  const {
    data: submission,
    isLoading,
    isError,
  } = useAdminContactSubmission(id ? Number(id) : undefined)

  if (isLoading) {
    return <p className="font-mono text-sm text-mute">Loading…</p>
  }

  if (isError || !submission) {
    return (
      <p role="alert" className="font-mono text-sm text-signal">
        Couldn&apos;t load that submission.
      </p>
    )
  }

  return (
    <div>
      <Link to="/admin/contact" className="font-mono text-sm text-wire hover:underline">
        ← All submissions
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold">{submission.name}</h1>
      <p className="mt-1 font-mono text-sm text-mute">{submission.email}</p>
      <div className="mt-3 flex items-center gap-3">
        <Pill tone={STATUS_TONE[submission.email_status]}>
          {STATUS_LABEL[submission.email_status]}
        </Pill>
        <span className="font-mono text-xs text-mute">
          {new Date(submission.created_at).toLocaleString()}
        </span>
      </div>
      {/* Visitor input is never treated as markup — preserved-whitespace plain text only. */}
      <p className="mt-6 max-w-2xl whitespace-pre-wrap text-ink/90">{submission.message}</p>
    </div>
  )
}
