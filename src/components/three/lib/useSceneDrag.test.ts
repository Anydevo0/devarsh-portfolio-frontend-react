import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSceneDrag } from './useSceneDrag'
import type { SceneInputValues } from './useSceneInput'

/**
 * jsdom has no `PointerEvent`, so these are `MouseEvent`s wearing the two pointer
 * properties the hook actually reads. The hook never touches anything else on the
 * event, which is what makes the substitution safe rather than a stub of the logic.
 */
function pointerEvent(
  type: string,
  { clientX = 0, pointerId = 1, pointerType = 'mouse', button = 0 } = {},
) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, button })
  Object.defineProperty(event, 'pointerId', { value: pointerId })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  return event
}

describe('useSceneDrag', () => {
  let element: HTMLDivElement
  let input: { current: SceneInputValues }

  beforeEach(() => {
    element = document.createElement('div')
    document.body.append(element)
    // jsdom does not implement pointer capture; the hook only needs it to not throw.
    element.setPointerCapture = vi.fn()
    element.releasePointerCapture = vi.fn()
    element.hasPointerCapture = vi.fn().mockReturnValue(true)

    input = { current: { scroll: 0, pointerX: 0, pointerY: 0, dragRaw: 0, isDragging: false } }
  })

  function mount(enabled = true) {
    return renderHook(() => useSceneDrag({ current: element }, input, enabled))
  }

  it('ignores movement below the click threshold, so taps still reach the scene', () => {
    mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 102 }))

    expect(input.current.dragRaw).toBe(0)
    expect(input.current.isDragging).toBe(false)
    expect(element.setPointerCapture).not.toHaveBeenCalled()
  })

  it('rotates once the threshold is passed, and does not jump by the threshold', () => {
    mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 110 }))

    expect(input.current.isDragging).toBe(true)
    expect(element.dataset.dragging).toBe('true')
    // The 10px that crossed the threshold is consumed, not applied.
    expect(input.current.dragRaw).toBe(0)

    element.dispatchEvent(pointerEvent('pointermove', { clientX: 130 }))
    expect(input.current.dragRaw).toBeCloseTo(20 * 0.0045)
  })

  it('accumulates in both directions', () => {
    mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 200 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 190 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 150 }))

    expect(input.current.dragRaw).toBeCloseTo(-40 * 0.0045)
  })

  it('ends the drag on release without snapping the rotation away', () => {
    mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 120 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 160 }))
    const turned = input.current.dragRaw
    element.dispatchEvent(pointerEvent('pointerup', { clientX: 160 }))

    expect(input.current.isDragging).toBe(false)
    expect(element.dataset.dragging).toBeUndefined()
    // Still where the drag left it; the ease back to zero runs over the frames after.
    expect(input.current.dragRaw).toBe(turned)
  })

  it('eases all the way back to the default orientation after release', async () => {
    vi.useFakeTimers()
    try {
      mount()
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }))
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 120 }))
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 200 }))
      element.dispatchEvent(pointerEvent('pointerup', { clientX: 200 }))
      expect(input.current.dragRaw).toBeGreaterThan(0)

      // Part-way through, it should be on its way back but not yet arrived — the
      // return is an ease, not a snap.
      await vi.advanceTimersByTimeAsync(120)
      expect(input.current.dragRaw).toBeGreaterThan(0)
      expect(input.current.dragRaw).toBeLessThan(80 * 0.0045)

      await vi.advanceTimersByTimeAsync(4000)
      expect(input.current.dragRaw).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('picks a new drag up from wherever the return has reached', async () => {
    vi.useFakeTimers()
    try {
      mount()
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }))
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 120 }))
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 200 }))
      element.dispatchEvent(pointerEvent('pointerup', { clientX: 200 }))

      await vi.advanceTimersByTimeAsync(100)
      const partway = input.current.dragRaw

      // Grab again mid-return: the value carries on from where it is rather than
      // resetting or jumping back to where the last drag ended.
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 300 }))
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 320 }))
      expect(input.current.dragRaw).toBe(partway)

      // And the return is no longer running, so the new drag is not fighting it.
      await vi.advanceTimersByTimeAsync(200)
      expect(input.current.dragRaw).toBe(partway)
    } finally {
      vi.useRealTimers()
    }
  })

  it('stops on pointercancel, which is how a vertical touch scroll ends a drag', () => {
    mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100, pointerType: 'touch' }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 130, pointerType: 'touch' }))
    expect(input.current.isDragging).toBe(true)

    element.dispatchEvent(pointerEvent('pointercancel', { clientX: 130, pointerType: 'touch' }))
    expect(input.current.isDragging).toBe(false)
  })

  it('gives touch a larger threshold than a mouse', () => {
    mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100, pointerType: 'touch' }))
    // Past the 4px mouse threshold, short of the 10px touch one.
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 106, pointerType: 'touch' }))

    expect(input.current.isDragging).toBe(false)
  })

  it('ignores secondary mouse buttons', () => {
    mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100, button: 2 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 200 }))

    expect(input.current.dragRaw).toBe(0)
  })

  it('does nothing at all when disabled', () => {
    mount(false)
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 200 }))

    expect(input.current.dragRaw).toBe(0)
    expect(input.current.isDragging).toBe(false)
  })

  it('releases a drag still in progress when it unmounts', () => {
    const { unmount } = mount()
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 100 }))
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 200 }))
    expect(input.current.isDragging).toBe(true)

    unmount()
    expect(input.current.isDragging).toBe(false)
    expect(element.dataset.dragging).toBeUndefined()
  })
})
