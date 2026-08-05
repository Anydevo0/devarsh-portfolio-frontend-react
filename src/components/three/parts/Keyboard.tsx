import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { DESK_TOP_Y } from './Desk'

import type { MaterialPalette } from '../lib/materials'
import { Glow, Part } from '../lib/primitives'
import type { SceneQuality } from '../lib/textures'

/** One key pitch. Every keycap dimension is expressed in these units, as on a real board. */
const UNIT = 0.0295
const GAP = 0.005
const CAP_SIZE = UNIT - GAP
const ROWS = 5
const COLS = 15
/** Widths in units for the bottom row: modifiers either side of a 6.5u spacebar. */
const BOTTOM_ROW = [1.5, 1.25, 1.25, 6.5, 1.25, 1.25, 2] as const

const KEYBOARD_Z = 0.11
const BASE_Y = DESK_TOP_Y + 0.012
const CAP_Y = BASE_Y + 0.018

/**
 * A 65% mechanical board. Every keycap is one instance of a single mesh, so the whole
 * keyboard — 67 caps — costs one draw call instead of 67. Per-instance matrices carry
 * the non-uniform widths of the bottom row's modifiers and spacebar.
 */
export function Keyboard({ palette, quality }: { palette: MaterialPalette; quality: SceneQuality }) {
  const ref = useRef<THREE.InstancedMesh>(null)

  const keys = useMemo(() => {
    const placed: Array<{ x: number; z: number; width: number }> = []
    const boardWidth = COLS * UNIT

    for (let row = 1; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        placed.push({
          x: (col + 0.5) * UNIT - boardWidth / 2,
          z: (row - (ROWS - 1) / 2) * UNIT,
          width: 1,
        })
      }
    }

    let cursor = 0
    for (const width of BOTTOM_ROW) {
      placed.push({
        x: (cursor + width / 2) * UNIT - boardWidth / 2,
        z: (0 - (ROWS - 1) / 2) * UNIT,
        width,
      })
      cursor += width
    }
    return placed
  }, [])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return

    const dummy = new THREE.Object3D()
    keys.forEach((key, index) => {
      dummy.position.set(key.x, 0, key.z)
      // Widen the cap rather than the pitch, so gaps stay uniform across the board.
      dummy.scale.set((key.width * UNIT - GAP) / CAP_SIZE, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [keys])

  return (
    <group position={[0, 0, KEYBOARD_Z]}>
      <Part material={palette.chassis} position={[0, BASE_Y, 0]}>
        <boxGeometry args={[COLS * UNIT + 0.022, 0.026, ROWS * UNIT + 0.02]} />
      </Part>

      <instancedMesh
        ref={ref}
        args={[undefined, undefined, keys.length]}
        material={palette.keycap}
        position={[0, CAP_Y, 0]}
        dispose={null}
      >
        <boxGeometry args={[CAP_SIZE, 0.011, CAP_SIZE]} />
      </instancedMesh>

      {/* Per-key RGB, read as a spectrum spilling onto the desk rather than a light
          show — three fixed tones across the board's width instead of a hue cycle. */}
      <Glow palette={palette} tone="halo" size={[0.3, 0.16]} opacity={0.5} position={[-0.17, BASE_Y - 0.004, 0.02]} />
      <Glow palette={palette} tone="pulse" size={[0.34, 0.17]} opacity={0.45} position={[0, BASE_Y - 0.004, 0.02]} />
      <Glow palette={palette} tone="beam" size={[0.3, 0.16]} opacity={0.5} position={[0.17, BASE_Y - 0.004, 0.02]} />

      {quality === 'high' && (
        <Glow
          palette={palette}
          tone="pulse"
          size={[0.85, 0.34]}
          opacity={0.18}
          position={[0, BASE_Y - 0.012, 0.05]}
        />
      )}
    </group>
  )
}
