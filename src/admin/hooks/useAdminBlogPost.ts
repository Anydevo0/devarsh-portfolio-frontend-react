import { useQuery } from '@tanstack/react-query'

import { getBlogPost } from '@/admin/api/blog'

export function useAdminBlogPost(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'blog-posts', id],
    queryFn: () => getBlogPost(id as number),
    enabled: id !== undefined,
  })
}
