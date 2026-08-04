import { Link } from 'react-router'

import { ArrowIcon } from '@/components/common/icons'

/**
 * 404, written in the vocabulary the rest of the site already uses for its sections.
 * States what happened and offers the way out, rather than apologising or joking.
 */
export function NotFoundPage() {
  return (
    <main className="relative flex min-h-[70svh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
      <div className="aurora aurora--pulse animate-drift-one" aria-hidden="true" />

      <p className="glass-soft text-alert relative rounded-full px-3.5 py-1 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
        404 · Not found
      </p>
      <h1 className="font-tech text-section text-lit relative font-bold tracking-[-0.03em]">
        This page doesn&apos;t exist
      </h1>
      <p className="text-fog relative max-w-md leading-7">
        The link may be out of date, or the page may have moved. Everything else is still where you
        left it.
      </p>
      <Link
        to="/"
        className="group bg-pulse text-void relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm font-medium transition-all hover:-translate-y-0.5 hover:brightness-110"
      >
        Back to home
        <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </main>
  )
}
