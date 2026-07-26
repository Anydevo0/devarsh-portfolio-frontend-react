import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/apiClient'
import type { ProjectRead } from '@/types/api'

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => apiFetch<ProjectRead>(`/projects/${slug}`),
    enabled: !!slug,
  })
}
