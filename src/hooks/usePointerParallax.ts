import { useState, type PointerEvent } from 'react'

interface ParallaxOffset {
  x: number
  y: number
}

/** Subtle mouse-tracked tilt for the hero portrait — mouse-only (touch drags would feel
 * broken) and left to the caller to disable under prefers-reduced-motion. */
export function usePointerParallax(maxOffset = 10) {
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 })

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    const relX = (event.clientX - rect.left) / rect.width - 0.5
    const relY = (event.clientY - rect.top) / rect.height - 0.5
    setOffset({ x: relX * maxOffset * 2, y: relY * maxOffset * 2 })
  }

  function handlePointerLeave() {
    setOffset({ x: 0, y: 0 })
  }

  return { offset, handlePointerMove, handlePointerLeave }
}
