import { Link } from 'react-router'

import { ArrowIcon } from '@/components/common/icons'
import type { BlogPostListItem } from '@/types/api'

interface BlogCardProps {
  post: BlogPostListItem
  /**
   * `row` puts the cover beside the text — for the single-column archive, where a
   * full-width 16:9 cover on every post would push the list off the screen. `grid`
   * stacks it above, for the multi-column summary on the home page.
   */
  layout?: 'row' | 'grid'
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

export function BlogCard({ post, layout = 'row' }: BlogCardProps) {
  const isRow = layout === 'row'

  return (
    <article
      className={`glass sheen group relative flex h-full overflow-hidden rounded-2xl transition-transform duration-500 hover:-translate-y-1 ${
        isRow ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      {post.cover_image_url && (
        <div
          className={`bg-abyss shrink-0 overflow-hidden ${
            isRow ? 'aspect-video sm:aspect-square sm:w-44' : 'aspect-video w-full'
          }`}
        >
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <time
          dateTime={post.created_at}
          className="text-fog font-mono text-xs tracking-wide"
        >
          {new Date(post.created_at).toLocaleDateString('en-US', DATE_FORMAT)}
        </time>

        <h3 className="font-tech text-mist group-hover:text-pulse mt-2 text-lg font-semibold tracking-tight transition-colors">
          <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>

        {/* Clamp and `flex-1` cannot share an element — see the note in ProjectCard. */}
        {post.excerpt && (
          <p className="text-fog mt-3 line-clamp-2 text-sm leading-7">{post.excerpt}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          {post.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="border-edge bg-void/50 text-fog/90 rounded-md border px-2 py-1 font-mono text-[0.6875rem]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <span
            className="text-fog/60 group-hover:text-pulse shrink-0 transition-all duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <ArrowIcon className="size-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
