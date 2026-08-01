import type { CSSProperties } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { usePointerParallax } from '@/hooks/usePointerParallax'
import { useSiteContent } from '@/lib/siteContent/useSiteContent'

import { NodeGraphBackground } from './NodeGraphBackground'

export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animate = !prefersReducedMotion
  const { hero } = useSiteContent()
  const parallax = usePointerParallax(8)

  const offsetX = hero.profileImageOffsetX + (animate ? parallax.offset.x : 0)
  const offsetY = hero.profileImageOffsetY + (animate ? parallax.offset.y : 0)

  return (
    <section className="bg-void text-mist relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className={`hero-glow hero-glow--one ${animate ? 'animate-drift-one' : ''}`} />
        <div className={`hero-glow hero-glow--two ${animate ? 'animate-drift-two' : ''}`} />
      </div>
      <NodeGraphBackground />
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-start gap-12 px-6 pt-28 pb-20 sm:pt-36 sm:pb-28 lg:grid-cols-[1.15fr_auto] lg:gap-16">
        <div>
          <p
            className={`text-pulse flex flex-wrap items-center gap-x-2 font-mono text-sm tracking-wide uppercase ${animate ? 'animate-rise' : ''}`}
          >
            <span>{hero.designation}</span>
            <span className="text-fog/50" aria-hidden="true">
              ·
            </span>
            <span>{hero.tagline}</span>
          </p>
          <p
            className={`font-tech text-fog mt-4 text-lg font-medium tracking-wide sm:text-xl ${animate ? 'animate-rise' : ''}`}
            style={animate ? { animationDelay: '40ms' } : undefined}
          >
            {hero.name}
          </p>
          <h1
            className={`font-tech mt-4 max-w-[19ch] text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-[3.75rem] ${
              animate ? 'animate-rise' : ''
            }`}
            style={animate ? { animationDelay: '100ms' } : undefined}
          >
            {hero.headline}
          </h1>
          <p
            className={`text-fog mt-7 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-8 ${animate ? 'animate-rise' : ''}`}
            style={animate ? { animationDelay: '180ms' } : undefined}
          >
            {hero.intro}
          </p>
          <div
            className={`mt-9 flex flex-wrap items-center gap-4 ${animate ? 'animate-rise' : ''}`}
            style={animate ? { animationDelay: '240ms' } : undefined}
          >
            <a
              href={hero.ctaPrimary.href}
              className="bg-pulse text-void hover:shadow-pulse/20 rounded-full px-6 py-2.5 font-mono text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110"
            >
              {hero.ctaPrimary.label}
            </a>
            <a
              href={hero.ctaSecondary.href}
              className="border-edge text-mist hover:border-pulse hover:text-pulse rounded-full border px-6 py-2.5 font-mono text-sm transition-colors"
            >
              {hero.ctaSecondary.label}
            </a>
          </div>
          {hero.availability && (
            <p
              className={`text-fog mt-8 flex items-center gap-2 font-mono text-xs tracking-wide uppercase ${animate ? 'animate-rise' : ''}`}
              style={animate ? { animationDelay: '300ms' } : undefined}
            >
              <span className="animate-live-pulse bg-live size-2 rounded-full" aria-hidden="true" />
              {hero.availability}
            </p>
          )}
        </div>
        <div
          className={`group relative mx-auto flex justify-center lg:mx-0 lg:justify-end ${animate ? 'animate-rise' : ''}`}
          style={{
            animationDelay: animate ? '140ms' : undefined,
            transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
            transition: 'transform 0.3s ease-out',
          }}
          onPointerMove={animate ? parallax.handlePointerMove : undefined}
          onPointerLeave={animate ? parallax.handlePointerLeave : undefined}
        >
          {hero.profileImageEffects && (
            <>
              <div className="portrait-aura pointer-events-none -z-10" aria-hidden="true" />
              <div className="portrait-ring pointer-events-none -z-10" aria-hidden="true" />
            </>
          )}
          <div
            className="origin-bottom transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            style={{ '--portrait-scale': hero.profileImageScale } as CSSProperties}
          >
            <img
              src={hero.profileImage}
              alt={hero.name}
              className="portrait-img w-auto max-w-[13rem] object-contain object-bottom sm:max-w-[15rem] lg:max-w-[17rem] xl:max-w-[18rem]"
              style={{
                filter: hero.profileImageEffects
                  ? 'drop-shadow(0 35px 45px rgba(0,0,0,0.45))'
                  : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
