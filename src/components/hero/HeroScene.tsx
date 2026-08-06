import { type RefObject, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'

import { SceneBoundary } from '@/components/three/SceneBoundary'
import { useSceneDrag } from '@/components/three/lib/useSceneDrag'
import { useSceneInput } from '@/components/three/lib/useSceneInput'
import { supportsWebGL } from '@/components/three/lib/webgl'
import { useSceneQuality } from '@/components/three/useSceneQuality'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { hasStoredPreference, setDeskLight } from '@/lib/deskLight/store'
import { useDeskLight } from '@/lib/deskLight/useDeskLight'

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
  const isLightOn = useDeskLight()
  const [showSwitchHint, setShowSwitchHint] = useState(() => !hasStoredPreference())

  const handleToggleLight = useCallback(() => {
    setDeskLight(!isLightOn)
    setShowSwitchHint(false)
  }, [isLightOn])

  // Resolved once, lazily, on first render. The check itself is cheap; what defers
  // the actual cost is `lazy` below — the headline paints from the main bundle while
  // the three.js chunk is still in flight.
  const [canRender] = useState(supportsWebGL)
  const [isOnScreen, setIsOnScreen] = useState(true)

  // Drag-to-rotate is off for reduced-motion visitors. The scene renders a single
  // static frame for them (`frameloop="demand"`), so a drag would accumulate rotation
  // that never gets drawn — and a grab cursor promising motion the page has been asked
  // not to produce is worse than no affordance at all.
  const canDrag = canRender && !prefersReducedMotion
  useSceneDrag(containerRef, input, canDrag)

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
      className={`absolute inset-0 lg:left-[38%] motion-reduce:opacity-70 ${
        canDrag ? 'scene-drag' : ''
      }`}
    >
      <SceneBoundary fallback={<ScenePoster />}>
        <Suspense fallback={<ScenePoster />}>
          {canRender ? (
            <DeveloperScene
              input={input}
              quality={quality}
              animate={!prefersReducedMotion}
              active={isOnScreen}
              isLightOn={isLightOn}
              onToggleLight={handleToggleLight}
              showSwitchHint={showSwitchHint}
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

