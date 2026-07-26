import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/apiClient'
import type { BlogPostListItem, Page } from '@/types/api'

interface UseBlogPostsParams {
  q?: string
  tag?: string
  limit?: number
  offset?: number
}

export function useBlogPosts({ q, tag, limit = 10, offset = 0 }: UseBlogPostsParams) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  if (q) params.set('q', q)
  if (tag) params.set('tag', tag)

  return useQuery({
    queryKey: ['blog', 'posts', { q, tag, limit, offset }],
    queryFn: () => apiFetch<Page<BlogPostListItem>>(`/blog/posts?${params.toString()}`),
  })
}
