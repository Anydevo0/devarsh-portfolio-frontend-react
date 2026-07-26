export interface BlogPostListItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  tags: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

// BlogPostRead is exactly BlogPostListItem plus `content` — the public list endpoint
// omits the full body so a page of posts doesn't pull every article over the wire.
export type BlogPostRead = BlogPostListItem & { content: string }

// The admin create/update request body — slug omitted lets the backend
// auto-generate it from the title.
export interface BlogPostWrite {
  title: string
  slug?: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  tags: string[]
  is_published: boolean
}
