import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

import { DESK_TOP_Y } from './Desk'

import type { MaterialPalette } from '../lib/materials'
import { Glow, Part } from '../lib/primitives'
import type { SceneQuality } from '../lib/textures'

interface MonitorProps {
  palette: MaterialPalette
  quality: SceneQuality
  animate: boolean
}

/** Curvature radius of the panel. Larger = flatter; 2.2m matches a real 1000R-ish ultrawide. */
const CURVE_RADIUS = 2.2
/** Arc swept by the visible panel, in radians. radius × arc = 1.67m of screen. */
const SCREEN_ARC = 0.76
const SCREEN_HEIGHT = 0.62
/** Where the centre of the panel sits in world space. */
const SCREEN_Z = -0.34
const SCREEN_Y = 1.14

/**
 * The ultrawide. The panel is a slice of a cylinder rather than a flat plane, so it
 * genuinely curves the way the real thing does — which is what sells the perspective
 * once the rig rotates the scene off-axis.
 *
 * Which *way* it curves is the subtle part, and it was wrong. A curved monitor is
 * concave: it wraps around the person sitting at it, so the centre of curvature is on
 * *their* side of the glass. Putting the cylinder's axis behind the panel — the
 * obvious reading of "push the group back by the radius" — builds the opposite solid,
 * one that bulges out at the viewer, and the error is invisible dead-on and obvious
 * the moment the scene turns. The axis therefore sits in front of the panel, at
 * `SCREEN_Z + CURVE_RADIUS`, and the visible slice is the far side of that cylinder,
 * centred on θ = π.
 *
 * Rendering the far side means the viewer is looking at the surface's *inside*, whose
 * normals point away from them — so the panel and its bezel need `BackSide` materials,
 * and the screen texture needs mirroring back (see `materials`). The bezel is a second
 * slice at a slightly *larger* radius, which is what now puts it behind the panel
 * rather than in front of it.
 */
export function Monitor({ palette, quality, animate }: MonitorProps) {
  const radialSegments = quality === 'high' ? 48 : 20
  const screenRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (!animate) return
    // Scrolls by moving the sampled region of the texture — a uniform update, so the
    // canvas behind it is never redrawn and an animated screen costs nothing on the
    // CPU. Reached through the mesh ref rather than through the palette prop: the
    // texture is shared, and this is the one place allowed to move it.
    const map = (screenRef.current?.material as THREE.MeshBasicMaterial | undefined)?.map
    if (map) map.offset.y -= delta * 0.018
  })

  return (
    <group>
      {/* Cylinder slices are centred on their own axis, so the group sits a radius in
          *front* of the panel and the visible arc is taken from the far side, at θ = π.
          That is what makes the surface concave to the viewer. */}
      <group position={[0, SCREEN_Y, SCREEN_Z + CURVE_RADIUS]}>
        <Part material={palette.screenShell}>
          <cylinderGeometry
            args={[
              CURVE_RADIUS + 0.04,
              CURVE_RADIUS + 0.04,
              SCREEN_HEIGHT + 0.075,
              radialSegments,
              1,
              true,
              Math.PI - (SCREEN_ARC + 0.045) / 2,
              SCREEN_ARC + 0.045,
            ]}
          />
        </Part>

        <Part material={palette.screen} ref={screenRef}>
          <cylinderGeometry
            args={[
              CURVE_RADIUS,
              CURVE_RADIUS,
              SCREEN_HEIGHT,
              radialSegments,
              1,
              true,
              Math.PI - SCREEN_ARC / 2,
              SCREEN_ARC,
            ]}
          />
        </Part>
      </group>

      {/* Stand: a flat foot and a slim column, so the desk stays visually uncluttered. */}
      <Part material={palette.chassis} position={[0, DESK_TOP_Y + 0.008, SCREEN_Z - 0.04]}>
        <boxGeometry args={[0.36, 0.016, 0.18]} />
      </Part>
      <Part material={palette.metal} position={[0, DESK_TOP_Y + 0.13, SCREEN_Z - 0.04]}>
        <boxGeometry args={[0.055, 0.26, 0.045]} />
      </Part>
      <Part material={palette.chassis} position={[0, SCREEN_Y - 0.14, SCREEN_Z - 0.055]}>
        <boxGeometry args={[0.16, 0.13, 0.05]} />
      </Part>

      {/* Fake bloom. The halo behind the panel throws the monitor's silhouette off the
          wall; the one in front is what a bright screen does to a camera lens. */}
      <Glow
        palette={palette}
        tone="screen"
        size={[3.2, 1.7]}
        opacity={0.3}
        position={[0, SCREEN_Y, SCREEN_Z - 0.5]}
      />
      <Glow
        palette={palette}
        tone="screen"
        size={[2.4, 1.1]}
        opacity={0.14}
        position={[0, SCREEN_Y, SCREEN_Z + 0.22]}
      />
    </group>
  )
}
