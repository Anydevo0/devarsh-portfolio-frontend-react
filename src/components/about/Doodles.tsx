import type { SVGProps } from 'react'

/**
 * Hand-drawn marginalia for the About page's notebook conceit — an underline, an
 * arrow, a scribble. Kept apart from `common/icons.tsx`: those are functional glyphs
 * that always sit inside a control with its own accessible name, where these have no
 * meaning at all beyond decorating a margin, so every one is `aria-hidden` at source
 * and none will ever need a label.
 *
 * Drawn as wobbly paths rather than straight ones — a perfectly straight underline
 * under handwritten text is the one thing that gives away that a computer drew it.
 */
type DoodleProps = SVGProps<SVGSVGElement>

/** The underline beneath the handwritten heading. */
export function UnderlineDoodle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 220 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 8.5c26-5 54-7 79-4.5s52 6 79 3S208 3 217 5.5"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A small arrow, used to point from a margin note toward the thing it's about. */
export function ArrowDoodle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 60 40" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6c14 3 26 11 33 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M27 27c3 1 7 2 10 3M37 30c1-3 2-7 2-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** A tiny scribbled asterisk for empty margin space — the smallest doodle here. */
export function ScribbleDoodle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16 4c1 7 0 15-1 24M6 10c6 4 13 8 20 10M26 9c-6 5-13 9-19 12"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  )
}
