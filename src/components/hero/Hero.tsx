import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

// TODO(devarsh): replace all three placeholders below with your real copy.
const ROLE = 'SOFTWARE ENGINEER • BACKEND & AI SYSTEMS'
const HEADLINE = 'Building scalable systems and intelligent AI applications.'
const VALUE_PROP =
  'I design and develop production-grade systems using Python, FastAPI, cloud platforms, and modern AI frameworks. My work focuses on scalable APIs, intelligent workflows, and LLM-powered applications.'

export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animate = !prefersReducedMotion

  return (
    <section className="mx-auto max-w-4xl px-6 pt-24 pb-20 sm:pt-32 sm:pb-24">
      <p
        className={`font-mono text-sm tracking-wide text-wire uppercase ${animate ? 'animate-rise' : ''}`}
      >
        {ROLE}
      </p>
      <h1
        className={`mt-5 max-w-[16ch] text-4xl leading-[1.1] font-bold text-balance font-display sm:text-5xl lg:text-6xl ${
          animate ? 'animate-rise' : ''
        }`}
        style={animate ? { animationDelay: '80ms' } : undefined}
      >
        {HEADLINE}
      </h1>
      <p
        className={`mt-7 max-w-2xl text-lg text-ink/80 sm:text-xl ${animate ? 'animate-rise' : ''}`}
        style={animate ? { animationDelay: '160ms' } : undefined}
      >
        {VALUE_PROP}
      </p>
    </section>
  )
}
