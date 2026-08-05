import { type RefObject, useEffect, useRef } from 'react'

export interface SceneInputValues {
  /** 0 at the top of the hero, 1 once it has scrolled fully past. */
  scroll: number
  /** Cursor position, normalised to -1…1 across the viewport. */
  pointerX: number
  pointerY: number
}

export type SceneInput = RefObject<SceneInputValues>

/**
 * Collects scroll and pointer position into a ref rather than React state.
 *
 * This is the whole reason the scene stays smooth: scrolling and moving the mouse
 * never trigger a React render. The listeners only write numbers into a mutable
 * object, and the render loop inside the Canvas reads that object once per frame and
 * damps toward it. Scroll is additionally coalesced through requestAnimationFrame,
 * so a fast trackpad flick does one layout read per frame instead of dozens.
 *
 * Because the value is absolute scroll position rather than accumulated delta,
 * scrolling back up unwinds the rotation along exactly the path it came — which is
 * what the brief's "reverses, no snapping" asks for, and something a delta-driven
 * rig cannot guarantee.
 */
export function useSceneInput(targetRef: RefObject<HTMLElement | null>): SceneInput {
  const input = useRef<SceneInputValues>({ scroll: 0, pointerX: 0, pointerY: 0 })

  useEffect(() => {
    let frame = 0
    // Cached, because reading `offsetHeight` forces the browser to flush pending
    // layout. Doing that inside the scroll handler meant a synchronous layout on
    // every scroll frame — the single most expensive thing this hook did, and the
    // main source of scroll jank on the home page. The hero's height only changes on
    // resize, so it is measured there instead.
    let heroHeight = targetRef.current?.offsetHeight ?? window.innerHeight
    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight

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

    function handlePointer(event: PointerEvent) {
      // Pure arithmetic against cached dimensions — no layout read per move.
      input.current.pointerX = (event.clientX / viewportWidth) * 2 - 1
      input.current.pointerY = (event.clientY / viewportHeight) * 2 - 1
    }

    readScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('pointermove', handlePointer, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointer)
    }
  }, [targetRef])

  return input
}
