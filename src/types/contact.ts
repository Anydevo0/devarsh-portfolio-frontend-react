export interface ContactFormRequest {
  name: string
  email: string
  message: string
  nickname?: string
}

export interface ContactSubmissionAck {
  status: 'received'
}

export type ContactEmailStatus = 'pending' | 'sent' | 'failed' | 'skipped_breaker_open'

export interface ContactSubmissionRead {
  id: number
  name: string
  email: string
  message: string
  email_status: ContactEmailStatus
  created_at: string
  updated_at: string
}
