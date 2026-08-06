import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { createMaterialPalette } from './lib/materials'
import type { SceneQuality } from './lib/textures'
import type { SceneInput } from './lib/useSceneInput'
import { Chair } from './parts/Chair'
import { DeskLamp } from './parts/DeskLamp'
import { Desk } from './parts/Desk'
import { Deskware } from './parts/Deskware'
import { Engineer } from './parts/Engineer'
import { Keyboard } from './parts/Keyboard'
import { Lighting } from './parts/Lighting'
import { Monitor } from './parts/Monitor'
import { Room } from './parts/Room'
import { WallSwitch } from './parts/WallSwitch'

/** Where the rig sits before any scroll. Slightly off-axis so the desk reads in perspective. */
const BASE_ROTATION = -0.1
/**
 * Total yaw travelled across the hero, in radians — about 23°.
 *
 * Deliberately small. The camera views the figure from behind and to the right, and
 * this range keeps the viewing angle between roughly 130° and 152° off their facing
 * direction: always a back three-quarter. Opening it further would eventually swing
 * round to a face that is not modelled, and would stop reading as the restrained
 * "premium product page" motion the brief asks for.
 */
const SCROLL_ROTATION = 0.4

/**
 * How far a drag can turn the rig either way, in radians — about 26°.
 *
 * Bounded for the same reason `SCROLL_ROTATION` is small: the figure has no face. At
 * rest the camera sits 130° off their facing direction, so this is the most that can
 * be given up before the view swings toward a profile and starts asking for features
 * that were never modelled. It is applied as a soft limit rather than a clamp, so the
 * end of the range is felt as resistance instead of a wall.
 */
const MAX_DRAG_ROTATION = 0.45

/**
 * The canvas occupies the right ~62% of the hero, so its aspect is close to square
 * rather than the 16:9 a default camera distance would assume. At 3m the desk ran off
 * both edges; this pulls back far enough to frame the whole workstation, with the
 * figure on the left third of the canvas and the ultrawide filling the rest.
 */
const CAMERA_HOME = new THREE.Vector3(1.9, 1.68, 4.35)
const CAMERA_TARGET = new THREE.Vector3(0.02, 1.0, 0)

interface WorkstationSceneProps {
  quality: SceneQuality
  animate: boolean
  input: SceneInput
  /** Desk-lamp state, from the persisted store the wall switch writes to. */
  isLightOn: boolean
  onToggleLight: () => void
  /** True until the visitor has used the switch — drives its attract pulse. */
  showSwitchHint: boolean
}

export function WorkstationScene({
  quality,
  animate,
  input,
  isLightOn,
  onToggleLight,
  showSwitchHint,
}: WorkstationSceneProps) {
  const rig = useRef<THREE.Group>(null)
  /**
   * The scroll contribution to yaw, smoothed on its own channel.
   *
   * Kept separate from the drag offset rather than damping one combined target,
   * because the two want opposite feels — scroll trails the page with a long ease,
   * while a drag has to sit under the pointer. Composing them additively is also what
   * lets "return to default" mean "return to the pose scroll asks for" instead of the
   * two inputs fighting over a single value.
   */
  const scrollYaw = useRef(0)

  // One palette for the whole scene. Rebuilt only if the device tier changes, which
  // in practice means a resize across the tablet breakpoint.
  const palette = useMemo(() => createMaterialPalette(quality), [quality])
  useEffect(() => () => palette.dispose(), [palette])

  useFrame((state, delta) => {
    const group = rig.current
    if (!group) return

    const { scroll, pointerX, pointerY, dragRaw } = input.current
    const camera = state.camera

    if (!animate) {
      group.rotation.y = BASE_ROTATION
      camera.position.copy(CAMERA_HOME)
      camera.lookAt(CAMERA_TARGET)
      return
    }

    // MathUtils.damp is frame-rate independent, so the easing feels identical at 60
    // and 144 Hz. A plain lerp with a fixed alpha would not — it would ease roughly
    // twice as fast on a 120 Hz display.
    scrollYaw.current = THREE.MathUtils.damp(
      scrollYaw.current,
      scroll * SCROLL_ROTATION,
      3.2,
      delta,
    )

    // Soft limit: linear near the centre, so the drag tracks the pointer one-to-one
    // through the range a visitor will actually use, then asymptotic at the edges
    // rather than stopping dead against a clamp. `useSceneDrag` owns the raw value,
    // including easing it back to zero on release, so there is nothing to smooth here.
    const dragYaw = MAX_DRAG_ROTATION * Math.tanh(dragRaw / MAX_DRAG_ROTATION)

    // Set outright rather than damped — both channels arrive pre-smoothed, and damping
    // the sum again would put a second lag between the pointer and the model.
    group.rotation.y = BASE_ROTATION + scrollYaw.current + dragYaw

    // Camera parallax, plus a slow pull-back as the hero scrolls away so the scene
    // recedes rather than simply sliding off the top of the viewport.
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      CAMERA_HOME.x + pointerX * 0.22,
      2.4,
      delta,
    )
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      CAMERA_HOME.y - pointerY * 0.13 + scroll * 0.18,
      2.4,
      delta,
    )
    camera.position.z = THREE.MathUtils.damp(camera.position.z, CAMERA_HOME.z + scroll * 0.35, 2.4, delta)
    camera.lookAt(CAMERA_TARGET)
  })

  return (
    <>
      {/* Fog is what makes the room feel like a room: the wall and floor fall away
          into the same value as the page background, so the canvas has no visible edge. */}
      <fog attach="fog" args={['#05070b', 3.4, 9.5]} />
      <Lighting input={input} animate={animate} isLightOn={isLightOn} />

      <group ref={rig} rotation={[0, BASE_ROTATION, 0]}>
        <Room palette={palette} quality={quality} />
        <Desk palette={palette} />
        <Monitor palette={palette} quality={quality} animate={animate} />
        <Keyboard palette={palette} quality={quality} />
        <Deskware palette={palette} quality={quality} animate={animate} />
        <DeskLamp palette={palette} quality={quality} isOn={isLightOn} animate={animate} />
        <Chair palette={palette} quality={quality} />
        <Engineer palette={palette} quality={quality} animate={animate} />
        <WallSwitch
          palette={palette}
          isOn={isLightOn}
          animate={animate}
          onToggle={onToggleLight}
          showHint={showSwitchHint}
        />
      </group>
    </>
  )
}
