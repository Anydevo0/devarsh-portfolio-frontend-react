import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

import type { SceneInput } from '../lib/useSceneInput'

/**
 * Four practical lights, each motivated by something visible in the scene: the
 * monitor, the wall wash, and the light bar over the desk. Nothing is lit from an
 * arbitrary studio position, which is why the room reads as a room. The desk lamp is
 * the fifth and owns its own light — see `DeskLamp`.
 *
 * No shadow maps. Contact is implied by the painted floor pools in `Room`, which
 * costs two transparent quads instead of a depth pass per light.
 */
export function Lighting({
  input,
  animate,
  isLightOn,
}: {
  input: SceneInput
  animate: boolean
  isLightOn: boolean
}) {
  const halo = useRef<THREE.PointLight>(null)
  const beam = useRef<THREE.PointLight>(null)
  const bar = useRef<THREE.PointLight>(null)

  useFrame((_, delta) => {
    // The light bar over the desk dims with the lamp but never goes fully dark: with
    // both off the scene would be lit by the monitor alone and the figure's right
    // side would disappear. Switching off should change the mood, not empty the room.
    if (bar.current) {
      const step = animate ? 1 - Math.exp(-8 * delta) : 1
      const target = isLightOn ? 1.1 : 0.22
      bar.current.intensity += (target - bar.current.intensity) * step
    }

    if (!animate) return
    const { pointerX, pointerY } = input.current
    // The two accent lights track the cursor a little, so moving the mouse changes
    // how the figure is rimmed — the cheapest way to make a static scene feel
    // responsive without moving anything the viewer can name.
    if (halo.current) {
      halo.current.position.x += (-1.9 + pointerX * 0.7 - halo.current.position.x) * delta * 2
      halo.current.position.y += (1.95 - pointerY * 0.35 - halo.current.position.y) * delta * 2
    }
    if (beam.current) {
      beam.current.position.x += (2.1 + pointerX * 0.6 - beam.current.position.x) * delta * 2
    }
  })

  return (
    <>
      <ambientLight intensity={0.62} color="#364462" />

      {/* The monitor. Brightest source in the scene and the only one in front of the
          figure, so it draws the rim that separates them from the dark room. */}
      <pointLight position={[0, 1.16, 0.1]} intensity={4.2} distance={3.8} decay={2} color="#9fc4ff" />

      {/* A dim kicker behind and above the figure, pointed at their shoulders. Without
          it the head and back merge into the wall from the camera's angle — this is
          the light that actually makes the person legible. */}
      <pointLight position={[-0.9, 2.05, 2.1]} intensity={1.5} distance={4} decay={2} color="#93a7d8" />

      <pointLight
        ref={halo}
        position={[-1.9, 1.95, 1.5]}
        intensity={2.6}
        distance={7}
        decay={2}
        color="#8b5cf6"
      />
      {/* Pulled back and dimmed from where it started. Every other surface in the
          scene is dark enough to only take a rim from this, but the ceramic mug is
          pale and was acting as a colour probe — at the old intensity it read as a
          teal plastic cup rather than a lit white one. */}
      <pointLight
        ref={beam}
        position={[2.45, 1.55, 1.2]}
        intensity={0.95}
        distance={5.2}
        decay={2}
        color="#22d3ee"
      />

      <pointLight
        ref={bar}
        position={[0, 1.4, -0.05]}
        intensity={1.1}
        distance={1.9}
        decay={2}
        color="#ffb27a"
      />
    </>
  )
}
