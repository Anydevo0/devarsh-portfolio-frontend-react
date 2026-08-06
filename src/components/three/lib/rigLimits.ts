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

/**
 * Where the rig sits before any input — the midpoint of the range, deliberately.
 *
 * It used to sit at -0.1, which was where the scene had always rested, and that left
 * ~72° of travel one way against ~24° the other. The same gesture therefore did wildly
 * different amounts depending on direction, and pulling right ran out after about
 * 140px and went dead — which reads as a broken control rather than as a limit. The
 * asymmetry was not a tuning problem: the face is not modelled, so the face-ward stop
 * cannot move, and the only way to balance the range was to move the resting pose into
 * the middle of it. Costs the old first frame; buys a control that behaves the same
 * whichever way it is pulled.
 */
export const YAW_MIN = -0.53
export const YAW_MAX = 1.15
export const BASE_ROTATION = (YAW_MIN + YAW_MAX) / 2

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
