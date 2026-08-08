/**
 * The page's vanishing point, sitting between the last section and the footer.
 *
 * Used to carry a ruled ground plane in perspective, tipped away toward a lit
 * horizon — a technical HUD-floor answer to the same question the hero's 3D room
 * asks with an actual room. Two grids bookending the page argued the same point
 * twice; dropping this one and keeping `PageAtmosphere`'s drifting glow as the only
 * texture between hero and footer lets the ending be quiet instead. What is left is
 * the thing the grid was drawn on top of anyway: light gathering low on the page and
 * settling, rather than a floor rendered for nobody to stand on.
 *
 * Three stacked radial gradients, same light as before — no canvas, no geometry,
 * nothing that animates. A static glow earns its keep here by not moving: the hero
 * opens the page with motion, and the page should not close on more of it.
 */
export function Horizon() {
  return (
    <div className="pointer-events-none relative h-40 w-full overflow-hidden sm:h-52" aria-hidden="true">
      <div
        className="absolute inset-x-0 top-1/2 h-56 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 55%, rgba(91,127,255,0.16), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(91,127,255,0.45) 24%, rgba(34,211,238,0.65) 50%, rgba(139,92,246,0.45) 76%, transparent)',
        }}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-32"
        style={{
          background: 'radial-gradient(50% 100% at 50% 0%, rgba(34,211,238,0.1), transparent 72%)',
        }}
      />
    </div>
  )
}
