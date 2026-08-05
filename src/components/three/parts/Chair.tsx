import { useMemo } from 'react'

import type { MaterialPalette } from '../lib/materials'
import { Limb, Part, type Vec3 } from '../lib/primitives'
import type { SceneQuality } from '../lib/textures'

/** Where the chair's column meets the floor. The seated figure is built around this. */
export const CHAIR_Z = 0.8
export const SEAT_Y = 0.48

const SPOKES = 5
const SPOKE_LENGTH = 0.3

/**
 * A task chair with a suspension-mesh back.
 *
 * The mesh back is doing real compositional work, not just detail: at the camera's
 * three-quarter angle the backrest sits between the viewer and the figure, and a
 * solid panel would hide the person the scene is about. A woven back is both what an
 * ergonomic chair actually has and what keeps the silhouette readable.
 */
export function Chair({ palette, quality }: { palette: MaterialPalette; quality: SceneQuality }) {
  const spokes = useMemo(
    () =>
      Array.from({ length: SPOKES }, (_, index) => {
        const angle = (index / SPOKES) * Math.PI * 2 + Math.PI / 5
        return {
          angle,
          end: [Math.cos(angle) * SPOKE_LENGTH, 0.045, Math.sin(angle) * SPOKE_LENGTH] as Vec3,
        }
      }),
    [],
  )

  return (
    <group position={[0, 0, CHAIR_Z]}>
      {spokes.map(({ angle, end }) => (
        <group key={angle}>
          <Limb from={[0, 0.06, 0]} to={end} radius={0.022} material={palette.chairShell} />
          {quality === 'high' && (
            <Part material={palette.metal} position={[end[0], 0.028, end[2]]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.018, 12]} />
            </Part>
          )}
        </group>
      ))}

      <Part material={palette.metal} position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.032, 0.038, 0.42, 14]} />
      </Part>
      <Part material={palette.chairShell} position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 14]} />
      </Part>

      <Part material={palette.chairShell} position={[0, SEAT_Y, 0.01]}>
        <boxGeometry args={[0.46, 0.065, 0.44]} />
      </Part>

      {/* Backrest, reclined ~9°. Rotating the whole group keeps the frame, the mesh
          panel, and the headrest on one plane without repeating the maths per part. */}
      <group position={[0, 0.82, 0.22]} rotation={[0.16, 0, 0]}>
        <Part material={palette.chairMesh}>
          <planeGeometry args={[0.4, 0.58]} />
        </Part>

        {/* Frame, built as four bars so the mesh panel reads as suspended in it. */}
        {[
          { position: [-0.21, 0, 0] as Vec3, args: [0.026, 0.62, 0.03] as Vec3 },
          { position: [0.21, 0, 0] as Vec3, args: [0.026, 0.62, 0.03] as Vec3 },
          { position: [0, 0.3, 0] as Vec3, args: [0.44, 0.03, 0.03] as Vec3 },
          { position: [0, -0.3, 0] as Vec3, args: [0.44, 0.03, 0.03] as Vec3 },
        ].map((bar) => (
          <Part key={bar.position.join()} material={palette.chairShell} position={bar.position}>
            <boxGeometry args={bar.args} />
          </Part>
        ))}

        {/* Lumbar support — the pinch point that makes a chair read as ergonomic
            rather than as a dining chair. */}
        <Part material={palette.chairShell} position={[0, -0.16, -0.03]}>
          <boxGeometry args={[0.34, 0.07, 0.035]} />
        </Part>

        <Part material={palette.chairShell} position={[0, 0.4, 0.03]}>
          <boxGeometry args={[0.24, 0.1, 0.05]} />
        </Part>
      </group>

      {[-1, 1].map((side) => (
        <group key={side}>
          <Part material={palette.chairShell} position={[side * 0.27, 0.63, 0.04]}>
            <boxGeometry args={[0.055, 0.028, 0.2]} />
          </Part>
          <Limb
            from={[side * 0.27, 0.5, 0.1]}
            to={[side * 0.27, 0.62, 0.06]}
            radius={0.016}
            material={palette.metal}
          />
        </group>
      ))}
    </group>
  )
}
