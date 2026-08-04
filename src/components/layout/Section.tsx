import type { ReactNode } from 'react'

import { Reveal } from '@/components/common/Reveal'

interface SectionProps {
  id: string
  /** HTTP method + path, e.g. `GET /projects`. See `RouteLabel`. */
  route: string
  title: string
  lede?: ReactNode
  children: ReactNode
  /** Right-aligned slot in the header, for a section-level link. */
  action?: ReactNode
}

/**
 * Every section on the public site is built from this, so the vertical rhythm, the
 * heading scale, and the eyebrow treatment are defined once rather than re-tuned per
 * section — which is what keeps six visually distinct sections reading as one page.
 */
export function Section({ id, route, title, lede, children, action }: SectionProps) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24 sm:py-32">
      <Reveal>
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <RouteLabel value={route} />
            <h2 className="font-tech text-section text-lit mt-5 font-bold tracking-[-0.03em] text-balance">
              {title}
            </h2>
            {lede && <p className="text-fog text-lede mt-5">{lede}</p>}
          </div>
          {action}
        </header>
      </Reveal>
      <div className="mt-14">{children}</div>
    </section>
  )
}

/**
 * The section eyebrow, written as an API route.
 *
 * This is the site's structural device, and it is meant to carry information rather
 * than decorate: the subject builds HTTP services, so the sections are addressed the
 * way his own work is. The method is real — every section that presents information
 * is a GET, and the contact form, the one place a visitor writes something, is the
 * only POST. Numbered markers were the alternative and were rejected: these sections
 * are not a sequence, so numbering them would assert an order that does not exist.
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
