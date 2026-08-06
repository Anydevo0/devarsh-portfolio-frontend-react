import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import type { MaterialPalette } from '../lib/materials'
import { Part } from '../lib/primitives'

/**
 * On the back wall, in the clear area up and to the right of the monitor.
 *
 * The x looks too small for "right of the setup" and isn't: the wall sits 1.4m
 * further from the camera than the screen, and the camera is offset to the right, so
 * parallax throws distant points outward. x=0.62 here lands well clear of the
 * monitor's right edge on screen, where x=1.72 fell outside the frustum entirely.
 */
const PLATE: [number, number, number] = [0.5, 1.62, -1.7]

interface WallSwitchProps {
  palette: MaterialPalette
  isOn: boolean
  animate: boolean
  onToggle: () => void
  /** True until the visitor has toggled it once — drives the attract pulse. */
  showHint: boolean
}

/**
 * A wall plate that switches the desk lamp.
 *
 * The control lives in the scene rather than in the interface, so the light behaves
 * like something in the room. That costs discoverability, which the pulsing ring and
 * the etched label buy back — and both stop once the visitor has used it, because a
 * hint that keeps pulsing after it has been understood is just noise.
 *
 * The plate, rocker and label opt out of scene fog. At 6m from the camera the fog
 * would wash them to near the wall colour, and this is the one object in the scene a
 * visitor has to be able to find. Everything else stays fogged.
 *
 * Keyboard and assistive-technology users never reach this — a canvas is not
 * focusable — so `Hero` renders a visually-hidden button bound to the same store.
 */
export function WallSwitch({ palette, isOn, animate, onToggle, showHint }: WallSwitchProps) {
  const rocker = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Sprite>(null)
  const led = useRef<THREE.Mesh>(null)
  const ledGlow = useRef<THREE.Sprite>(null)

  // Restore the cursor if the component unmounts while hovered.
  useEffect(() => () => void delete document.body.dataset.sceneHit, [])

  useFrame((state, delta) => {
    const step = animate ? 1 - Math.exp(-14 * delta) : 1

    // The rocker tips the way a real one does: down when live, up when off.
    if (rocker.current) {
      const target = isOn ? -0.26 : 0.26
      rocker.current.rotation.x += (target - rocker.current.rotation.x) * step
    }

    if (led.current) {
      const material = led.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity += ((isOn ? 5.5 : 0.95) - material.emissiveIntensity) * step
    }

    // Brightness alone stopped separating the two states once the idle LED was raised
    // to something you can actually see: the emissive core clips to white well below
    // the live intensity, so past that point turning it up changes nothing on screen.
    // The bloom carries the difference instead — it grows and roughly triples in
    // strength — which also keeps the green hue visible, since it is the sprite rather
    // than the clipped core that is still coloured at full output.
    if (ledGlow.current) {
      const material = ledGlow.current.material as THREE.SpriteMaterial
      material.opacity += ((isOn ? 0.92 : 0.32) - material.opacity) * step
      const scale = ledGlow.current.scale.x
      const target = isOn ? 0.15 : 0.075
      const next = scale + (target - scale) * step
      ledGlow.current.scale.set(next, next, 1)
    }

    if (halo.current) {
      const material = halo.current.material as THREE.SpriteMaterial
      // Breathes while unused, then settles — but the settled value now tracks the
      // lamp, so the plate itself reports state from across the room instead of
      // leaving that job to a 2mm dot the visitor has to hunt for.
      const settled = isOn ? 0.36 : 0.19
      const target =
        showHint && animate ? 0.52 + Math.sin(state.clock.elapsedTime * 2.2) * 0.26 : settled
      material.opacity += (target - material.opacity) * step
      const scale =
        0.55 + (showHint && animate ? Math.sin(state.clock.elapsedTime * 2.2) * 0.06 : 0)
      halo.current.scale.set(scale, scale, 1)
    }
  })

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    onToggle()
  }

  function handleOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    // A flag rather than `document.body.style.cursor`, because the canvas wrapper now
    // advertises a grab cursor of its own. Two components writing the same inline
    // property means last-writer-wins, and the last writer is whichever pointer event
    // happened to fire second — so precedence is settled in CSS instead (index.css).
    document.body.dataset.sceneHit = 'switch'
  }

  function handleOut() {
    delete document.body.dataset.sceneHit
  }

  return (
    <group position={PLATE}>
      <sprite ref={halo} position={[0, 0, 0.02]} scale={[0.55, 0.55, 1]} dispose={null}>
        <primitive object={palette.switchHalo} attach="material" />
      </sprite>

      {/* One invisible pad takes every pointer event, so hit-testing does not depend
          on which small part of the plate the cursor happens to land on. */}
      <mesh
        position={[0, 0, 0.03]}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        dispose={null}
      >
        <planeGeometry args={[0.3, 0.36]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Part material={palette.switchPlate}>
        <boxGeometry args={[0.15, 0.22, 0.018]} />
      </Part>

      <mesh ref={rocker} position={[0, 0, 0.014]} material={palette.switchRocker} dispose={null}>
        <boxGeometry args={[0.088, 0.14, 0.016]} />
      </mesh>

      {/* In front of the bead, standing in for the bloom pass this scene does not run.
          Clearing the sphere entirely matters: the sprite is additive with depth
          testing on, so parking it inside the LED would let the bead punch a hole
          through its own glow. */}
      <sprite ref={ledGlow} position={[0, -0.082, 0.026]} scale={[0.075, 0.075, 1]} dispose={null}>
        <primitive object={palette.switchLedGlow} attach="material" />
      </sprite>

      <mesh ref={led} position={[0, -0.082, 0.0155]} material={palette.switchLed} dispose={null}>
        <sphereGeometry args={[0.0095, 10, 10]} />
      </mesh>

      {/* Etched label under the plate — a texture rather than DOM, so it stays
          anchored through the rig's rotation with no per-frame projection work. */}
      <Part material={palette.switchLabel} position={[0, -0.185, 0.001]}>
        <planeGeometry args={[0.42, 0.09]} />
      </Part>
    </group>
  )
}
