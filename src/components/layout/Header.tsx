import { useState } from 'react'
import { Link } from 'react-router'

import { API_BASE_URL } from '@/lib/env'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-tech text-lg font-bold text-mist">
          Devarsh Chhatrala
        </Link>
        <nav className="hidden gap-7 font-mono text-xs tracking-wide uppercase sm:flex">
          <a href="#skills" className="text-fog transition-colors hover:text-pulse">
            Skills
          </a>
          <a href="#experience" className="text-fog transition-colors hover:text-pulse">
            Experience
          </a>
          <a href="#projects" className="text-fog transition-colors hover:text-pulse">
            Work
          </a>
          <Link to="/blog" className="text-fog transition-colors hover:text-pulse">
            Writing
          </Link>
          <a
            href={`${API_BASE_URL}/resume`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fog transition-colors hover:text-pulse"
          >
            Resume
          </a>
          <a href="#contact" className="text-fog transition-colors hover:text-pulse">
            Contact
          </a>
        </nav>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="text-mist sm:hidden"
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-edge px-6 py-4 font-mono text-xs tracking-wide uppercase sm:hidden">
          <a
            href="#skills"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 text-fog hover:bg-panel hover:text-pulse"
          >
            Skills
          </a>
          <a
            href="#experience"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 text-fog hover:bg-panel hover:text-pulse"
          >
            Experience
          </a>
          <a
            href="#projects"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 text-fog hover:bg-panel hover:text-pulse"
          >
            Work
          </a>
          <Link
            to="/blog"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 text-fog hover:bg-panel hover:text-pulse"
          >
            Writing
          </Link>
          <a
            href={`${API_BASE_URL}/resume`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 text-fog hover:bg-panel hover:text-pulse"
          >
            Resume
          </a>
          <a
            href="#contact"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 text-fog hover:bg-panel hover:text-pulse"
          >
            Contact
          </a>
        </nav>
      )}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-6"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
