import type { ReactNode } from 'react'

/**
 * The loading, empty and error states shared by every list on the public site.
 *
 * Collected here so the three never drift apart: a visitor who sees the projects
 * grid fail and the writing list fail should recognise the same treatment, and a
 * skeleton should occupy the space its real content will, so nothing shifts when the
 * data lands.
 */

/** Mirrors ProjectCard's proportions — image block, two text lines, a chip row. */
export function SkeletonCard() {
  return (
    <div className="glass overflow-hidden rounded-2xl" aria-hidden="true">
      <div className="shimmer bg-edge/40 aspect-video w-full" />
      <div className="flex flex-col gap-3 p-6">
        <div className="shimmer bg-edge/40 h-5 w-2/3 rounded" />
        <div className="shimmer bg-edge/30 h-3 w-full rounded" />
        <div className="shimmer bg-edge/30 h-3 w-4/5 rounded" />
        <div className="mt-2 flex gap-1.5">
          <div className="shimmer bg-edge/30 h-6 w-16 rounded-md" />
          <div className="shimmer bg-edge/30 h-6 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}

/** A single-column skeleton row, for the writing list. */
export function SkeletonRow() {
  return (
    <div className="glass rounded-2xl p-6" aria-hidden="true">
      <div className="shimmer bg-edge/30 h-3 w-24 rounded" />
      <div className="shimmer bg-edge/40 mt-3 h-5 w-1/2 rounded" />
      <div className="shimmer bg-edge/30 mt-3 h-3 w-full rounded" />
    </div>
  )
}

/**
 * Errors state what failed and what to do next, in the site's own voice — no
 * apology, no stack trace, and never a bare "something went wrong".
 */
export function ErrorState({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="glass text-fog rounded-2xl p-6 font-mono text-sm">
      <span className="text-alert mr-2" aria-hidden="true">
        !
      </span>
      {children}
    </p>
  )
}

/** An empty list is a statement of fact, not a dead end. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="glass text-fog rounded-2xl p-6 font-mono text-sm">{children}</p>
  )
}
