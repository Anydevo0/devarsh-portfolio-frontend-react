/**
 * The rig's hard stops, in radians.
 *
 * These live in their own module, deliberately, and it is not tidiness. `HeroScene`
 * needs them to configure `useSceneInput`, and `HeroScene` ships in the main bundle;
 * `WorkstationScene` needs them too, and it imports three.js and every part of the
 * workstation. Declaring them alongside the scene and importing them from the hero
 * would drag the whole three.js chunk back into the initial download and undo the
 * `React.lazy` boundary the hero is built around. Nothing here imports anything.
 *
 * Why these particular numbers is explained where they are used, in `WorkstationScene`.
 */

export const YAW_MIN = -0.53
export const YAW_MAX = 1.15

/**
 * Where the rig sits before any input, and where it returns to once a drag ends.
 *
 * Off the midpoint on purpose. Centring it — which is what this briefly was — put the
 * resting pose at θ ≈ 0.31, and that is dead behind the figure: the camera looking
 * straight up the spine, with the lamp and the wall switch both swung round to near the
 * middle of frame where the monitor already is. Symmetrical to drag, and the wrong
 * first impression.
 *
 * -0.1 is the back three-quarter the scene was actually composed around. It carries the
 * switch out to about x = +0.67 in view space, clear to the right of the monitor and
 * above its top edge, which is what makes the lamp control findable without the page
 * having to point at it.
 *
 * The cost is that travel is lopsided again: ~0.43 rad toward the face-ward stop
 * against ~1.25 the other way. That asymmetry is exactly what centring was meant to
 * fix, and it is affordable now only because releasing returns the rig here instead of
 * leaving it wherever the gesture ended. Nobody lives at the far end of the range any
 * more, so running out of travel there costs a moment rather than the rest of the visit.
 */
export const BASE_ROTATION = -0.1

/**
 * How far past a stop the rig can be pulled, in radians (~7°).
 *
 * A hard clamp stops answering mid-gesture, and a control that stops answering reads
 * as broken rather than finished. Resisting and springing back is the difference
 * between "this is the end" and "this is stuck".
 */
export const YAW_OVERSHOOT = 0.12

/** [min, max, resting] — `useSceneInput` clamps its accumulator to these. */
export const YAW_LIMITS = [YAW_MIN, YAW_MAX, BASE_ROTATION] as const

/** Vertical drag, ±16°, applied to the camera's elevation rather than the rig. */
export const PITCH_LIMITS = [-0.28, 0.28] as const
