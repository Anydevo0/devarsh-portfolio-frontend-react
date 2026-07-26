import { useMutation } from '@tanstack/react-query'

import { apiFetch } from '@/lib/apiClient'
import type { ContactFormRequest, ContactSubmissionAck } from '@/types/api'

export function useContactForm() {
  return useMutation({
    mutationFn: (payload: ContactFormRequest) =>
      apiFetch<ContactSubmissionAck>('/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })
}
