import { adminFetch } from './client'

import type { ContactSubmissionRead, Page } from '@/types/api'

export function listContactSubmissions(): Promise<Page<ContactSubmissionRead>> {
  return adminFetch<Page<ContactSubmissionRead>>('/admin/contact?limit=100')
}

export function getContactSubmission(id: number): Promise<ContactSubmissionRead> {
  return adminFetch<ContactSubmissionRead>(`/admin/contact/${id}`)
}
