import { type RefObject, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'

import { SceneBoundary } from '@/components/three/SceneBoundary'
import { PITCH_LIMITS, YAW_LIMITS, YAW_OVERSHOOT } from '@/components/three/lib/rigLimits'
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
  const quality = useSceneQuality()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isLightOn = useDeskLight()
  const [showSwitchHint, setShowSwitchHint] = useState(() => !hasStoredPreference())
  const [showDragHint, setShowDragHint] = useState(true)

  // The one and only render this whole gesture is allowed to cause. `useSceneInput`
  // fires it on the first drag and never again, so the hint's dismissal costs a single
  // pass and the thousand pointer events after it cost none.
  const handleFirstDrag = useCallback(() => setShowDragHint(false), [])

  const { input, setFrameRequest } = useSceneInput(sectionRef, {
    // The whole hero, not just the canvas box. The scene bleeds behind the text column
    // on a wide screen, so a visitor who grabs the model where they can see it over the
    // headline is grabbing something that looks exactly like the part that turns.
    dragTargetRef: sectionRef,
    onFirstDrag: handleFirstDrag,
    yawLimits: YAW_LIMITS,
    pitchLimits: PITCH_LIMITS,
    yawOvershoot: YAW_OVERSHOOT,
    // Reduced motion keeps the control and loses the flourish: the rig still goes home
    // on release, it just arrives on the frame the visitor lets go instead of easing.
    easeReturn: !prefersReducedMotion,
  })

  const handleToggleLight = useCallback(() => {
    setDeskLight(!isLightOn)
    setShowSwitchHint(false)
  }, [isLightOn])

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
      // The gesture itself is bound to the hero <section>, not to this box — see the
      // `dragTargetRef` above. This element is only where the canvas is *drawn*, and on
      // a large screen that is the right-hand 62%; binding the drag here too meant the
      // left third of the hero looked identical and did nothing when pulled. The cursor
      // and `touch-action` therefore live on the section as well, with the gesture.
      className={`absolute inset-0 select-none motion-reduce:opacity-70 lg:left-[38%]`}
    >
      <SceneBoundary fallback={<ScenePoster />}>
        <Suspense fallback={<ScenePoster />}>
          {canRender ? (
            <DeveloperScene
              input={input}
              setFrameRequest={setFrameRequest}
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

      {canRender && <DragHint visible={showDragHint} animate={!prefersReducedMotion} />}
    </div>
  )
}

/**
 * Tells the visitor the model is theirs to turn.
 *
 * The canvas cannot advertise itself: it has no affordance, no hover state worth the
 * name, and the grab cursor only exists once a mouse is already over it — which rules
 * out every touch device. So it is said in words, once, and then it goes away. Like
 * the wall switch's pulse, a hint that keeps asking after it has been understood is
 * just noise, and this one sits over a moving scene where noise is expensive.
 *
 * Two elements rather than one because two different things animate: the wrapper fades
 * the hint out for good, the inner pill breathes while it is still waiting. Writing
 * both to the same element would mean a CSS transition and a CSS animation fighting
 * over `opacity`, and the animation wins — the hint would never leave.
 *
 * Vertical position is a percentage, not a fixed offset: `.scrim-y` ramps to solid over
 * the bottom quarter of the hero, and anything parked in that ramp is washed out at
 * whatever viewport height happens to put it there.
 *
 * Desktop only, and not for want of trying. Below `lg` the canvas stops being its own
 * column and becomes a backdrop directly behind the copy, at which point every place
 * this could go is already owned by the text or by the scrim — and a hint that lands
 * on top of the name and the call to action costs more than the affordance it buys.
 * The gesture still works there; it is only the label that is absent.
 */
function DragHint({ visible, animate }: { visible: boolean; animate: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-[20%] left-1/2 hidden -translate-x-1/2 transition-opacity duration-700 lg:block ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p
        className={`glass-soft text-mist/70 rounded-full px-3.5 py-1 font-mono text-[0.6875rem] tracking-[0.14em] whitespace-nowrap uppercase ${
          animate ? 'animate-hint-breathe' : ''
        }`}
      >
        Click &amp; drag to rotate
      </p>
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
