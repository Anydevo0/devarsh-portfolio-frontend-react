import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createBlogPost, deleteBlogPost, updateBlogPost } from '@/admin/api/blog'
import type { BlogPostWrite } from '@/types/api'

export function useCreateBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BlogPostWrite) => createBlogPost(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts'] }),
  })
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BlogPostWrite }) =>
      updateBlogPost(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts', variables.id] })
    },
  })
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBlogPost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts'] }),
  })
}
