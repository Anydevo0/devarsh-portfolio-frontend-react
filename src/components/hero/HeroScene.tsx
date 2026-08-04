import { type RefObject, Suspense, lazy, useEffect, useRef, useState } from 'react'

import { SceneBoundary } from '@/components/three/SceneBoundary'
import { useSceneInput } from '@/components/three/lib/useSceneInput'
import { useSceneQuality } from '@/components/three/useSceneQuality'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

// Lazy so three.js, drei and the whole workstation land in their own chunk. The
// initial bundle — and every route that is not the home page — never downloads it.
const DeveloperScene = lazy(() => import('@/components/three/DeveloperScene'))

/**
 * The hero's 3D layer: a workstation with a software engineer at it, sitting behind
 * the text column.
 *
 * Decorative, so it is hidden from assistive technology — everything the scene says
 * is also said in the hero's copy. It mounts only once the page has painted and only
 * where WebGL actually exists, and falls back to a poster everywhere else.
 */
export function HeroScene({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const input = useSceneInput(sectionRef)
  const quality = useSceneQuality()
  const prefersReducedMotion = usePrefersReducedMotion()

  // Resolved once, lazily, on first render. The check itself is cheap; what defers
  // the actual cost is `lazy` below — the headline paints from the main bundle while
  // the three.js chunk is still in flight.
  const [canRender] = useState(supportsWebGL)
  const [isOnScreen, setIsOnScreen] = useState(true)

  useEffect(() => {
    const element = containerRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry?.isIntersecting ?? false),
      { rootMargin: '150px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [canRender])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 lg:left-[38%] motion-reduce:opacity-70"
    >
      <SceneBoundary fallback={<ScenePoster />}>
        <Suspense fallback={<ScenePoster />}>
          {canRender ? (
            <DeveloperScene
              input={input}
              quality={quality}
              animate={!prefersReducedMotion}
              active={isOnScreen}
            />
          ) : (
            <ScenePoster />
          )}
        </Suspense>
      </SceneBoundary>
    </div>
  )
}

/**
 * Stand-in shown while the chunk loads, and permanently where WebGL is unavailable.
 * Occupies exactly the same box as the canvas and is built from the same palette, so
 * there is no layout shift and no moment where the hero looks broken.
 */
function ScenePoster() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="aurora aurora--pulse animate-drift-one" />
      <div className="aurora aurora--halo animate-drift-two" />
      <div
        className="absolute top-1/2 left-1/2 h-56 w-[26rem] max-w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-3xl opacity-60"
        style={{
          background:
            'linear-gradient(160deg, rgba(91,127,255,0.22), rgba(34,211,238,0.12) 45%, transparent 75%)',
          filter: 'blur(28px)',
        }}
      />
    </div>
  )
}

/**
 * Cheap, honest capability check: if a context cannot be created, three.js would
 * only fail later and louder. Also what keeps the jsdom test environment — which has
 * no WebGL — on the poster path instead of booting a renderer.
 */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}
