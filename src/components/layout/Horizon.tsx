import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * The page's vanishing point, sitting between the last section and the footer.
 *
 * A ground plane laid into perspective and ruled with the same grid the rest of the
 * page carries, running away to a lit horizon. It replaces a decorative wave, which
 * read as an ornament stuck onto the top of the footer; this reads as the environment
 * continuing past the content and receding, which is the same thing the 3D hero does
 * at the other end of the page. Beginning and end are then the same idea.
 *
 * Built from two repeating gradients on one transformed element — no canvas, no
 * geometry, and only `background-position` animates.
 */
export function Horizon() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      className="pointer-events-none relative h-56 w-full overflow-hidden sm:h-72"
      aria-hidden="true"
    >
      {/* The glow gathering above the horizon, then the horizon line itself. */}
      <div
        className="absolute inset-x-0 top-[38%] h-36 -translate-y-full"
        style={{
          background:
            'radial-gradient(55% 100% at 50% 100%, rgba(91,127,255,0.22), transparent 72%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-[38%] h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(91,127,255,0.6) 22%, rgba(34,211,238,0.85) 50%, rgba(139,92,246,0.6) 78%, transparent)',
        }}
      />
      <div
        className="absolute inset-x-0 top-[38%] h-16"
        style={{
          background:
            'radial-gradient(50% 100% at 50% 0%, rgba(34,211,238,0.14), transparent 70%)',
        }}
      />

      {/* The receding plane. `perspective` on the parent plus a rotateX turn the two
          repeating gradients into a ground grid converging at the horizon.
          The perspective distance and the tilt have to be tuned together: too steep a
          rotation against too short a perspective compresses the whole plane into a
          couple of pixels and the grid vanishes. */}
      <div className="absolute inset-x-0 top-[38%] bottom-0" style={{ perspective: '440px' }}>
        <div
          className={`absolute inset-x-[-75%] top-0 h-[560px] origin-top ${
            prefersReducedMotion ? '' : 'animate-horizon'
          }`}
          style={{
            transform: 'rotateX(71deg)',
            backgroundImage:
              'linear-gradient(to right, rgba(120,150,255,0.42) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,150,255,0.34) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'linear-gradient(to bottom, #000 2%, rgba(0,0,0,0.55) 32%, transparent 78%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 2%, rgba(0,0,0,0.55) 32%, transparent 78%)',
          }}
        />
      </div>
    </div>
  )
}
