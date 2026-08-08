import type { ReactNode } from 'react'

import { Reveal } from '@/components/common/Reveal'

interface SectionProps {
  id: string
  /**
   * HTTP method + path, e.g. `POST /contact`. See `RouteLabel`. Optional: a section
   * with nothing distinctive to say about its own address — About and Projects, whose
   * headings already carry the section's identity — simply omits it rather than
   * printing a label for its own sake.
   */
  route?: string
  /**
   * Usually a plain string, styled by the `h2` below. `ReactNode` so a section can
   * substitute its own styling on the same element — About does this to make its
   * heading read as handwritten rather than as this component's default `font-tech`.
   */
  title: ReactNode
  lede?: ReactNode
  children: ReactNode
  /** Right-aligned slot in the header, for a section-level link. */
  action?: ReactNode
}

/**
 * Every section on the public site is built from this, so the vertical rhythm and the
 * heading scale are defined once rather than re-tuned per section — which is what
 * keeps several visually distinct sections reading as one page.
 */
export function Section({ id, route, title, lede, children, action }: SectionProps) {
  return (
    // Transparent by design: the environment behind every section below the hero is
    // one continuous layer owned by `PageAtmosphere`, so nothing is drawn here.
    <section id={id} className="relative scroll-mt-24 py-24 sm:py-32">
      {/* Padding belongs inside the measure, not on the section: with it outside, the
          6xl box is centred in the already-padded width and every heading sits 24px
          wider than the header's logo above it. */}
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <header className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              {route && <RouteLabel value={route} />}
              <h2
                className={`font-tech text-section text-lit font-bold tracking-[-0.03em] text-balance ${route ? 'mt-5' : ''}`}
              >
                {title}
              </h2>
              {lede && <p className="text-fog text-lede mt-5">{lede}</p>}
            </div>
            {action}
          </header>
        </Reveal>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  )
}

/**
 * The section eyebrow, written as an API route — the site's structural device where a
 * section's own address is worth stating. Not every section takes one: the method is
 * real, so it only appears where it says something true and useful about that section
 * specifically, rather than as a label every section carries by default. Numbered
 * markers were the alternative and were rejected: these sections are not a sequence,
 * so numbering them would assert an order that does not exist.
 */
function RouteLabel({ value }: { value: string }) {
  const [method, ...rest] = value.split(' ')
  const path = rest.join(' ')

  return (
    <p className="glass-soft inline-flex items-center gap-2.5 rounded-full py-1 pr-3.5 pl-2.5 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
      <span className={method === 'POST' ? 'text-live' : 'text-pulse'}>{method}</span>
      <span className="bg-edge h-3 w-px" aria-hidden="true" />
      <span className="text-fog">{path}</span>
    </p>
  )
}
