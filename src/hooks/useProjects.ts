import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/apiClient'
import type { Page, ProjectRead } from '@/types/api'

// limit=100 (the backend's max) rather than real pagination — a personal portfolio
// realistically never has more published projects than fit on one page.
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<Page<ProjectRead>>('/projects?limit=100'),
  })
}
