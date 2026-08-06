import { type RefObject, useEffect } from 'react'

import type { SceneInput } from './useSceneInput'

/**
 * Yaw applied per pixel of horizontal travel, in radians.
 *
 * Tuned against the soft limit in `WorkstationScene`: a ~200px drag — a comfortable
 * flick with either a mouse or a thumb — lands near the end of the range, so the
 * gesture completes inside one movement rather than needing to be repeated.
 */
const SENSITIVITY = 0.0045

/**
 * Horizontal travel, in pixels, before a press becomes a drag.
 *
 * This threshold is what keeps the wall switch clickable. Pointer capture retargets
 * events away from the canvas, so taking it on `pointerdown` would mean the raycaster
 * never sees the `pointerup` that completes a click and the lamp would stop working.
 * Below the threshold nothing is captured and the press behaves exactly as it did.
 *
 * Touch gets a larger allowance because a finger never presses perfectly still.
 */
const CLICK_SLOP = { pen: 4, touch: 10 }

/**
 * How quickly the rig unwinds once the pointer is released, as an exponential decay
 * constant. Slow enough to read as a deliberate settle rather than a snap, fast enough
 * to be at rest before a visitor has finished deciding to scroll.
 */
const RETURN_DECAY = 3

/** Below this the remaining rotation is sub-pixel, so the loop stops instead of
 *  chasing zero forever and holding a `requestAnimationFrame` open for nothing. */
const REST_EPSILON = 0.0005

/**
 * Press-and-drag rotation for the hero scene.
 *
 * Writes into the same input ref the rest of the scene reads, so a drag costs no React
 * render — identical to how scroll and pointer position are already handled. The hook
 * owns the whole life of the gesture, accumulation and the ease back to rest alike, so
 * the scene is left with a single value to read and no state of its own to keep in
 * step. The return runs on `requestAnimationFrame` and stops once it settles, which
 * means the common case — nobody dragging — costs nothing at all.
 *
 * Vertical gestures are left to the browser via `touch-action: pan-y` (see
 * `.scene-drag`). On a phone the canvas covers the whole hero, so capturing vertical
 * drags would trap the visitor at the top of the page — the browser's own direction
 * lock resolves it more reliably than a threshold could.
 */
export function useSceneDrag(
  containerRef: RefObject<HTMLElement | null>,
  input: SceneInput,
  enabled: boolean,
) {
  useEffect(() => {
    const element = containerRef.current
    if (!element || !enabled) return

    // Captured once: the ref object is created by `useSceneInput` and never
    // reassigned, so this is the same object for the life of the effect — and reading
    // it here rather than in the cleanup is what the exhaustive-deps rule asks for.
    const values = input.current

    let pointerId: number | null = null
    let startX = 0
    let lastX = 0
    let slop = CLICK_SLOP.pen
    let dragging = false
    let frame = 0
    let lastFrameTime = 0

    /**
     * Eases the accumulated rotation back to zero.
     *
     * Decaying by `exp(-k·dt)` rather than a fixed fraction per frame makes the return
     * take the same wall-clock time on a 60Hz and a 144Hz display — the same reasoning
     * behind the scene's use of `MathUtils.damp`, which is this exact curve.
     */
    function unwind(now: number) {
      // Clamped so a backgrounded tab does not resume with one enormous delta and
      // teleport the model back to rest.
      const delta = Math.min((now - lastFrameTime) / 1000, 0.05)
      lastFrameTime = now

      const next = values.dragRaw * Math.exp(-RETURN_DECAY * delta)
      if (Math.abs(next) < REST_EPSILON) {
        values.dragRaw = 0
        frame = 0
        return
      }
      values.dragRaw = next
      frame = requestAnimationFrame(unwind)
    }

    function startUnwind() {
      if (frame !== 0 || values.dragRaw === 0) return
      lastFrameTime = performance.now()
      frame = requestAnimationFrame(unwind)
    }

    function stopUnwind() {
      if (frame === 0) return
      cancelAnimationFrame(frame)
      frame = 0
    }

    function stop() {
      pointerId = null
      dragging = false
      values.isDragging = false
      delete element.dataset.dragging
    }

    function handleDown(event: PointerEvent) {
      // Secondary buttons belong to the context menu, not to the model.
      if (event.button !== 0) return
      pointerId = event.pointerId
      startX = event.clientX
      lastX = event.clientX
      slop = event.pointerType === 'touch' ? CLICK_SLOP.touch : CLICK_SLOP.pen
      dragging = false
      // Deliberately no `preventDefault` here. It would be the usual way to stop a
      // mouse drag from marquee-selecting the hero copy, but this press may also turn
      // out to be a click on the wall switch, and suppressing default behaviour on the
      // pointerdown that begins it is not worth the risk to the one interactive object
      // in the scene. Selection is dealt with at the moment a drag is recognised
      // instead, by which point the press is known not to be a click.
    }

    function handleMove(event: PointerEvent) {
      if (pointerId === null || event.pointerId !== pointerId) return

      if (!dragging) {
        if (Math.abs(event.clientX - startX) < slop) return
        dragging = true
        values.isDragging = true
        // Grabbing again part-way through a return picks the model up exactly where it
        // is, because the drag and the return share one value — there is no second
        // number to resynchronise, and so no jump on the second grab.
        stopUnwind()
        element.setPointerCapture(pointerId)
        element.dataset.dragging = 'true'
        // Drop any text the press started selecting before it was understood as a
        // drag; `user-select: none` on `[data-dragging]` stops it growing from here.
        document.getSelection()?.removeAllRanges()
        // The wall switch writes a `pointer` cursor inline onto the canvas, which
        // would outrank the grabbing cursor for a drag that started on the switch.
        element.querySelector('canvas')?.style.removeProperty('cursor')
        // Consume the slop instead of applying it, so the model does not jump by the
        // threshold distance the instant the drag is recognised.
        lastX = event.clientX
      }

      values.dragRaw += (event.clientX - lastX) * SENSITIVITY
      lastX = event.clientX
    }

    function handleUp(event: PointerEvent) {
      if (pointerId === null || event.pointerId !== pointerId) return
      if (dragging && element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId)
      }
      stop()
      startUnwind()
    }

    element.addEventListener('pointerdown', handleDown)
    element.addEventListener('pointermove', handleMove)
    element.addEventListener('pointerup', handleUp)
    // Fires when the browser claims the gesture for a vertical scroll, which is the
    // normal end of a touch drag that turned out not to be horizontal.
    element.addEventListener('pointercancel', handleUp)

    return () => {
      element.removeEventListener('pointerdown', handleDown)
      element.removeEventListener('pointermove', handleMove)
      element.removeEventListener('pointerup', handleUp)
      element.removeEventListener('pointercancel', handleUp)
      stopUnwind()
      stop()
      // Nothing is left mid-turn for a remount to inherit.
      values.dragRaw = 0
    }
  }, [containerRef, input, enabled])
}
