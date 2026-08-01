import { type FormEvent, useState } from 'react'
import { useSearchParams } from 'react-router'

import { BlogCard } from '@/components/blog/BlogCard'
import { BlogSearchBar } from '@/components/blog/BlogSearchBar'
import { Pagination } from '@/components/blog/Pagination'
import { TagFilter } from '@/components/blog/TagFilter'
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
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <h1 className="font-tech text-4xl font-bold text-mist sm:text-5xl">Writing</h1>

      <form onSubmit={applyFilters} className="mt-8 flex flex-wrap items-center gap-3">
        <BlogSearchBar value={qInput} onChange={setQInput} />
        <TagFilter value={tagInput} onChange={setTagInput} />
        <button
          type="submit"
          className="rounded-full border border-edge px-4 py-2 font-mono text-sm text-mist transition-colors hover:border-pulse hover:text-pulse"
        >
          Search
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-4">
        {isPending && <p className="font-mono text-sm text-fog">Loading…</p>}
        {isError && (
          <p className="font-mono text-sm text-fog">
            Couldn&apos;t load posts right now — please try again shortly.
          </p>
        )}
        {data && data.items.length === 0 && (
          <p className="font-mono text-sm text-fog">// no posts match yet.</p>
        )}
        {data?.items.map((post) => <BlogCard key={post.id} post={post} />)}
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
