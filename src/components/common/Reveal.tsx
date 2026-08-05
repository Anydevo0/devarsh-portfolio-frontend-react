import { m, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Seconds to hold before this element animates — used to stagger grids. */
  delay?: number
}

/**
 * One scroll-reveal for the whole site: fade and rise, once, on first entry.
 *
 * Staggering is a `delay` at the call site rather than a variants/orchestration
 * setup, because the only thing ever staggered here is a flat list of cards and
 * `index * 0.06` expresses that with nothing to learn.
 *
 * When the visitor prefers reduced motion this renders a plain element with no
 * animation attached at all — not an animation with a zero duration, which would
 * still leave content invisible until an observer happened to fire.
 *
 * Uses `m` rather than `motion`: the feature set is loaded once by the `LazyMotion`
 * provider in Layout, which keeps the animation library's tree-shakeable half out of
 * the main bundle. See the note there.
 */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  )
}
