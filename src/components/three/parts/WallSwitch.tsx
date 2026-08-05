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

  // Restore the cursor if the component unmounts while hovered.
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  useFrame((state, delta) => {
    const step = animate ? 1 - Math.exp(-14 * delta) : 1

    // The rocker tips the way a real one does: down when live, up when off.
    if (rocker.current) {
      const target = isOn ? -0.26 : 0.26
      rocker.current.rotation.x += (target - rocker.current.rotation.x) * step
    }

    if (led.current) {
      const material = led.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity += ((isOn ? 3 : 0.35) - material.emissiveIntensity) * step
    }

    if (halo.current) {
      const material = halo.current.material as THREE.SpriteMaterial
      // Breathes while unused, then settles to a faint constant presence.
      const target =
        showHint && animate ? 0.3 + Math.sin(state.clock.elapsedTime * 2.2) * 0.22 : 0.12
      material.opacity += (target - material.opacity) * step
      const scale = 0.55 + (showHint && animate ? Math.sin(state.clock.elapsedTime * 2.2) * 0.06 : 0)
      halo.current.scale.set(scale, scale, 1)
    }
  })

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    onToggle()
  }

  function handleOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    document.body.style.cursor = 'pointer'
  }

  function handleOut() {
    document.body.style.cursor = ''
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

      <mesh ref={led} position={[0, -0.082, 0.014]} material={palette.switchLed} dispose={null}>
        <sphereGeometry args={[0.007, 8, 8]} />
      </mesh>

      {/* Etched label under the plate — a texture rather than DOM, so it stays
          anchored through the rig's rotation with no per-frame projection work. */}
      <Part material={palette.switchLabel} position={[0, -0.185, 0.001]}>
        <planeGeometry args={[0.42, 0.09]} />
      </Part>
    </group>
  )
}
