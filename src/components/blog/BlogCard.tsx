import { Link } from 'react-router'

import type { BlogPostListItem } from '@/types/api'

interface BlogCardProps {
  post: BlogPostListItem
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="rounded-2xl border border-edge bg-panel p-6 transition-all duration-200 hover:-translate-y-1 hover:border-pulse/40">
      <p className="font-mono text-xs text-fog">
        {new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      <h3 className="mt-1 font-tech text-xl font-bold text-mist">
        <Link to={`/blog/${post.slug}`} className="hover:text-pulse">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="mt-2 text-mist/75">{post.excerpt}</p>}
      {post.tags.length > 0 && (
        <p className="mt-3 font-mono text-xs text-fog">
          {post.tags.map((tag) => `#${tag}`).join(' ')}
        </p>
      )}
    </article>
  )
}
