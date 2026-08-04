import { Reveal } from '@/components/common/Reveal'
import { Section } from '@/components/layout/Section'
import { useSiteContent } from '@/lib/siteContent/useSiteContent'

/** One accent per card, cycled — the only place the three accents appear together. */
const ACCENTS = ['from-pulse', 'from-beam', 'from-halo'] as const

/**
 * About. Leads with the hero's intro paragraph set large — the one place on the page
 * where body copy is allowed to be the focal point — then breaks the work into three
 * areas of focus.
 *
 * All copy here comes from the client-side content store, so it stays editable at
 * /admin/content without a deploy.
 */
export function AboutSection() {
  const { hero, focus } = useSiteContent()

  return (
    <Section
      id="about"
      route="GET /about"
      title="Systems built for real-world complexity"
      lede={hero.intro}
    >
      <Reveal>
        <p className="border-pulse/40 text-mist/85 max-w-3xl border-l-2 pl-6 text-lg leading-8">
          {focus.intro}
        </p>
      </Reveal>

      {focus.eyebrow && (
        <Reveal delay={0.05}>
          <p className="text-fog mt-16 font-mono text-xs tracking-[0.2em] uppercase">
            {focus.eyebrow.replace(/^\/\/\s*/, '')}
          </p>
        </Reveal>
      )}

      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {focus.highlights.map((highlight, index) => (
          <li key={highlight.title} className="h-full">
            <Reveal delay={index * 0.07} className="h-full">
              <article className="glass sheen group relative flex h-full flex-col rounded-2xl p-7 transition-transform duration-500 hover:-translate-y-1.5">
                {/* A hairline of accent along the top edge, fading out to the right —
                    what distinguishes the three cards without colouring the whole card. */}
                <span
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent ${ACCENTS[index % ACCENTS.length]}`}
                  aria-hidden="true"
                />
                <h3 className="font-tech text-mist text-lg font-semibold tracking-tight">
                  {highlight.title}
                </h3>
                <p className="text-fog mt-3 flex-1 text-sm leading-7">{highlight.text}</p>
                {highlight.tags.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {highlight.tags.map((tag) => (
                      <li
                        key={tag}
                        className="border-edge bg-void/50 text-fog/90 group-hover:border-pulse/25 rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] transition-colors"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
