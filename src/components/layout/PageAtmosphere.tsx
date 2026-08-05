import type { CSSProperties } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * One continuous environment behind everything below the hero.
 *
 * Deliberately a single element spanning About through Contact rather than a backdrop
 * per section. Five separate treatments made the page read as five pages: each one
 * ended on a visible seam, and the eye kept getting told "new thing" where the content
 * was actually continuing an argument. Here the grid runs unbroken from top to bottom
 * and only the colour drifts, so sections are separated by space and typography — the
 * things that should be doing that job — while the environment stays one place.
 *
 * Everything is a plain gradient or a repeating gradient. No `filter: blur()`, which
 * on an element this tall is expensive to repaint; the pools are soft because the
 * gradients themselves are soft.
 */
export function PageAtmosphere() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* The through-line: one grid, unbroken for the whole scroll, faded at both
          ends so it emerges out of the hero and dissolves before the footer. */}
      <div
        className="bg-grid absolute inset-0"
        style={
          {
            '--grid-size': '58px',
            '--grid-ink': 'rgba(232,237,247,0.032)',
            maskImage:
              'linear-gradient(to bottom, transparent, #000 8%, #000 88%, transparent 99%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent, #000 8%, #000 88%, transparent 99%)',
          } as CSSProperties
        }
      />

      {/* Colour drifts down the page in one pass: blue where the writing is, violet
          through the work, cyan gathering toward the contact form. Positioned as
          percentages of the whole run, so the transitions land between sections
          rather than at their edges. */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(60rem 34rem at 6% 4%, rgba(91,127,255,0.11), transparent 60%)',
            'radial-gradient(52rem 30rem at 96% 22%, rgba(139,92,246,0.10), transparent 58%)',
            'radial-gradient(58rem 32rem at 2% 46%, rgba(34,211,238,0.06), transparent 58%)',
            'radial-gradient(64rem 36rem at 92% 66%, rgba(139,92,246,0.09), transparent 60%)',
            'radial-gradient(70rem 38rem at 48% 98%, rgba(91,127,255,0.13), transparent 62%)',
          ].join(','),
        }}
      />

      {/* A single light seam running the height of the page, just off the measure's
          left edge. It is what the experience timeline's rail appears to be drawn
          from, and it ties the whole run together without repeating per section. */}
      <div
        className={`absolute top-[6%] bottom-[10%] left-[max(1.5rem,calc(50%-34rem))] w-px ${
          prefersReducedMotion ? 'opacity-30' : 'animate-beam'
        }`}
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(91,127,255,0.4) 14%, rgba(139,92,246,0.28) 52%, rgba(34,211,238,0.3) 82%, transparent)',
        }}
      />
    </div>
  )
}
