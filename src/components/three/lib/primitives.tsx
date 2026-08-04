import type { ThreeElements } from '@react-three/fiber'
import { type ReactNode, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import type { GlowTone, MaterialPalette } from './materials'

export type Vec3 = [number, number, number]

/**
 * A mesh that borrows a material from the shared palette.
 *
 * `dispose={null}` opts this mesh out of R3F's automatic teardown. Without it, the
 * StrictMode unmount/remount cycle in development disposes palette materials that
 * the remounted tree is still pointing at, and the scene comes back untextured. The
 * palette owns its own lifecycle instead — see `createMaterialPalette().dispose`.
 */
export function Part({
  material,
  children,
  ...rest
}: { material: THREE.Material; children?: ReactNode } & ThreeElements['mesh']) {
  return (
    <mesh material={material} dispose={null} {...rest}>
      {children}
    </mesh>
  )
}

/**
 * A capsule stretched between two points in space. Limbs, chair spokes, and cable
 * runs are all "connect these two coordinates" problems, so they share one component
 * rather than each solving the orientation maths again.
 */
export function Limb({
  from,
  to,
  radius,
  material,
  segments = 8,
}: {
  from: Vec3
  to: Vec3
  radius: number
  material: THREE.Material
  segments?: number
}) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const direction = end.clone().sub(start)
    const span = direction.length()
    return {
      position: start.clone().add(end).multiplyScalar(0.5),
      // CapsuleGeometry is built along +Y; rotate that axis onto the limb's direction.
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize(),
      ),
      length: span,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[1], from[2], to[0], to[1], to[2]])

  return (
    <mesh position={position} quaternion={quaternion} material={material} dispose={null}>
      <capsuleGeometry args={[radius, Math.max(length - radius * 2, 0.001), 2, segments]} />
    </mesh>
  )
}

/**
 * A camera-facing additive sprite — the scene's stand-in for a bloom pass. Sprites
 * always face the viewer, so a glow stays convincing as the rig rotates.
 *
 * Each instance clones its tone's template material because `opacity` is per-glow
 * and mutating the shared one would dim every other glow using that tone. The clone
 * copies the map by reference, so the only shared-cost texture is still shared.
 */
export function Glow({
  palette,
  tone,
  size,
  opacity = 1,
  position,
}: {
  palette: MaterialPalette
  tone: GlowTone
  size: number | [number, number]
  opacity?: number
  position: Vec3
}) {
  const scale = useMemo<Vec3>(
    () => (Array.isArray(size) ? [size[0], size[1], 1] : [size, size, 1]),
    [size],
  )

  const material = useMemo(() => {
    const clone = palette.glow[tone].clone()
    clone.opacity = opacity
    return clone
  }, [palette, tone, opacity])

  useEffect(() => () => material.dispose(), [material])

  return <sprite position={position} scale={scale} material={material} dispose={null} />
}
