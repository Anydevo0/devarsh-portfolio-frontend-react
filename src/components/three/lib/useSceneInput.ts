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
   * True from the moment a drag ends until the rig has settled back at rest.
   *
   * Together with `isDragging` this is the scene's "the visitor is driving" flag, and
   * scroll and cursor parallax stand down for as long as either is set. They are
   * ambient motion for a scene nobody is touching; while someone is posing the model by
   * hand, or while it is on its way home from that, anything else nudging the same
   * value reads as the thing having a mind of its own and fights the return.
   *
   * It clears rather than latching, which is the whole point: ambient motion comes back
   * once the rig is home, so scrolling still turns the scene for a visitor who has
   * dragged it. Latching this was what made one drag disable the scroll rotation for
   * the rest of the visit.
   */
  isReturning: boolean
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
  /**
   * Whether releasing animates the rig home or simply puts it there.
   *
   * False for a reduced-motion visitor. The gesture itself still works for them —
   * that setting asks for no animation, not for no controls — but the ease afterwards
   * is motion nobody's hand is driving, which is the kind this setting exists to
   * suppress. They get the same destination, on the frame they let go.
   */
  easeReturn: boolean
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
 * How sharply the rig eases home after a release, as an exponential decay constant.
 *
 * `exp(-k·dt)` is an ease-out — fastest at the moment of release, asymptotically slower
 * as it arrives — and it is frame-rate independent, so the return takes the same
 * wall-clock time on a 60Hz panel and a 144Hz one. At 9 the rig is ~97% home in 400ms,
 * which is quick enough to feel like a spring rather than a drift, and slow enough that
 * the eye can follow where the model went.
 */
const RETURN_DECAY = 9

/**
 * When the return is close enough to stop.
 *
 * ~0.06° of yaw: comfortably under a pixel of movement anywhere on the model, so
 * stopping here is invisible. Without a floor an exponential never actually arrives,
 * and the rAF loop — and with it the render loop it keeps waking — would run forever.
 */
const REST_EPSILON = 0.001

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
 * rig cannot guarantee. `drag` is absolute in the same sense: it is a pose rather than
 * a delta, which is what lets the release simply ease it back to the resting value
 * instead of having to unwind a history of movements.
 */
export function useSceneInput(
  targetRef: RefObject<HTMLElement | null>,
  {
    dragTargetRef,
    onFirstDrag,
    yawLimits,
    pitchLimits,
    yawOvershoot,
    easeReturn,
  }: SceneInputOptions,
): SceneInputHandle {
  const input = useRef<SceneInputValues>({
    scroll: 0,
    pointerX: 0,
    pointerY: 0,
    dragYaw: yawLimits[2],
    dragPitch: 0,
    isDragging: false,
    isReturning: false,
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
    let returnFrame = 0
    let returnLast = 0

    const restingYaw = yawLimits[2]

    /**
     * Eases the rig back to its resting pose after a release.
     *
     * Driven from here rather than from the scene's own render loop for the reason
     * given on `setFrameRequest`: this hook owns `dragYaw` and `dragPitch`, so this
     * hook is the only thing that writes them. It also means the return survives the
     * render loop being asleep — under `frameloop="demand"` nothing would otherwise be
     * stepping it — and each step asks for the frame that draws it.
     */
    function stepReturn(now: number) {
      // Clamped so a tab that was backgrounded mid-return resumes with a sane delta
      // instead of one enormous one that teleports the rig home.
      const delta = Math.min((now - returnLast) / 1000, 0.05)
      returnLast = now

      const decay = Math.exp(-RETURN_DECAY * delta)
      const yaw = restingYaw + (input.current.dragYaw - restingYaw) * decay
      const pitch = input.current.dragPitch * decay

      if (Math.abs(yaw - restingYaw) < REST_EPSILON && Math.abs(pitch) < REST_EPSILON) {
        settleReturn()
        return
      }

      input.current.dragYaw = yaw
      input.current.dragPitch = pitch
      input.current.requestFrame?.()
      returnFrame = requestAnimationFrame(stepReturn)
    }

    /** Puts the rig exactly home and hands the scene back to its ambient motion. */
    function settleReturn() {
      returnFrame = 0
      input.current.dragYaw = restingYaw
      input.current.dragPitch = 0
      input.current.isReturning = false
      input.current.requestFrame?.()
    }

    function stopReturn() {
      if (returnFrame === 0) return
      cancelAnimationFrame(returnFrame)
      returnFrame = 0
      input.current.isReturning = false
    }

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
      // Catching the rig mid-return takes it from wherever it has reached, not from
      // where the last gesture ended — grabbing something on its way home should stop
      // it there, the way catching a swinging door does.
      stopReturn()
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
        // Let go of any rubber-band stretch, so the journey home starts from a pose
        // that is actually inside the range.
        input.current.dragYaw = clamp(input.current.dragYaw, yawLimits[0], yawLimits[1])
        input.current.isDragging = false

        // Straight into the return, on this event rather than on the next frame, so
        // there is no held pause between letting go and the rig starting to move.
        if (easeReturn) {
          input.current.isReturning = true
          returnLast = performance.now()
          returnFrame = requestAnimationFrame(stepReturn)
        } else {
          settleReturn()
        }
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
      stopReturn()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerup', handleDragEnd)
      window.removeEventListener('pointercancel', handleDragCancel)
      dragTarget?.removeEventListener('pointerdown', handleDragStart)
      dragTarget?.removeEventListener('click', handleClickCapture, true)
    }
  }, [targetRef, dragTargetRef, yawLimits, pitchLimits, yawOvershoot, easeReturn])

  const setFrameRequest = useCallback((request: (() => void) | null) => {
    input.current.requestFrame = request
  }, [])

  return { input, setFrameRequest }
}
