import { Link } from 'react-router'

import { BlogCard } from '@/components/blog/BlogCard'
import { Reveal } from '@/components/common/Reveal'
import { EmptyState, ErrorState, SkeletonRow } from '@/components/common/States'
import { ArrowIcon } from '@/components/common/icons'
import { Section } from '@/components/layout/Section'
import { useBlogPosts } from '@/hooks/useBlogPosts'

const PREVIEW_COUNT = 3

/**
 * The three most recent posts on the home page, linking through to the archive.
 *
 * Reuses the existing `useBlogPosts` hook and the same public endpoint the archive
 * page calls — only the page size differs, so this adds a section without adding a
 * request shape the backend has not already served.
 */
export function WritingSection() {
  const { data, isPending, isError } = useBlogPosts({ limit: PREVIEW_COUNT })

  return (
    <Section
      id="writing"
      route="GET /blog"
      title="Notes from the build"
      lede="Occasional writing on backend architecture, AI systems, and the things that only show up in production."
      action={
        <Link
          to="/blog"
          className="text-fog hover:text-pulse group inline-flex items-center gap-2 font-mono text-sm transition-colors"
        >
          All posts
          <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      }
    >
      {isPending && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <SkeletonRow key={index} />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState>Couldn&apos;t load posts right now — please try again shortly.</ErrorState>
      )}

      {data && data.items.length === 0 && (
        <EmptyState>No posts published yet — the first one is in progress.</EmptyState>
      )}

      {data && data.items.length > 0 && (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((post, index) => (
            <li key={post.id} className="h-full">
              <Reveal delay={index * 0.06} className="h-full">
                <BlogCard post={post} layout="grid" />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
