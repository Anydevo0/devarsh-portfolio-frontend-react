import { Link } from 'react-router'

import type { BlogPostListItem } from '@/types/api'

interface BlogCardProps {
  post: BlogPostListItem
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="rounded-2xl border border-line/60 bg-paper p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <p className="font-mono text-xs text-mute">
        {new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      <h3 className="mt-1 font-display text-xl font-bold">
        <Link to={`/blog/${post.slug}`} className="hover:text-wire">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="mt-2 text-ink/80">{post.excerpt}</p>}
      {post.tags.length > 0 && (
        <p className="mt-3 font-mono text-xs text-mute">
          {post.tags.map((tag) => `#${tag}`).join(' ')}
        </p>
      )}
    </article>
  )
}
