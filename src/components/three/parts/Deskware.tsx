import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { DESK_TOP_Y } from './Desk'

import type { MaterialPalette } from '../lib/materials'
import { Glow, Part } from '../lib/primitives'
import type { SceneQuality } from '../lib/textures'

const MUG_X = 0.62
const MUG_Z = 0.16
const MUG_HEIGHT = 0.095

interface DeskwareProps {
  palette: MaterialPalette
  quality: SceneQuality
  animate: boolean
}

/**
 * What's on the desk besides the machine: a mug, and a monitor light bar. Two objects
 * is the whole point — the brief calls for a minimal workspace, and every extra prop
 * would compete with the figure for attention.
 */
export function Deskware({ palette, quality, animate }: DeskwareProps) {
  return (
    <group>
      <group position={[MUG_X, DESK_TOP_Y + MUG_HEIGHT / 2, MUG_Z]}>
        <Part material={palette.mug}>
          <cylinderGeometry args={[0.042, 0.036, MUG_HEIGHT, 18]} />
        </Part>
        {/* Coffee, sunk just below the rim and dark enough to catch the screen light. */}
        <Part material={palette.headphone} position={[0, MUG_HEIGHT / 2 - 0.012, 0]}>
          <cylinderGeometry args={[0.037, 0.037, 0.004, 18]} />
        </Part>
        <Part material={palette.mug} position={[0.052, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.024, 0.007, 6, 14]} />
        </Part>
        {quality === 'high' && animate && <Steam />}
      </group>

      {/* Monitor light bar — clamped over the top bezel, throwing warm light down onto
          the desk. It is the one warm source in an otherwise entirely cool scene, which
          is what stops the palette reading as monochrome blue. */}
      <group position={[0, 1.48, -0.36]}>
        <Part material={palette.chassis}>
          <boxGeometry args={[0.62, 0.035, 0.05]} />
        </Part>
        <Part material={palette.chassis} position={[0, -0.035, 0.035]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.1, 0.05, 0.03]} />
        </Part>
        <Glow palette={palette} tone="warm" size={[1.5, 0.9]} opacity={0.22} position={[0, -0.34, 0.3]} />
      </group>
    </group>
  )
}

/**
 * Three wisps rising from the mug on independent sine paths, fading as they climb.
 * Sprites rather than geometry so they always face the camera through the rig's
 * rotation, and they are the one thing dropped entirely on the low-quality tier.
 */
function Steam() {
  const ref = useRef<THREE.Group>(null)

  // One texture, one material per wisp — each wisp fades independently, so they
  // cannot share a material, but the texture behind them is allocated once.
  const { texture, materials, wisps } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,0.5)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const map = new THREE.CanvasTexture(canvas)

    return {
      texture: map,
      materials: [0, 1, 2].map(
        () =>
          new THREE.SpriteMaterial({
            map,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
          }),
      ),
      wisps: [0, 1, 2].map((index) => ({ offset: index * 0.9, drift: index % 2 === 0 ? 1 : -1 })),
    }
  }, [])

  useEffect(() => {
    return () => {
      for (const material of materials) material.dispose()
      texture.dispose()
    }
  }, [materials, texture])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.children.forEach((child, index) => {
      const wisp = wisps[index]
      if (!wisp) return
      // Each wisp climbs 0.16 over ~2.7s, then wraps back to the rim.
      const rise = ((t * 0.36 + wisp.offset) % 2.7) / 2.7
      child.position.y = rise * 0.16
      child.position.x = Math.sin(rise * 4 + wisp.offset) * 0.018 * wisp.drift
      const sprite = child as THREE.Sprite
      // Fade in off the surface, out at the top — never a hard pop at either end.
      sprite.material.opacity = Math.sin(rise * Math.PI) * 0.5
      const scale = 0.05 + rise * 0.07
      sprite.scale.set(scale, scale, 1)
    })
  })

  return (
    <group ref={ref} position={[0, MUG_HEIGHT / 2, 0]}>
      {wisps.map((wisp, index) => (
        <sprite key={wisp.offset} material={materials[index]} dispose={null} />
      ))}
    </group>
  )
}
