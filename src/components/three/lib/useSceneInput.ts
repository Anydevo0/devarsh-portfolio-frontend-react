import { type RefObject, useCallback, useEffect, useRef } from 'react'

export interface SceneInputValues {
  /** 0 at the top of the hero, 1 once it has scrolled fully past. */
  scroll: number
  /** Cursor position, normalised to -1…1 across the viewport. */
  pointerX: number
  pointerY: number
  /**
   * Absolute rig yaw asked for by dragging, in radians, already clamped to the range
   * the caller supplied.
   *
   * Radians rather than a normalised 0…1 because the range is no longer symmetrical
   * about the resting pose — the default view sits nearer one end than the other. A
   * normalised track would have had to stretch one direction against the other, so a
   * drag left would have swept a different number of degrees per pixel than a drag
   * right. Accumulating in the real unit and clamping at the real limits keeps the
   * sensitivity identical whichever way the visitor pulls.
   */
  dragYaw: number
  /**
   * Camera elevation offset asked for by dragging, in radians, likewise clamped.
   * Orbits the camera rather than pitching the rig: tilting the room itself would
   * swing the floor and the back wall through frame.
   */
  dragPitch: number
  /**
   * True between the moment a press becomes a drag and the moment it ends.
   *
   * The scene reads this to decide whether to pin the rig to the pointer or ease
   * toward it. Damping a value the visitor is actively holding makes the model trail
   * their hand; easing only once they let go is what makes it feel attached.
   */
  isDragging: boolean
  /**
   * True once the visitor has dragged even one pixel, and never false again.
   *
   * Scroll and cursor parallax stop contributing to yaw at that point. They are
   * ambient motion for a scene nobody has touched — but once someone has posed the
   * model by hand, anything that keeps nudging it reads as the thing having a mind of
   * its own, and it silently eats the range they have left to drag through.
   */
  hasDragged: boolean
  /**
   * Published by a component inside the `<Canvas>` (see `DeveloperScene`), through
   * `setFrameRequest` below.
   *
   * With `frameloop="demand"` nothing redraws unless something asks for it, and these
   * listeners live in the DOM, outside the renderer. Without this a reduced-motion
   * visitor could drag as much as they liked and the picture would never change.
   */
  requestFrame: (() => void) | null
}

export type SceneInput = RefObject<SceneInputValues>

export interface SceneInputHandle {
  input: SceneInput
  /**
   * Stable. The renderer's `invalidate` is only reachable from inside the Canvas, and
   * the hook that owns this mutable object is out here — so the write is exposed as a
   * setter rather than by handing the object over to be mutated from the other side.
   * Whoever owns a piece of mutable state should be the only thing that writes to it.
   */
  setFrameRequest: (request: (() => void) | null) => void
}

interface SceneInputOptions {
  /** The element the drag gesture is read from — the wrapper around the canvas. */
  dragTargetRef: RefObject<HTMLElement | null>
  /** Fired once, the first time a press actually becomes a drag. Drives the hint. */
  onFirstDrag?: () => void
  /** Hard stops for `dragYaw`, in radians: [min, max, resting]. */
  yawLimits: readonly [number, number, number]
  /** Hard stops for `dragPitch`, in radians: [min, max]. */
  pitchLimits: readonly [number, number]
  /** How far past a yaw stop the gesture may be pulled before it stops giving at all. */
  yawOvershoot: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Clamp with give: inside the range this is the identity, and past either end it
 * yields with diminishing returns, approaching `overshoot` but never reaching it.
 *
 * `d / (1 + d / overshoot)` is the standard rubber-band curve — its slope is 1 at the
 * boundary, so the resistance starts as a continuous extension of normal dragging
 * rather than as a step change, and falls away from there.
 */
function rubberBand(value: number, min: number, max: number, overshoot: number) {
  if (overshoot <= 0) return clamp(value, min, max)
  if (value > max) {
    const past = value - max
    return max + past / (1 + past / overshoot)
  }
  if (value < min) {
    const past = min - value
    return min - past / (1 + past / overshoot)
  }
  return value
}

/**
 * Movement, in pixels, before a press counts as a drag.
 *
 * Everything below this stays a click, because the wall switch inside the scene is
 * one, and no mouse-up lands on exactly the pixel its mouse-down did.
 */
const DRAG_SLOP = 5

/** Anything that owns its own press. A drag never starts on one of these. */
const INTERACTIVE = 'a, button, input, textarea, select, summary, [role="button"], [tabindex]'

/**
 * Collects scroll, pointer position and the drag gesture into a ref rather than React
 * state.
 *
 * This is the whole reason the scene stays smooth: scrolling, moving the mouse and
 * dragging the model never trigger a React render. The listeners only write numbers
 * into a mutable object, and the render loop inside the Canvas reads that object once
 * per frame and damps toward it. Scroll is additionally coalesced through
 * requestAnimationFrame, so a fast trackpad flick does one layout read per frame
 * instead of dozens.
 *
 * Because the value is absolute scroll position rather than accumulated delta,
 * scrolling back up unwinds the rotation along exactly the path it came — which is
 * what the brief's "reverses, no snapping" asks for, and something a delta-driven
 * rig cannot guarantee. `drag` is absolute in the same sense: each gesture offsets
 * from where the previous one left off, so releasing and grabbing again continues
 * rather than restarting.
 */
export function useSceneInput(
  targetRef: RefObject<HTMLElement | null>,
  { dragTargetRef, onFirstDrag, yawLimits, pitchLimits, yawOvershoot }: SceneInputOptions,
): SceneInputHandle {
  const input = useRef<SceneInputValues>({
    scroll: 0,
    pointerX: 0,
    pointerY: 0,
    dragYaw: yawLimits[2],
    dragPitch: 0,
    isDragging: false,
    hasDragged: false,
    requestFrame: null,
  })

  // Read through a ref so an unmemoised callback from the caller cannot cause the
  // listeners below to be torn down and re-attached on every render.
  const firstDrag = useRef(onFirstDrag)
  useEffect(() => {
    firstDrag.current = onFirstDrag
  }, [onFirstDrag])

  useEffect(() => {
    const dragTarget = dragTargetRef.current
    let frame = 0
    // Cached, because reading `offsetHeight` forces the browser to flush pending
    // layout. Doing that inside the scroll handler meant a synchronous layout on
    // every scroll frame — the single most expensive thing this hook did, and the
    // main source of scroll jank on the home page. The hero's height only changes on
    // resize, so it is measured there instead.
    let heroHeight = targetRef.current?.offsetHeight ?? window.innerHeight
    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight

    // Gesture state, in closure variables for the same reason the values above live in
    // a ref: a drag is a per-frame event stream, and none of it is worth a render.
    let activePointer = -1
    let originX = 0
    let originY = 0
    let originYaw = 0
    let originPitch = 0
    let isDragging = false
    let swallowNextClick = false
    let hasEverDragged = false

    function readScroll() {
      frame = 0
      input.current.scroll = Math.min(Math.max(window.scrollY / Math.max(heroHeight, 1), 0), 1)
    }

    function handleScroll() {
      if (frame === 0) frame = requestAnimationFrame(readScroll)
    }

    function handleResize() {
      heroHeight = targetRef.current?.offsetHeight ?? window.innerHeight
      viewportWidth = window.innerWidth
      viewportHeight = window.innerHeight
      handleScroll()
    }

    /**
     * Horizontal travel that sweeps the full range.
     *
     * Viewport-relative so the gesture costs the same share of a swipe on a phone as
     * it does on a desktop, but bounded at both ends: a pure percentage makes the
     * model feel glued to the cursor on an ultrawide and makes it snap end to end on
     * a narrow phone. Computed from the cached width, so this is arithmetic and not
     * a layout read.
     */
    function sweepDistance() {
      return Math.min(Math.max(viewportWidth * 0.45, 260), 560)
    }

    function handlePointer(event: PointerEvent) {
      // Pure arithmetic against cached dimensions — no layout read per move.
      input.current.pointerX = (event.clientX / viewportWidth) * 2 - 1
      input.current.pointerY = (event.clientY / viewportHeight) * 2 - 1

      if (event.pointerId !== activePointer) return
      const travelX = event.clientX - originX
      const travelY = event.clientY - originY

      if (!isDragging) {
        if (Math.abs(travelX) < DRAG_SLOP && Math.abs(travelY) < DRAG_SLOP) return
        isDragging = true
        // Capture is taken here and deliberately not on pointerdown. A captured
        // pointer retargets the `click` that follows it to the capture element, so
        // capturing up front would mean the wall switch inside the canvas never saw
        // another click again. Taken now, it only ever costs a gesture that had
        // already stopped being a click — and it buys the thing capture is for: a
        // drag that leaves the canvas, or the window, still tracks and still ends.
        if (dragTarget?.isConnected) dragTarget.setPointerCapture(activePointer)
        // Inline, so it beats both rules in index.css for as long as the drag lasts.
        // Selection is suppressed only now, not up front: until a press has become a
        // drag it is still an ordinary click, and the hero's copy stays selectable.
        if (dragTarget) {
          dragTarget.style.cursor = 'grabbing'
          dragTarget.style.userSelect = 'none'
        }
        window.getSelection()?.removeAllRanges()
        input.current.isDragging = true
        if (!hasEverDragged) {
          hasEverDragged = true
          input.current.hasDragged = true
          firstDrag.current?.()
        }
      }

      // The gesture orbits the viewpoint, not the object: the model turns the opposite
      // way to the hand, so dragging right shows more of the model's left. Increasing
      // yaw swings the near side of the rig toward screen-right (see the derivation in
      // `WorkstationScene`), which is the model turning *right* — so rightward travel,
      // a positive delta, has to subtract. Vertical follows the same convention: drag
      // down and the camera goes down with it.
      const sweep = sweepDistance()
      const yawSpan = yawLimits[1] - yawLimits[0]
      const pitchSpan = pitchLimits[1] - pitchLimits[0]
      input.current.dragYaw = rubberBand(
        originYaw - (travelX / sweep) * yawSpan,
        yawLimits[0],
        yawLimits[1],
        yawOvershoot,
      )
      input.current.dragPitch = clamp(
        originPitch - (travelY / sweep) * pitchSpan,
        pitchLimits[0],
        pitchLimits[1],
      )
      input.current.requestFrame?.()
    }

    function handleDragStart(event: PointerEvent) {
      // Middle and right buttons belong to the browser's own gestures.
      if (activePointer !== -1 || (event.pointerType === 'mouse' && event.button !== 0)) return
      // The gesture covers the whole hero, which means it also covers the CTAs and the
      // social links sitting on top of the scene. A press that starts on one of those
      // belongs to it: a slightly shaky click on a button must stay a click, and must
      // not be turned into a rotation and then swallowed as a drag.
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return
      activePointer = event.pointerId
      originX = event.clientX
      originY = event.clientY
      originYaw = input.current.dragYaw
      originPitch = input.current.dragPitch
      isDragging = false
      // A previous gesture that ended without ever producing a click would otherwise
      // leave this armed and eat an innocent one.
      swallowNextClick = false
    }

    function endDrag(event: PointerEvent, producedClick: boolean) {
      if (event.pointerId !== activePointer) return
      if (isDragging) {
        swallowNextClick = producedClick
        if (dragTarget) {
          if (dragTarget.hasPointerCapture(activePointer)) {
            dragTarget.releasePointerCapture(activePointer)
          }
          dragTarget.style.cursor = ''
          dragTarget.style.userSelect = ''
        }
        // Let go of any rubber-band stretch. The value snaps to the real limit here
        // and the scene damps toward it, so what the visitor sees is the model easing
        // back off the stop rather than the number teleporting.
        input.current.dragYaw = clamp(input.current.dragYaw, yawLimits[0], yawLimits[1])
        input.current.isDragging = false
        input.current.requestFrame?.()
      }
      activePointer = -1
      isDragging = false
    }

    function handleDragEnd(event: PointerEvent) {
      endDrag(event, true)
    }

    function handleDragCancel(event: PointerEvent) {
      // A cancelled pointer never produces a click — most often the browser taking the
      // gesture over as a vertical page scroll, which `touch-action: pan-y` on the
      // wrapper explicitly allows it to do. Whatever the visitor had already dragged
      // stays where it is; only the gesture ends.
      endDrag(event, false)
    }

    /**
     * Capture phase, on the wrapper — so it runs before react-three-fiber's own
     * listener on the canvas inside it. A drag that happens to finish over the wall
     * switch must not toggle the lamp.
     */
    function handleClickCapture(event: MouseEvent) {
      if (!swallowNextClick) return
      swallowNextClick = false
      event.stopPropagation()
      event.preventDefault()
    }

    readScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    // Move/up/cancel are on the window rather than the wrapper so the gesture is still
    // tracked in the window between pointerdown and the slop threshold, when no
    // pointer capture is held yet.
    window.addEventListener('pointermove', handlePointer, { passive: true })
    window.addEventListener('pointerup', handleDragEnd, { passive: true })
    window.addEventListener('pointercancel', handleDragCancel, { passive: true })
    dragTarget?.addEventListener('pointerdown', handleDragStart, { passive: true })
    dragTarget?.addEventListener('click', handleClickCapture, true)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerup', handleDragEnd)
      window.removeEventListener('pointercancel', handleDragCancel)
      dragTarget?.removeEventListener('pointerdown', handleDragStart)
      dragTarget?.removeEventListener('click', handleClickCapture, true)
    }
  }, [targetRef, dragTargetRef, yawLimits, pitchLimits, yawOvershoot])

  const setFrameRequest = useCallback((request: (() => void) | null) => {
    input.current.requestFrame = request
  }, [])

  return { input, setFrameRequest }
}
