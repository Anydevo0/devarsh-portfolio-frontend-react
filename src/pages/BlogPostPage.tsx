import { Link, useParams } from 'react-router'

import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { useBlogPost } from '@/hooks/useBlogPost'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isPending, isError } = useBlogPost(slug)

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-sm text-fog">Loading…</p>
      </main>
    )
  }

  if (isError || !post) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-sm text-fog">
          Couldn&apos;t find that post.{' '}
          <Link to="/blog" className="text-pulse underline">
            Back to writing
          </Link>
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Link to="/blog" className="font-mono text-sm text-fog transition-colors hover:text-pulse">
        ← All posts
      </Link>
      <p className="mt-5 font-mono text-xs text-fog">
        {new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      <h1 className="mt-1 font-tech text-4xl font-bold text-mist sm:text-5xl">{post.title}</h1>
      {post.tags.length > 0 && (
        <p className="mt-3 font-mono text-xs text-fog">
          {post.tags.map((tag) => `#${tag}`).join(' ')}
        </p>
      )}
      <div className="mt-8">
        <MarkdownRenderer content={post.content} className="prose prose-tech" />
      </div>
    </main>
  )
}
