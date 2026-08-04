import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

import type { SceneQuality } from './lib/textures'
import type { SceneInput } from './lib/useSceneInput'
import { WorkstationScene } from './WorkstationScene'

interface DeveloperSceneProps {
  input: SceneInput
  quality: SceneQuality
  /** False when the visitor prefers reduced motion — the scene renders one static frame. */
  animate: boolean
  /** False once the hero has scrolled out of view; stops the render loop entirely. */
  active: boolean
}

/**
 * Default export so `React.lazy` can pull the whole three.js dependency into its own
 * chunk. Nothing in this file is reachable until the hero decides to mount it, which
 * keeps three out of the initial bundle the rest of the site loads with.
 */
export default function DeveloperScene({ input, quality, animate, active }: DeveloperSceneProps) {
  const running = active && animate

  return (
    <Canvas
      // "demand" renders only when something asks for a frame. Reduced-motion visitors
      // and anyone who has scrolled past the hero therefore pay nothing per frame —
      // the GPU goes idle instead of drawing an off-screen scene forever.
      frameloop={running ? 'always' : 'demand'}
      dpr={quality === 'high' ? [1, 2] : [1, 1.5]}
      gl={{
        antialias: quality === 'high',
        powerPreference: 'high-performance',
        alpha: true,
      }}
      camera={{ position: [1.45, 1.55, 3], fov: 34, near: 0.1, far: 20 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <RenderOnce key={`${running}-${quality}`} />
      <WorkstationScene quality={quality} animate={animate} input={input} />
    </Canvas>
  )
}

/**
 * Forces a single frame whenever the loop mode changes. Without this, switching to
 * "demand" would freeze on whatever was last drawn — including a blank first frame
 * for a reduced-motion visitor, who would otherwise see nothing at all.
 */
function RenderOnce() {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    invalidate()
  }, [invalidate])
  return null
}
