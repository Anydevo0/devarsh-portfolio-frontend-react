import { useRef } from 'react'

import { HeroScene } from './HeroScene'

import {
  ArrowIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
} from '@/components/common/icons'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { API_BASE_URL } from '@/lib/env'
import { useSiteContent } from '@/lib/siteContent/useSiteContent'
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/siteInfo'

const SOCIALS = [
  { label: 'GitHub', href: GITHUB_URL, Icon: GitHubIcon },
  { label: 'LinkedIn', href: LINKEDIN_URL, Icon: LinkedInIcon },
  { label: 'Email', href: `mailto:${CONTACT_EMAIL}`, Icon: MailIcon },
]

/**
 * Split hero: type on the left, the workstation scene on the right.
 *
 * The halves are layered rather than columned — the canvas spans the whole section
 * and is inset from 38% on large screens, with a horizontal scrim washing the left
 * side back to solid. That lets the scene bleed off the right edge instead of sitting
 * in a box, while the text column keeps a guaranteed contrast floor regardless of
 * what the scene is doing behind it.
 *
 * The load-in stagger stays in CSS (`animate-rise` plus delays) rather than moving to
 * the animation library: it runs exactly once and costs nothing at runtime.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const animate = !prefersReducedMotion
  const { hero } = useSiteContent()

  const rise = animate ? 'animate-rise' : ''
  const delay = (ms: number) => (animate ? { animationDelay: `${ms}ms` } : undefined)

  return (
    <section
      ref={sectionRef}
      className="bg-void text-mist relative isolate flex min-h-svh items-center overflow-hidden"
    >
      <HeroScene sectionRef={sectionRef} />

      <div className="scrim-x pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
      <div className="scrim-y pointer-events-none absolute inset-0 z-10" aria-hidden="true" />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 py-32 sm:py-36">
        <div className="max-w-2xl">
          {hero.availability && (
            <p
              className={`glass-soft text-fog inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-3 font-mono text-xs tracking-wide ${rise}`}
              style={delay(0)}
            >
              <span
                className={`bg-live size-1.5 rounded-full ${animate ? 'animate-live-pulse' : ''}`}
                aria-hidden="true"
              />
              {hero.availability}
            </p>
          )}

          <h1
            className={`font-tech text-hero mt-7 font-bold tracking-[-0.035em] text-balance ${rise}`}
            style={delay(80)}
          >
            <span className="text-fog block text-[0.4em] font-medium tracking-[0.01em]">
              I&apos;m
            </span>
            <span className="text-lit">{hero.name}</span>
          </h1>

          <p
            className={`font-tech text-mist/90 mt-5 text-xl font-medium tracking-tight sm:text-2xl ${rise}`}
            style={delay(160)}
          >
            {hero.designation}
            <span className="text-pulse mx-2.5" aria-hidden="true">
              —
            </span>
            {hero.tagline}
          </p>

          <p className={`text-fog text-lede mt-6 max-w-xl ${rise}`} style={delay(230)}>
            {hero.headline}
          </p>

          <div
            className={`mt-10 flex flex-wrap items-center gap-3 ${rise}`}
            style={delay(310)}
          >
            <a
              href={hero.ctaPrimary.href}
              className="group bg-pulse text-void hover:shadow-pulse/25 inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110"
            >
              {hero.ctaPrimary.label}
              <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            {/* Served by the backend, not bundled — the resume is whatever `GET /resume`
                currently returns, so it can never go stale inside a build. */}
            <a
              href={`${API_BASE_URL}/resume`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass text-mist hover:text-pulse inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm transition-colors"
            >
              <DownloadIcon className="size-4" />
              Download resume
            </a>

            {/* Third tier, but still a defined button: stacked on mobile, a text-only
                link sat at a different left edge from the two pills above it. */}
            <a
              href={hero.ctaSecondary.href}
              className="border-edge text-fog hover:border-fog/40 hover:text-mist inline-flex items-center gap-2 rounded-full border px-6 py-3 font-mono text-sm transition-colors"
            >
              {hero.ctaSecondary.label}
            </a>
          </div>

          <ul className={`mt-12 flex items-center gap-3 ${rise}`} style={delay(380)}>
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="glass-soft text-fog hover:text-pulse flex size-11 items-center justify-center rounded-full transition-all hover:-translate-y-0.5"
                >
                  <Icon className="size-[1.15rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Signposts that scrolling drives the scene, rather than decorating the corner. */}
      <div
        className="text-fog/60 absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.625rem] tracking-[0.25em] uppercase lg:flex"
        aria-hidden="true"
      >
        Scroll
        <span className="from-fog/50 h-10 w-px bg-gradient-to-b to-transparent" />
      </div>
    </section>
  )
}
