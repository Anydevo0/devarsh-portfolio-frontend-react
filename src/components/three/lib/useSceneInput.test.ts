import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PITCH_LIMITS, YAW_LIMITS, YAW_MAX, YAW_OVERSHOOT } from './rigLimits'
import { useSceneInput } from './useSceneInput'

/**
 * jsdom has no `PointerEvent`, so these are `MouseEvent`s carrying the two pointer
 * properties the hook reads. Nothing else on the event is touched, which is what makes
 * the substitution safe rather than a stand-in for the logic under test.
 */
function pointerEvent(
  type: string,
  { clientX = 0, clientY = 0, pointerId = 1, pointerType = 'mouse', button = 0 } = {},
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button,
  })
  Object.defineProperty(event, 'pointerId', { value: pointerId })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  return event
}

/** The same figure `sweepDistance` derives — how far a full-range drag has to travel. */
const SWEEP = Math.min(Math.max(window.innerWidth * 0.45, 260), 560)
const YAW_SPAN = YAW_LIMITS[1] - YAW_LIMITS[0]
const PITCH_SPAN = PITCH_LIMITS[1] - PITCH_LIMITS[0]
const RESTING = YAW_LIMITS[2]

describe('useSceneInput drag gesture', () => {
  let section: HTMLElement
  let child: HTMLElement
  let button: HTMLButtonElement
  let onFirstDrag: ReturnType<typeof vi.fn>

  beforeEach(() => {
    section = document.createElement('section')
    child = document.createElement('div')
    button = document.createElement('button')
    section.append(child, button)
    document.body.append(section)

    // jsdom implements none of these; the hook only needs them not to throw.
    section.setPointerCapture = vi.fn()
    section.releasePointerCapture = vi.fn()
    section.hasPointerCapture = vi.fn().mockReturnValue(true)

    onFirstDrag = vi.fn()
  })

  function mount() {
    const ref = { current: section }
    return renderHook(() =>
      useSceneInput(ref, {
        dragTargetRef: ref,
        onFirstDrag,
        yawLimits: YAW_LIMITS,
        pitchLimits: PITCH_LIMITS,
        yawOvershoot: YAW_OVERSHOOT,
      }),
    )
  }

  /** pointerdown lands on the drag target; the rest of the gesture is on the window. */
  function press(target: EventTarget, options?: Parameters<typeof pointerEvent>[1]) {
    target.dispatchEvent(pointerEvent('pointerdown', options))
  }
  function move(options?: Parameters<typeof pointerEvent>[1]) {
    window.dispatchEvent(pointerEvent('pointermove', options))
  }
  function release(options?: Parameters<typeof pointerEvent>[1]) {
    window.dispatchEvent(pointerEvent('pointerup', options))
  }

  it('starts at the resting pose with nothing dragged', () => {
    const { result } = mount()
    expect(result.current.input.current.dragYaw).toBe(RESTING)
    expect(result.current.input.current.dragPitch).toBe(0)
    expect(result.current.input.current.isDragging).toBe(false)
    expect(result.current.input.current.hasDragged).toBe(false)
  })

  it('ignores movement below the slop threshold, so the wall switch stays clickable', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 503, clientY: 302 })

    expect(result.current.input.current.isDragging).toBe(false)
    expect(result.current.input.current.dragYaw).toBe(RESTING)
    expect(section.setPointerCapture).not.toHaveBeenCalled()
  })

  it('turns the model the opposite way to the hand, once past the threshold', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 560, clientY: 300 })

    const values = result.current.input.current
    expect(values.isDragging).toBe(true)
    expect(values.hasDragged).toBe(true)
    expect(section.setPointerCapture).toHaveBeenCalledWith(1)
    // Dragging right subtracts: the gesture orbits the viewpoint rather than shoving
    // the object, so the model turns to its left.
    expect(values.dragYaw).toBeCloseTo(RESTING - (60 / SWEEP) * YAW_SPAN, 5)
    expect(values.dragYaw).toBeLessThan(RESTING)
  })

  it('drives pitch from vertical travel, clamped to its limits', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 500, clientY: 400 })

    expect(result.current.input.current.dragPitch).toBeCloseTo(-(100 / SWEEP) * PITCH_SPAN, 5)

    // Far past the end — the clamp holds, with no rubber band on this axis.
    move({ clientX: 500, clientY: -4000 })
    expect(result.current.input.current.dragPitch).toBe(PITCH_LIMITS[1])
  })

  it('rubber-bands past a yaw stop rather than stopping dead', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300 })
    // Left, far enough that the raw value overshoots the top of the range.
    move({ clientX: 100, clientY: 300 })

    const stretched = result.current.input.current.dragYaw
    expect(stretched).toBeGreaterThan(YAW_MAX)
    expect(stretched).toBeLessThan(YAW_MAX + YAW_OVERSHOOT)
  })

  it('lets go of the stretch on release', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 100, clientY: 300 })
    expect(result.current.input.current.dragYaw).toBeGreaterThan(YAW_MAX)

    release({ clientX: 100, clientY: 300 })
    expect(result.current.input.current.dragYaw).toBe(YAW_MAX)
    expect(result.current.input.current.isDragging).toBe(false)
  })

  it('continues from where the previous gesture left off', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 560, clientY: 300 })
    release({ clientX: 560, clientY: 300 })
    const afterFirst = result.current.input.current.dragYaw

    press(section, { clientX: 200, clientY: 300 })
    move({ clientX: 260, clientY: 300 })
    expect(result.current.input.current.dragYaw).toBeCloseTo(afterFirst - (60 / SWEEP) * YAW_SPAN, 5)
  })

  it('announces the first drag exactly once', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 560, clientY: 300 })
    release({ clientX: 560, clientY: 300 })

    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 620, clientY: 300 })

    expect(onFirstDrag).toHaveBeenCalledTimes(1)
    expect(result.current.input.current.hasDragged).toBe(true)
  })

  it('never starts a drag from a press on something that owns its own click', () => {
    const { result } = mount()
    press(button, { clientX: 500, clientY: 300 })
    move({ clientX: 620, clientY: 300 })

    expect(result.current.input.current.isDragging).toBe(false)
    expect(result.current.input.current.dragYaw).toBe(RESTING)
  })

  it('ignores middle and right mouse buttons', () => {
    const { result } = mount()
    press(section, { clientX: 500, clientY: 300, button: 2 })
    move({ clientX: 620, clientY: 300 })

    expect(result.current.input.current.dragYaw).toBe(RESTING)
  })

  it('swallows the click that ends a real drag, so the lamp does not toggle', () => {
    mount()
    const clicked = vi.fn()
    child.addEventListener('click', clicked)

    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 620, clientY: 300 })
    release({ clientX: 620, clientY: 300 })
    child.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(clicked).not.toHaveBeenCalled()
  })

  it('swallows only the one click, not the next', () => {
    mount()
    const clicked = vi.fn()
    child.addEventListener('click', clicked)

    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 620, clientY: 300 })
    release({ clientX: 620, clientY: 300 })
    child.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    child.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(clicked).toHaveBeenCalledTimes(1)
  })

  it('leaves an ordinary click alone when the press never became a drag', () => {
    mount()
    const clicked = vi.fn()
    child.addEventListener('click', clicked)

    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 502, clientY: 300 })
    release({ clientX: 502, clientY: 300 })
    child.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

    expect(clicked).toHaveBeenCalledTimes(1)
  })

  it('ends the gesture on pointercancel, which is the browser taking over a page scroll', () => {
    const { result } = mount()
    const clicked = vi.fn()
    child.addEventListener('click', clicked)

    press(section, { clientX: 500, clientY: 300, pointerType: 'touch' })
    move({ clientX: 620, clientY: 300, pointerType: 'touch' })
    expect(result.current.input.current.isDragging).toBe(true)

    window.dispatchEvent(pointerEvent('pointercancel', { clientX: 620, pointerType: 'touch' }))
    expect(result.current.input.current.isDragging).toBe(false)
    // A cancelled pointer never produces a click, so nothing is armed to swallow one.
    child.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(clicked).toHaveBeenCalledTimes(1)
  })

  it('asks for a frame on every drag move, so a sleeping render loop still redraws', () => {
    const { result } = mount()
    const requestFrame = vi.fn()
    result.current.setFrameRequest(requestFrame)

    press(section, { clientX: 500, clientY: 300 })
    move({ clientX: 560, clientY: 300 })
    move({ clientX: 580, clientY: 300 })

    expect(requestFrame).toHaveBeenCalledTimes(2)
  })
})
