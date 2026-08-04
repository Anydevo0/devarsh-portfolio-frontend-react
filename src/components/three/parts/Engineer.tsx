import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

import { CHAIR_Z } from './Chair'

import type { MaterialPalette } from '../lib/materials'
import { Limb, Part, type Vec3 } from '../lib/primitives'
import type { SceneQuality } from '../lib/textures'

/**
 * The seated figure, built from capsules and spheres around one origin at the hips.
 *
 * Everything below is in hip-local space, which is what makes the proportions
 * legible as numbers: the shoulders are 0.38 up and 0.06 forward, the hands reach
 * 0.62 forward to meet the keyboard. Stylised rather than anatomical — a slightly
 * large head and a simplified hair silhouette, read from behind and three-quarters,
 * which is also why the face is never modelled: at this camera range it would only
 * ever be uncanny.
 */
const HIP_ORIGIN: Vec3 = [0, 0.53, CHAIR_Z - 0.02]

const SHOULDER_Y = 0.38
const SHOULDER_Z = -0.06
const SHOULDER_X = 0.185
/** Keyboard surface, expressed in hip-local space — where the hands have to land. */
const HAND: Vec3 = [0.105, 0.245, -0.645]

interface EngineerProps {
  palette: MaterialPalette
  quality: SceneQuality
  animate: boolean
}

export function Engineer({ palette, quality, animate }: EngineerProps) {
  const bodyRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!animate || !bodyRef.current) return
    // Breathing. Small enough to be felt rather than seen — a resting adult at a desk
    // moves a few millimetres, and anything larger reads as a bobbing cartoon.
    bodyRef.current.position.y = HIP_ORIGIN[1] + Math.sin(state.clock.elapsedTime * 0.9) * 0.004
  })

  return (
    <group ref={bodyRef} position={HIP_ORIGIN}>
      <Part material={palette.denim} position={[0, 0, 0.03]}>
        <boxGeometry args={[0.33, 0.17, 0.3]} />
      </Part>

      <Limb
        from={[0, 0.05, 0.02]}
        to={[0, SHOULDER_Y - 0.02, SHOULDER_Z]}
        radius={0.148}
        material={palette.top}
        segments={12}
      />
      {/* A horizontal capsule across the shoulders — this one part is what stops the
          torso reading as a bottle and gives the figure an adult silhouette. */}
      <Limb
        from={[-SHOULDER_X, SHOULDER_Y, SHOULDER_Z]}
        to={[SHOULDER_X, SHOULDER_Y, SHOULDER_Z]}
        radius={0.078}
        material={palette.top}
        segments={12}
      />

      <Head palette={palette} quality={quality} animate={animate} />

      <Arm side={-1} phase={0} palette={palette} animate={animate} />
      <Arm side={1} phase={2.4} palette={palette} animate={animate} />

      {[-1, 1].map((side) => (
        <group key={side}>
          <Limb
            from={[side * 0.11, -0.01, 0.02]}
            to={[side * 0.13, -0.05, -0.32]}
            radius={0.078}
            material={palette.denim}
          />
          <Limb
            from={[side * 0.13, -0.05, -0.32]}
            to={[side * 0.13, -0.44, -0.35]}
            radius={0.055}
            material={palette.denim}
          />
          <Part material={palette.headphone} position={[side * 0.13, -0.475, -0.42]}>
            <boxGeometry args={[0.095, 0.05, 0.21]} />
          </Part>
        </group>
      ))}
    </group>
  )
}

/** Head, hair and headphones. Grouped so one micro-rotation moves all three together. */
function Head({
  palette,
  quality,
  animate,
}: {
  palette: MaterialPalette
  quality: SceneQuality
  animate: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  const detail = quality === 'high' ? 20 : 10

  useFrame((state) => {
    if (!animate || !ref.current) return
    const t = state.clock.elapsedTime
    // Two incommensurate frequencies, so the idle never visibly loops.
    ref.current.rotation.y = Math.sin(t * 0.34) * 0.07
    ref.current.rotation.x = Math.sin(t * 0.53) * 0.028
  })

  return (
    <group ref={ref} position={[0, SHOULDER_Y, SHOULDER_Z]}>
      <Limb
        from={[0, 0.01, 0]}
        to={[0, 0.08, -0.018]}
        radius={0.043}
        material={palette.skin}
        segments={10}
      />

      <Part material={palette.skin} position={[0, 0.185, -0.025]} scale={[1, 1.07, 1.02]}>
        <sphereGeometry args={[0.113, detail, detail]} />
      </Part>

      {/* Hair as one slightly oversized shell pushed back off the brow, plus tufts.
          Read from behind it is a full silhouette; from three-quarters the shell's
          front edge reads as a fringe. */}
      <Part material={palette.hair} position={[0, 0.193, -0.012]} scale={[1.03, 1.02, 1.06]}>
        <sphereGeometry args={[0.121, detail, detail]} />
      </Part>

      {quality === 'high' &&
        [
          { position: [0.05, 0.3, 0.04] as Vec3, rotation: [0.5, 0, -0.3] as Vec3 },
          { position: [-0.06, 0.29, 0.03] as Vec3, rotation: [0.6, 0, 0.35] as Vec3 },
          { position: [0, 0.27, 0.08] as Vec3, rotation: [0.9, 0, 0] as Vec3 },
        ].map((tuft) => (
          <Part
            key={tuft.position.join()}
            material={palette.hair}
            position={tuft.position}
            rotation={tuft.rotation}
          >
            <coneGeometry args={[0.032, 0.11, 6]} />
          </Part>
        ))}

      {/* Nape — the hair that falls onto the collar. */}
      <Part material={palette.hair} position={[0, 0.11, 0.075]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.13, 0.09, 0.045]} />
      </Part>

      <Part material={palette.headphone} position={[0, 0.2, -0.02]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.132, 0.014, 6, 20, Math.PI]} />
      </Part>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Part
            material={palette.headphone}
            position={[side * 0.125, 0.185, -0.022]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.047, 0.047, 0.028, 14]} />
          </Part>
          <Part material={palette.accentBeam} position={[side * 0.141, 0.185, -0.022]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.004, 8]} />
          </Part>
        </group>
      ))}
    </group>
  )
}

/**
 * One arm, from the shoulder to a hand resting on the keyboard.
 *
 * The whole arm is a group hinged at the shoulder, so the typing idle is a single
 * rotation rather than per-frame re-solved limb geometry — the capsules keep their
 * baked transforms and nothing is rebuilt on the CPU.
 */
function Arm({
  side,
  phase,
  palette,
  animate,
}: {
  side: 1 | -1
  phase: number
  palette: MaterialPalette
  animate: boolean
}) {
  const ref = useRef<THREE.Group>(null)
  const handRef = useRef<THREE.Mesh>(null)

  const shoulder: Vec3 = [side * SHOULDER_X, SHOULDER_Y, SHOULDER_Z]
  const elbow: Vec3 = [side * 0.04, -0.13, -0.24]
  const wrist: Vec3 = [side * (HAND[0] - SHOULDER_X), HAND[1] - SHOULDER_Y, HAND[2] - SHOULDER_Z]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!animate) return
    if (ref.current) {
      ref.current.rotation.x = Math.sin(t * 6.1 + phase) * 0.009
    }
    if (handRef.current) {
      // Keystrokes: a fast, shallow bob with a hitch, so the two hands never lock
      // into a visible unison.
      const strike = Math.sin(t * 7.3 + phase) + Math.sin(t * 4.1 + phase * 1.7) * 0.4
      handRef.current.position.y = wrist[1] + strike * 0.006
    }
  })

  return (
    <group ref={ref} position={shoulder}>
      <Limb from={[0, 0, 0]} to={elbow} radius={0.058} material={palette.top} segments={10} />
      <Limb from={elbow} to={wrist} radius={0.046} material={palette.skin} segments={10} />
      {/* Cuff, covering the seam where the sleeve meets the forearm. */}
      <Part material={palette.top} position={[elbow[0], elbow[1], elbow[2]]}>
        <sphereGeometry args={[0.06, 10, 10]} />
      </Part>
      <mesh
        ref={handRef}
        material={palette.skin}
        position={wrist}
        scale={[1, 0.6, 1.3]}
        dispose={null}
      >
        <sphereGeometry args={[0.046, 10, 10]} />
      </mesh>
    </group>
  )
}
