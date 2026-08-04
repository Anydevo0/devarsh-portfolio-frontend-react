import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Scrolls to `location.hash` after a client-side navigation.
 *
 * The browser only resolves fragments on a real document load, so following
 * `/#projects` from another route lands at the top of the home page with the right
 * URL and the wrong scroll position. react-router does not fill this in, so the
 * shell does.
 *
 * The lookup is deferred by one frame because the target section may not be in the
 * DOM yet at the moment the route commits.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(hash)
      // `scroll-padding-top` on <html> keeps the sticky header off the heading.
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
}
