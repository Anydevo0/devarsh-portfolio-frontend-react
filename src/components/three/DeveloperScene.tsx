import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

import type { SceneQuality } from './lib/textures'
import type { SceneInput, SceneInputHandle } from './lib/useSceneInput'
import { WorkstationScene } from './WorkstationScene'

interface DeveloperSceneProps {
  input: SceneInput
  /** Lets the drag listeners outside the Canvas ask for a frame — see `FrameRequests`. */
  setFrameRequest: SceneInputHandle['setFrameRequest']
  quality: SceneQuality
  /** False when the visitor prefers reduced motion — the scene renders one static frame. */
  animate: boolean
  /** False once the hero has scrolled out of view; stops the render loop entirely. */
  active: boolean
  isLightOn: boolean
  onToggleLight: () => void
  showSwitchHint: boolean
}

/**
 * Default export so `React.lazy` can pull the whole three.js dependency into its own
 * chunk. Nothing in this file is reachable until the hero decides to mount it, which
 * keeps three out of the initial bundle the rest of the site loads with.
 */
export default function DeveloperScene({
  input,
  setFrameRequest,
  quality,
  animate,
  active,
  isLightOn,
  onToggleLight,
  showSwitchHint,
}: DeveloperSceneProps) {
  const running = active && animate

  return (
    <Canvas
      // "demand" renders only when something asks for a frame. Reduced-motion visitors
      // and anyone who has scrolled past the hero therefore pay nothing per frame —
      // the GPU goes idle instead of drawing an off-screen scene forever.
      frameloop={running ? 'always' : 'demand'}
      // Capped below the device ratio on purpose. Rendering at a full 2× costs ~30%
      // more fragment work than 1.75× for a difference nobody can see on a scene made
      // of soft gradients and matte surfaces, and the headroom goes to holding frame
      // rate while the page is also scrolling.
      dpr={quality === 'high' ? [1, 1.75] : [1, 1.4]}
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
      {/* Keyed on the light state too: with `frameloop="demand"` — reduced motion, or
          the hero scrolled away — nothing would otherwise redraw after a toggle, and
          the switch would appear to do nothing. */}
      <RenderOnce key={`${running}-${quality}-${isLightOn}`} />
      <FrameRequests publish={setFrameRequest} />
      <WorkstationScene
        quality={quality}
        animate={animate}
        input={input}
        isLightOn={isLightOn}
        onToggleLight={onToggleLight}
        showSwitchHint={showSwitchHint}
      />
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

/**
 * Hands `invalidate` out to the DOM listeners in `useSceneInput`.
 *
 * The drag gesture is read outside the Canvas, where nothing has access to the
 * renderer. Under `frameloop="demand"` — a reduced-motion visitor, or the hero
 * scrolled away — the loop is asleep, so dragging would update the input ref and
 * then sit there with no frame to read it. Kept out of `RenderOnce` because that
 * component is keyed and remounts on every lamp toggle; this one must not.
 */
function FrameRequests({ publish }: { publish: SceneInputHandle['setFrameRequest'] }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    publish(invalidate)
    return () => publish(null)
  }, [publish, invalidate])
  return null
}
