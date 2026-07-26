export interface ProjectRead {
  id: number
  title: string
  slug: string
  short_description: string
  description: string
  tech_stack: string[]
  repo_url: string | null
  live_demo_url: string | null
  image_urls: string[]
  is_featured: boolean
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// The admin create/update request body — slug omitted lets the backend
// auto-generate it from the title.
export interface ProjectWrite {
  title: string
  slug?: string
  short_description: string
  description: string
  tech_stack: string[]
  repo_url: string | null
  live_demo_url: string | null
  image_urls: string[]
  is_featured: boolean
  display_order: number
  is_published: boolean
}
