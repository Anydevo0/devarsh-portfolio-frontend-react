import { useQuery } from '@tanstack/react-query'

import { listBlogPosts } from '@/admin/api/blog'

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ['admin', 'blog-posts'],
    queryFn: () => listBlogPosts(),
  })
}
