import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * One continuous environment behind everything below the hero.
 *
 * Deliberately a single element spanning About through Contact rather than a backdrop
 * per section. Five separate treatments made the page read as five pages: each one
 * ended on a visible seam, and the eye kept getting told "new thing" where the content
 * was actually continuing an argument. Sections are separated by space and typography
 * — the things that should be doing that job — while the environment stays one place.
 *
 * Used to carry a ruled grid the full height of the page. Right below the hero's own
 * 3D desk, a technical grid read as the room's floor continuing into flat 2D — a HUD
 * under the writing rather than atmosphere behind it. Dropping it left the colour wash
 * and the light seam to carry the page on their own, which is what they were already
 * doing the more interesting share of; two slow, soft glows now take the grid's old
 * job of keeping a static wash from feeling inert, using the exact drift already
 * established for the hero's own fallback poster so the motion reads as one idea
 * continuing rather than a second kind of movement introduced partway down the page.
 *
 * Everything is a plain gradient. No `filter: blur()`, which on an element this tall
 * is expensive to repaint; the pools are soft because the gradients themselves are
 * soft, and the drift moves `transform` only, so it composites without a repaint.
 */
export function PageAtmosphere() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
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

      {/* Two soft pools, each parked where a colour above is already strongest, so the
          drift reads as that pool breathing rather than a new light arriving. One per
          direction (see `drift-one`/`drift-two`) keeps them from ever drifting in
          lockstep, which is what would make two circles read as one blinking thing. */}
      <div
        className={`absolute top-[8%] left-[-6%] h-[42rem] w-[42rem] rounded-full ${
          prefersReducedMotion ? '' : 'animate-drift-one'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(91,127,255,0.16), transparent 68%)',
        }}
      />
      <div
        className={`absolute top-[72%] right-[-8%] h-[46rem] w-[46rem] rounded-full ${
          prefersReducedMotion ? '' : 'animate-drift-two'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.13), transparent 66%)',
        }}
      />

      {/* A single light seam running the height of the page, just off the measure's
          left edge. It ties the whole run together without repeating per section. */}
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
