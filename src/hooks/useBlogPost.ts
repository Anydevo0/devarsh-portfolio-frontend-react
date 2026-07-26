import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/apiClient'
import type { BlogPostRead } from '@/types/api'

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog', 'posts', slug],
    queryFn: () => apiFetch<BlogPostRead>(`/blog/posts/${slug}`),
    enabled: !!slug,
  })
}
