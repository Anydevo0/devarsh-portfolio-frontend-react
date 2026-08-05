import { type FormEvent, useState } from 'react'
import { useSearchParams } from 'react-router'

import { BlogCard } from '@/components/blog/BlogCard'
import { BlogSearchBar } from '@/components/blog/BlogSearchBar'
import { Pagination } from '@/components/blog/Pagination'
import { TagFilter } from '@/components/blog/TagFilter'
import { Reveal } from '@/components/common/Reveal'
import { EmptyState, ErrorState, SkeletonRow } from '@/components/common/States'
import { useBlogPosts } from '@/hooks/useBlogPosts'

const LIMIT = 10

export function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeQ = searchParams.get('q') ?? ''
  const activeTag = searchParams.get('tag') ?? ''
  const offset = Number(searchParams.get('offset') ?? '0')

  const [qInput, setQInput] = useState(activeQ)
  const [tagInput, setTagInput] = useState(activeTag)

  const { data, isPending, isError } = useBlogPosts({
    q: activeQ || undefined,
    tag: activeTag || undefined,
    limit: LIMIT,
    offset,
  })

  const isFiltered = Boolean(activeQ || activeTag)

  function applyFilters(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (qInput.trim()) params.set('q', qInput.trim())
    if (tagInput.trim()) params.set('tag', tagInput.trim())
    setSearchParams(params)
  }

  function goToOffset(newOffset: number) {
    const params = new URLSearchParams(searchParams)
    if (newOffset) params.set('offset', String(newOffset))
    else params.delete('offset')
    setSearchParams(params)
  }

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-20 sm:py-28">
      <div className="aurora aurora--halo animate-drift-two" aria-hidden="true" />

      <header className="relative">
        <p className="glass-soft inline-flex items-center gap-2.5 rounded-full py-1 pr-3.5 pl-2.5 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
          <span className="text-pulse">GET</span>
          <span className="bg-edge h-3 w-px" aria-hidden="true" />
          <span className="text-fog">/blog</span>
        </p>
        <h1 className="font-tech text-section text-lit mt-5 font-bold tracking-[-0.03em]">
          Notes from the build
        </h1>
        <p className="text-fog text-lede mt-5 max-w-2xl">
          Backend architecture, AI systems, and the things that only show up in production.
        </p>
      </header>

      <form
        onSubmit={applyFilters}
        className="relative mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <BlogSearchBar value={qInput} onChange={setQInput} />
        <TagFilter value={tagInput} onChange={setTagInput} />
        <button
          type="submit"
          className="glass text-mist hover:text-pulse shrink-0 rounded-xl px-5 py-2.5 font-mono text-sm transition-colors"
        >
          Search
        </button>
      </form>

      <div className="relative mt-10 flex flex-col gap-5">
        {isPending && [0, 1, 2].map((index) => <SkeletonRow key={index} />)}

        {isError && (
          <ErrorState>Couldn&apos;t load posts right now — please try again shortly.</ErrorState>
        )}

        {data && data.items.length === 0 && (
          <EmptyState>
            {isFiltered
              ? 'No posts match that search. Try a broader term or clear the tag filter.'
              : 'No posts published yet — the first one is in progress.'}
          </EmptyState>
        )}

        {data?.items.map((post, index) => (
          <Reveal key={post.id} delay={index * 0.05}>
            <BlogCard post={post} />
          </Reveal>
        ))}
      </div>

      {data && (
        <Pagination
          total={data.total}
          limit={data.limit}
          offset={data.offset}
          onPageChange={goToOffset}
        />
      )}
    </main>
  )
}
