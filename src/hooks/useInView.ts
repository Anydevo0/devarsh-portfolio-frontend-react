import { useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Fires once when the element scrolls into view, for a one-shot reveal
 * animation. Starts already-visible when the visitor prefers reduced motion,
 * rather than animating in on scroll at all. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isVisible, setIsVisible] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return { ref, isVisible }
}
