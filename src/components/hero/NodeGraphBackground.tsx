import { useEffect, useRef } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface GraphNode {
  x: number
  y: number
  vx: number
  vy: number
}

const NODE_SPACING = 130
const LINK_DISTANCE = 150
const DRIFT_SPEED = 0.12

/**
 * The hero's signature element: a faint, slow-drifting node graph read as a
 * distributed-systems diagram rather than decorative particles — derived from the
 * subject (backend/AI systems engineering), not a generic ambient effect. Seeded
 * once and never animated when the visitor prefers reduced motion.
 */
export function NodeGraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !parent || !ctx) return

    let width = 0
    let height = 0
    let nodes: GraphNode[] = []
    let frameId = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent!.clientWidth
      height = parent!.clientHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(16, Math.round((width * height) / (NODE_SPACING * NODE_SPACING)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * DRIFT_SPEED,
        vy: (Math.random() - 0.5) * DRIFT_SPEED,
      }))
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)

      for (const [i, a] of nodes.entries()) {
        for (const b of nodes.slice(i + 1)) {
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < LINK_DISTANCE) {
            ctx!.strokeStyle = `rgba(139, 147, 166, ${(1 - dist / LINK_DISTANCE) * 0.16})`
            ctx!.lineWidth = 1
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      ctx!.fillStyle = 'rgba(91, 127, 255, 0.5)'
      for (const node of nodes) {
        ctx!.beginPath()
        ctx!.arc(node.x, node.y, 1.6, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    function step() {
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1
      }
      draw()
      frameId = requestAnimationFrame(step)
    }

    resize()
    draw()
    if (!prefersReducedMotion) {
      frameId = requestAnimationFrame(step)
    }

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameId)
    }
  }, [prefersReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
