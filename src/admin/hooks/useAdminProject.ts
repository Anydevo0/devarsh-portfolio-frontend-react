import { useQuery } from '@tanstack/react-query'

import { getProject } from '@/admin/api/projects'

export function useAdminProject(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'projects', id],
    queryFn: () => getProject(id as number),
    enabled: id !== undefined,
  })
}
