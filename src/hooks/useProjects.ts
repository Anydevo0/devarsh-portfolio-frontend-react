import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/apiClient'
import type { Page, ProjectRead } from '@/types/api'

// limit=100 (the backend's max) rather than real pagination — a personal portfolio
// realistically never has more published projects than fit on one page.
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<Page<ProjectRead>>('/projects?limit=100'),
    // Newest first, regardless of whatever order the API happens to return —
    // `display_order` exists on the model but nothing reads it for this grid, and the
    // API's own ordering isn't a contract this page should depend on. `select` rather
    // than sorting in the component: it runs once per fetch and memoises against the
    // previous result, so re-renders don't re-sort, and any future consumer of this
    // hook inherits the same order instead of needing to know to re-derive it.
    select: (page) => ({
      ...page,
      items: [...page.items].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }),
  })
}
