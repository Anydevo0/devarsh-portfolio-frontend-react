import { adminFetch } from './client'

import type { BlogPostListItem, BlogPostRead, BlogPostWrite, Page } from '@/types/api'

// The admin list endpoint returns the lean BlogPostListItem shape (no `content`),
// same as the public list — only the single-post fetch includes the full body.
export function listBlogPosts(): Promise<Page<BlogPostListItem>> {
  return adminFetch<Page<BlogPostListItem>>('/admin/blog/posts?limit=100')
}

export function getBlogPost(id: number): Promise<BlogPostRead> {
  return adminFetch<BlogPostRead>(`/admin/blog/posts/${id}`)
}

export function createBlogPost(payload: BlogPostWrite): Promise<BlogPostRead> {
  return adminFetch<BlogPostRead>('/admin/blog/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateBlogPost(id: number, payload: BlogPostWrite): Promise<BlogPostRead> {
  return adminFetch<BlogPostRead>(`/admin/blog/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteBlogPost(id: number): Promise<void> {
  return adminFetch<void>(`/admin/blog/posts/${id}`, { method: 'DELETE' })
}
