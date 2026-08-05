import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { DESK_TOP_Y } from './Desk'

import type { MaterialPalette } from '../lib/materials'
import { Limb, Part } from '../lib/primitives'
import type { SceneQuality } from '../lib/textures'

/** Base of the lamp, back-right of the desk — clear of the keyboard and the figure. */
const LAMP_X = 0.98
const LAMP_Z = -0.2
/**
 * Where the shade ends up, and therefore where the warm pool is centred.
 *
 * Pushed out to z=0.26 — forward of the mug at z=0.16 rather than behind it. Sitting
 * back near the monitor, the lamp lit the mug's far side while the face turned toward
 * the camera stayed in ambient, so the one pale object on the desk read as dark. A
 * swing-arm lamp leaning out over the work is both the fix and the realistic pose.
 */
const HEAD: [number, number, number] = [0.63, DESK_TOP_Y + 0.42, 0.26]

interface DeskLampProps {
  palette: MaterialPalette
  quality: SceneQuality
  /** Target state. Brightness is interpolated toward it, never snapped. */
  isOn: boolean
  animate: boolean
}

/**
 * An articulated desk lamp, and the scene's only switchable light.
 *
 * Placed so its cone falls across the mug, the near end of the keyboard, and the
 * figure's right side — the three things that read as warm when it is on and go
 * blue-grey when it is off. The monitor remains lit either way, so switching the
 * lamp off dims the room rather than emptying it.
 *
 * Brightness is eased in `useFrame` rather than driven by React state, so toggling
 * costs one render for the switch and nothing per frame thereafter.
 */
export function DeskLamp({ palette, quality, isOn, animate }: DeskLampProps) {
  const lampLight = useRef<THREE.PointLight>(null)
  const bounce = useRef<THREE.PointLight>(null)
  const shade = useRef<THREE.Mesh>(null)
  const bulbGlow = useRef<THREE.Sprite>(null)
  const poolGlow = useRef<THREE.Sprite>(null)

  useFrame((_, delta) => {
    const target = isOn ? 1 : 0
    // Frame-rate independent easing; ~0.35s to settle either way. Reduced-motion
    // visitors get the end state immediately, since this is a state change rather
    // than an ambient animation.
    const step = animate ? 1 - Math.exp(-8 * delta) : 1

    if (lampLight.current) {
      lampLight.current.intensity += (target * 6.5 - lampLight.current.intensity) * step
    }
    if (bounce.current) {
      bounce.current.intensity += (target * 1.6 - bounce.current.intensity) * step
    }
    if (shade.current) {
      const material = shade.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity += (target * 2.2 - material.emissiveIntensity) * step
    }
    for (const [sprite, peak] of [
      [bulbGlow, 0.85],
      [poolGlow, 0.5],
    ] as const) {
      if (sprite.current) {
        const material = sprite.current.material as THREE.SpriteMaterial
        material.opacity += (target * peak - material.opacity) * step
      }
    }
  })

  return (
    <group>
      <group position={[LAMP_X, DESK_TOP_Y, LAMP_Z]}>
        <Part material={palette.metal} position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.075, 0.085, 0.024, 20]} />
        </Part>
        {/* Two arm segments with a joint, so it reads as adjustable rather than a post. */}
        <Limb from={[0, 0.02, 0]} to={[-0.1, 0.34, 0.04]} radius={0.011} material={palette.metal} />
        <Limb
          from={[-0.1, 0.34, 0.04]}
          to={[-0.35, 0.42, 0.46]}
          radius={0.0095}
          material={palette.metal}
        />
        <Part material={palette.metal} position={[-0.1, 0.34, 0.04]}>
          <sphereGeometry args={[0.018, 10, 10]} />
        </Part>
      </group>

      {/* Shade, tipped down toward the desk. Open-ended so the lit interior shows. */}
      <group position={HEAD} rotation={[0.85, 0.36, 0]}>
        <mesh ref={shade} material={palette.lampShade} dispose={null}>
          <coneGeometry args={[0.082, 0.11, 22, 1, true]} />
        </mesh>
        <Part material={palette.chassis} position={[0, 0.056, 0]}>
          <sphereGeometry args={[0.026, 12, 12]} />
        </Part>
      </group>

      {/* The light itself, just below the shade's mouth. Range is deliberately short —
          it should pool on the desk, not relight the whole room. */}
      <pointLight
        ref={lampLight}
        position={[HEAD[0] - 0.02, HEAD[1] - 0.08, HEAD[2] + 0.03]}
        intensity={0}
        distance={1.9}
        decay={2}
        color="#ffc489"
      />
      {/* A second, wider and weaker source standing in for bounce off the desktop, so
          the underside of the mug and the figure's arm pick up some warmth too. */}
      <pointLight
        ref={bounce}
        position={[0.46, DESK_TOP_Y + 0.14, 0.3]}
        intensity={0}
        distance={1.6}
        decay={2}
        color="#ffb277"
      />

      <sprite
        ref={bulbGlow}
        position={[HEAD[0] - 0.02, HEAD[1] - 0.07, HEAD[2] + 0.03]}
        scale={[0.34, 0.34, 1]}
        dispose={null}
      >
        <primitive object={palette.lampBulbGlow} attach="material" />
      </sprite>

      {quality === 'high' && (
        <sprite
          ref={poolGlow}
          position={[0.5, DESK_TOP_Y + 0.02, 0.24]}
          scale={[1.2, 0.52, 1]}
          dispose={null}
        >
          <primitive object={palette.lampPoolGlow} attach="material" />
        </sprite>
      )}
    </group>
  )
}
