import { useQuery } from '@tanstack/react-query'

import { listContactSubmissions } from '@/admin/api/contact'

export function useAdminContactSubmissions() {
  return useQuery({
    queryKey: ['admin', 'contact-submissions'],
    queryFn: () => listContactSubmissions(),
  })
}
