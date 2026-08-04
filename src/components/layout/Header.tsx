import { type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

import { CloseIcon, DownloadIcon, MenuIcon } from '@/components/common/icons'
import { API_BASE_URL } from '@/lib/env'

/** Home-page sections, in the order they appear on the page. */
const SECTIONS = [
  { label: 'About', hash: '#about' },
  { label: 'Skills', hash: '#skills' },
  { label: 'Experience', hash: '#experience' },
  { label: 'Work', hash: '#projects' },
  { label: 'Writing', hash: '#writing' },
  { label: 'Contact', hash: '#contact' },
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
          className="font-tech text-mist text-base font-bold tracking-tight whitespace-nowrap"
        >
          Devarsh
          <span className="text-pulse">.</span>
          <span className="text-fog font-normal">chhatrala</span>
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map(({ label, hash }) => (
            <SectionLink key={hash} hash={hash} className="px-3 py-2">
              {label}
            </SectionLink>
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
            className="text-mist glass-soft flex size-10 items-center justify-center rounded-full lg:hidden"
          >
            {isMenuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          aria-label="Sections"
          className="border-edge/80 bg-void/95 flex flex-col gap-1 border-t px-6 py-4 backdrop-blur-xl lg:hidden"
        >
          {SECTIONS.map(({ label, hash }) => (
            <SectionLink
              key={hash}
              hash={hash}
              onClick={() => setIsMenuOpen(false)}
              className="hover:bg-panel/60 rounded-lg px-3 py-3"
            >
              {label}
            </SectionLink>
          ))}
          <a
            href={`${API_BASE_URL}/resume`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="text-fog hover:bg-panel/60 hover:text-pulse flex items-center gap-2 rounded-lg px-3 py-3 font-mono text-xs tracking-wide uppercase sm:hidden"
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
 * Links to a home-page section from anywhere on the site.
 *
 * A bare `#skills` only works if you are already on the home page — from /blog it
 * would set a fragment against a page that has no such element, and the nav would
 * silently do nothing. Routing through `/#skills` navigates home first, and
 * `useHashScroll` in Layout performs the scroll, since react-router does not restore
 * fragments on its own.
 */
function SectionLink({
  hash,
  children,
  className = '',
  onClick,
}: {
  hash: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <Link
      to={`/${hash}`}
      onClick={onClick}
      className={`text-fog hover:text-mist font-mono text-xs tracking-wide whitespace-nowrap uppercase transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}
