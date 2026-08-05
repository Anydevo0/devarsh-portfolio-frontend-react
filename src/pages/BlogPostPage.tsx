import { Link, useParams } from 'react-router'

import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { ErrorState, SkeletonRow } from '@/components/common/States'
import { ArrowIcon } from '@/components/common/icons'
import { useBlogPost } from '@/hooks/useBlogPost'
import { readingTimeMinutes } from '@/lib/readingTime'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isPending, isError } = useBlogPost(slug)

  if (isPending) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <SkeletonRow />
      </main>
    )
  }

  if (isError || !post) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <ErrorState>
          That post doesn&apos;t exist or has been unpublished.{' '}
          <Link to="/blog" className="text-pulse underline">
            Back to all posts
          </Link>
          .
        </ErrorState>
      </main>
    )
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <div className="aurora aurora--pulse animate-drift-one" aria-hidden="true" />

      <Link
        to="/blog"
        className="text-fog hover:text-pulse group relative inline-flex items-center gap-2 font-mono text-sm transition-colors"
      >
        <ArrowIcon className="size-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
        All posts
      </Link>

      <header className="relative mt-8">
        {/* Reading time is computed from the real body, which only the single-post
            endpoint returns — see lib/readingTime.ts for why cards omit it. */}
        <div className="text-fog flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
          <span aria-hidden="true">·</span>
          <span>{readingTimeMinutes(post.content)} min read</span>
        </div>

        <h1 className="font-tech text-section text-lit mt-4 font-bold tracking-[-0.03em] text-balance">
          {post.title}
        </h1>

        {post.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="border-edge bg-void/50 text-fog rounded-md border px-2 py-1 font-mono text-[0.6875rem]"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="border-edge relative mt-10 aspect-video w-full rounded-2xl border object-cover"
        />
      )}

      <hr className="hairline relative mt-10 border-0" />

      <div className="relative mt-10">
        <MarkdownRenderer content={post.content} className="prose prose-tech max-w-none" />
      </div>
    </main>
  )
}
