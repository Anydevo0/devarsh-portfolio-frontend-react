import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

import { CloseIcon, DownloadIcon, MenuIcon } from '@/components/common/icons'
import { API_BASE_URL } from '@/lib/env'

/**
 * Two destinations, deliberately.
 *
 * The home page is one continuous argument — about, work, contact — and a nav listing
 * every section duplicated the scroll rather than helping anyone. What is left is the
 * one in-page anchor worth jumping to and the one place that is genuinely a different
 * page.
 */
const NAV_ITEMS = [
  { label: 'About Me', to: '/#about' },
  { label: 'My Blogs', to: '/blog' },
]

/**
 * The header is transparent over the hero and resolves into glass once the page
 * scrolls — so the 3D scene reads full-bleed on arrival, and the nav still has a
 * surface to sit on everywhere else.
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let frame = 0
    function read() {
      frame = 0
      // Only ever flips between two values, so this drives at most one re-render per
      // crossing of the threshold rather than one per scroll event.
      setIsScrolled(window.scrollY > 24)
    }
    function handleScroll() {
      if (frame === 0) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Never let the mobile menu survive a route change. Adjusted during render rather
  // than in an effect: an effect would paint one frame of the new page with the old
  // menu still open, and React re-runs this before committing anything to the DOM.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        isScrolled ? 'border-edge/80 bg-void/75 backdrop-blur-xl' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          to="/"
          className="font-tech text-mist hover:text-pulse text-base font-semibold tracking-tight whitespace-nowrap transition-colors"
        >
          Devarsh Chhatrala
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map(({ label, to }) => (
            <NavItem key={to} to={to} className="px-3.5 py-2">
              {label}
            </NavItem>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`${API_BASE_URL}/resume`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-soft text-mist hover:text-pulse hidden items-center gap-2 rounded-full px-4 py-2 font-mono text-xs transition-colors sm:inline-flex"
          >
            <DownloadIcon className="size-3.5" />
            Resume
          </a>

          <button
            type="button"
            onClick={() => setIsMenuOpen((previous) => !previous)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-mist glass-soft flex size-10 items-center justify-center rounded-full sm:hidden"
          >
            {isMenuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          aria-label="Main"
          className="border-edge/80 bg-void/95 flex flex-col gap-1 border-t px-6 py-4 backdrop-blur-xl sm:hidden"
        >
          {NAV_ITEMS.map(({ label, to }) => (
            <NavItem
              key={to}
              to={to}
              onClick={() => setIsMenuOpen(false)}
              className="hover:bg-panel/60 rounded-lg px-3 py-3"
            >
              {label}
            </NavItem>
          ))}
          <a
            href={`${API_BASE_URL}/resume`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="text-fog hover:bg-panel/60 hover:text-pulse flex items-center gap-2 rounded-lg px-3 py-3 font-mono text-xs tracking-wide uppercase"
          >
            <DownloadIcon className="size-3.5" />
            Resume
          </a>
        </nav>
      )}
    </header>
  )
}

/**
 * A nav destination.
 *
 * `About Me` routes through `/#about` rather than a bare `#about`: from /blog a bare
 * fragment would target an element that page does not have, and the link would
 * silently do nothing. Going via the path navigates home first, and `useHashScroll`
 * in Layout performs the scroll, since react-router does not restore fragments.
 */
function NavItem({
  to,
  children,
  className = '',
  onClick,
}: {
  to: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-fog hover:text-mist font-mono text-xs tracking-wide whitespace-nowrap uppercase transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}
