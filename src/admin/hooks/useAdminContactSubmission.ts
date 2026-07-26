import { useQuery } from '@tanstack/react-query'

import { getContactSubmission } from '@/admin/api/contact'

export function useAdminContactSubmission(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'contact-submissions', id],
    queryFn: () => getContactSubmission(id as number),
    enabled: id !== undefined,
  })
}
