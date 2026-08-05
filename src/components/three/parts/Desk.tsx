import type { MaterialPalette } from '../lib/materials'
import { Part } from '../lib/primitives'

/** Surface height of the desktop. Everything that sits on the desk derives from this. */
export const DESK_TOP_Y = 0.74

/**
 * A sit-stand style frame: two T-legs and a floating top, which keeps the space
 * under the desk open so the chair and the seated figure stay readable in silhouette.
 */
export function Desk({ palette }: { palette: MaterialPalette }) {
  return (
    <group>
      <Part material={palette.deskTop} position={[0, DESK_TOP_Y - 0.02, -0.05]}>
        <boxGeometry args={[2.5, 0.04, 0.78]} />
      </Part>

      {/* A thin lip under the front edge — reads as a chamfered desktop rather than
          a slab, and catches a highlight from the keyboard's underglow. */}
      <Part material={palette.deskFrame} position={[0, DESK_TOP_Y - 0.05, 0.33]}>
        <boxGeometry args={[2.5, 0.022, 0.03]} />
      </Part>

      {[-0.95, 0.95].map((x) => (
        <group key={x} position={[x, 0, -0.05]}>
          <Part material={palette.metal} position={[0, DESK_TOP_Y / 2 - 0.02, 0]}>
            <boxGeometry args={[0.07, DESK_TOP_Y - 0.06, 0.07]} />
          </Part>
          <Part material={palette.deskFrame} position={[0, 0.02, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.62]} />
          </Part>
        </group>
      ))}

      {/* Cable channel slung under the top — the detail that says "someone actually
          set this desk up" without adding a visible cable spaghetti to model. */}
      <Part material={palette.deskFrame} position={[0, DESK_TOP_Y - 0.11, -0.3]}>
        <boxGeometry args={[0.9, 0.05, 0.08]} />
      </Part>
    </group>
  )
}
