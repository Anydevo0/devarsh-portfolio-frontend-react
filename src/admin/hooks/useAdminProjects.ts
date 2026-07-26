import { useQuery } from '@tanstack/react-query'

import { listProjects } from '@/admin/api/projects'

export function useAdminProjects() {
  return useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => listProjects(),
  })
}
