import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { createMaterialPalette } from './lib/materials'
import { BASE_ROTATION, YAW_MAX, YAW_MIN, YAW_OVERSHOOT } from './lib/rigLimits'
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
/** How much the cursor alone nudges the rig. Small — it is parallax, not control. */
const POINTER_ROTATION = 0.045

/**
 * How tightly the rig and camera follow the pose while it is easing home.
 *
 * High, because the shape of the return is decided in `useSceneInput` and this only has
 * to keep up with it. Damping at the ambient 3.2 instead put a second lag on top of an
 * already-eased value and turned a 0.4s return into nearly a second of drift.
 */
const RETURN_TRACKING = 12

/**
 * The drag sweep, and the one number in this file worth arguing about.
 *
 * Sign, derived rather than guessed. three.js rotates a point (x, z) about +Y to
 * (x·cosθ + z·sinθ, −x·sinθ + z·cosθ). The camera sits out at +x/+z looking back at
 * the origin, so the face of the rig nearest the viewer is the one at +z. Take a point
 * there, (0, 0, r): its screen-x after the rotation is r·sinθ. Increasing θ therefore
 * swings the near side toward screen-right — the model turning to *its* right. The
 * gesture reads as orbiting the viewpoint rather than shoving the object, so a drag
 * right has to turn the model left: rightward travel subtracts. That inversion lives
 * in `useSceneInput`, which is the only thing that writes `dragYaw`.
 *
 * The range is anchored on the back of the figure, not on the front. With the camera
 * where it is, the resting pose sits about 156° off the figure's facing direction —
 * a back three-quarter — and dead-behind is another 18° round, at θ ≈ 0.31. Centring
 * ~96° of travel on *that* keeps both ends roughly 48° off the spine, which is as far
 * as this model can be turned before the trouble starts: the face is deliberately not
 * modelled (see `Engineer`), so anything approaching a profile puts a blank head on
 * screen. Verified in a browser rather than reasoned about — at 60° the head reads as
 * featureless, at 30° it still reads as a person seen from behind.
 *
 * The resting pose is deliberately *not* the midpoint. It is where the hero has always
 * sat, and moving it to centre the range would have changed the page's first frame.
 *
 * Vertical drag orbits the camera by ±16° instead of pitching the rig. Tilting the
 * group itself is what the cursor parallax does, and it is fine at the 0.8° it uses —
 * but at 16° it swings the floor and the back wall through frame, because this is a
 * room rather than an object on a turntable. Moving the camera along a vertical arc
 * changes the viewing angle and leaves the room level.
 *
 * The numbers themselves are in `lib/rigLimits`, which the hero also reads.
 */

/**
 * The canvas occupies the right ~62% of the hero, so its aspect is close to square
 * rather than the 16:9 a default camera distance would assume. At 3m the desk ran off
 * both edges; this pulls back far enough to frame the whole workstation, with the
 * figure on the left third of the canvas and the ultrawide filling the rest.
 */
const CAMERA_HOME = new THREE.Vector3(1.9, 1.68, 4.35)
const CAMERA_TARGET = new THREE.Vector3(0.02, 1.0, 0)

/**
 * `CAMERA_HOME` re-expressed as a polar offset from the target, so the vertical drag
 * can move along an arc instead of straight up. Precomputed once: these are three
 * trig calls that would otherwise run every frame to produce the same answer.
 */
const ORBIT_RADIUS = CAMERA_HOME.distanceTo(CAMERA_TARGET)
const ORBIT_AZIMUTH = Math.atan2(CAMERA_HOME.x - CAMERA_TARGET.x, CAMERA_HOME.z - CAMERA_TARGET.z)
const ORBIT_ELEVATION = Math.asin((CAMERA_HOME.y - CAMERA_TARGET.y) / ORBIT_RADIUS)
/**
 * Absolute floor and ceiling for the camera's elevation. The floor is what stops a
 * downward drag from burrowing under the desk and looking at the scene through it;
 * the ceiling stops the camera climbing far enough to look over the monitor's top
 * edge, where the room runs out of ceiling to be seen against.
 */
const ELEVATION_MIN = 0
const ELEVATION_MAX = 0.44

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

  // One palette for the whole scene. Rebuilt only if the device tier changes, which
  // in practice means a resize across the tablet breakpoint.
  const palette = useMemo(() => createMaterialPalette(quality), [quality])
  useEffect(() => () => palette.dispose(), [palette])

  useFrame((state, delta) => {
    const group = rig.current
    if (!group) return

    const { scroll, pointerX, pointerY, dragYaw, dragPitch, isDragging, isReturning } =
      input.current
    const camera = state.camera
    // Ambient motion, and only while the scene is still ambient. It stands down while
    // the visitor is posing the rig and stays down until it is home again — a parallax
    // nudge arriving mid-return would pull against the thing trying to settle. Once the
    // rig is back at rest this resumes, so scrolling still turns the scene afterwards.
    const driven = isDragging || isReturning
    const ambientYaw = driven ? 0 : scroll * SCROLL_ROTATION + pointerX * POINTER_ROTATION
    const ambientPitch = driven ? 0 : pointerY * 0.014

    // Where the camera sits for a given elevation, as a plain function of the polar
    // constants above. Writes straight into the camera to keep the loop allocation-free.
    function placeCamera(elevation: number, parallaxX: number, parallaxY: number, lift: number) {
      const clamped = THREE.MathUtils.clamp(elevation, ELEVATION_MIN, ELEVATION_MAX)
      const horizontal = ORBIT_RADIUS * Math.cos(clamped)
      return {
        x: CAMERA_TARGET.x + Math.sin(ORBIT_AZIMUTH) * horizontal + parallaxX,
        y: CAMERA_TARGET.y + ORBIT_RADIUS * Math.sin(clamped) + parallaxY + lift,
        z: CAMERA_TARGET.z + Math.cos(ORBIT_AZIMUTH) * horizontal,
      }
    }

    if (!animate) {
      // Drag still works here, and deliberately without damping: reduced motion asks
      // for no animation, not for no controls. Following the pointer exactly is the
      // most literal reading of the request — nothing moves that the visitor is not
      // moving with their own hand, and there is no settle after they let go, which
      // also means `frameloop="demand"` needs exactly one frame per pointer event.
      group.rotation.y = THREE.MathUtils.clamp(dragYaw, YAW_MIN, YAW_MAX)
      const home = placeCamera(ORBIT_ELEVATION + dragPitch, 0, 0, 0)
      camera.position.set(home.x, home.y, home.z)
      camera.lookAt(CAMERA_TARGET)
      return
    }

    // MathUtils.damp is frame-rate independent, so the easing feels identical at 60
    // and 144 Hz. A plain lerp with a fixed alpha would not — it would ease roughly
    // twice as fast on a 120 Hz display.
    // Ambient yaw writes into the same value the drag does, so clamping the drag alone
    // would not be a guarantee — small contributions can still add up past the end of
    // the arc. The clamp is applied to the sum, which is the only value that reaches
    // the rig. `dragYaw` may sit slightly outside the range while the visitor is
    // stretching the rubber band, so the stops open by exactly that much and no more.
    const stretch = isDragging ? YAW_OVERSHOOT : 0
    const targetRotation = THREE.MathUtils.clamp(
      dragYaw + ambientYaw,
      YAW_MIN - stretch,
      YAW_MAX + stretch,
    )
    // Pinned while the pointer is down, eased once it is not. Damping a value the
    // visitor is actively holding is what made the model trail their hand; the whole
    // point of easing is to smooth motion they are *not* driving.
    //
    // The return is already an ease-out by the time it arrives here — `useSceneInput`
    // shapes it — so this tracks it tightly rather than damping it a second time.
    // Leaving it at the ambient rate stretched a 0.4s return into nearly a second and
    // lost the shape of the curve underneath.
    group.rotation.y = isDragging
      ? targetRotation
      : THREE.MathUtils.damp(group.rotation.y, targetRotation, isReturning ? RETURN_TRACKING : 3.2, delta)
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, ambientPitch, 3.2, delta)

    // Camera parallax, plus a slow pull-back as the hero scrolls away so the scene
    // recedes rather than simply sliding off the top of the viewport. The drag's
    // elevation rides on the same arc, so the two compose without fighting.
    // Cursor parallax on the camera stops with the rest of the ambient motion; the
    // scroll lift does not, because that one is the scene receding as the hero leaves
    // rather than the model appearing to move by itself.
    const home = placeCamera(
      ORBIT_ELEVATION + dragPitch,
      driven ? 0 : pointerX * 0.22,
      driven ? 0 : -pointerY * 0.13,
      scroll * 0.18,
    )
    const cameraTracking = isReturning ? RETURN_TRACKING : 2.4
    camera.position.x = THREE.MathUtils.damp(camera.position.x, home.x, cameraTracking, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, home.y, cameraTracking, delta)
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      home.z + scroll * 0.35,
      cameraTracking,
      delta,
    )
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
