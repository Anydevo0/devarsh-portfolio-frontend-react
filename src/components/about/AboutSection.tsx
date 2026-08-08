import { ArrowDoodle, ScribbleDoodle, UnderlineDoodle } from './Doodles'
import { StickyNote } from './StickyNote'

import { Reveal } from '@/components/common/Reveal'
import { Section } from '@/components/layout/Section'
import { useSiteContent } from '@/lib/siteContent/useSiteContent'

/**
 * Wraps one phrase from a CMS string in the highlighter-style mark, degrading to
 * plain text if an edit in /admin ever removes the exact phrase. A real rich-text
 * field would be the general solution; for the one phrase this page wants to pick
 * out, a plain-string split does the job without asking the content model to carry
 * markup it uses nowhere else.
 */
function withHighlight(text: string, phrase: string) {
  const index = text.indexOf(phrase)
  if (index === -1) return text
  return (
    <>
      {text.slice(0, index)}
      <mark className="notebook-highlight">{phrase}</mark>
      {text.slice(index + phrase.length)}
    </>
  )
}

/**
 * About, redone as a spread from an engineering notebook rather than a résumé
 * section: a handwritten intro, then four sticky notes standing in for the "focus
 * areas" cards every other portfolio uses. No route eyebrow — a handwritten heading
 * and an HTTP method sitting on the same line undercut each other, and the handwriting
 * already says what kind of section this is. The heading is handwritten rather than
 * the display face the rest of the page uses, which is why `Section.title` takes a
 * node here instead of the usual string.
 *
 * All copy still comes from the client-side content store, so the heading, the
 * intro, and all four notes stay editable at /admin/content without a deploy.
 */
export function AboutSection() {
  const { focus } = useSiteContent()

  return (
    <Section
      id="about"
      title={
        <span className="relative inline-block">
          <span className="font-script text-lit -rotate-1 block text-4xl font-bold tracking-normal sm:text-5xl">
            {focus.heading}
          </span>
          <UnderlineDoodle className="text-saffron/70 mt-1 block h-3 w-40 sm:w-48" />
          <ScribbleDoodle className="text-saffron/40 absolute -top-5 -right-8 hidden h-6 w-6 sm:block" />
        </span>
      }
    >
      <Reveal delay={0.1}>
        <p className="font-script text-mist/85 max-w-2xl text-lg leading-8">
          {withHighlight(focus.intro, 'turning LLMs into practical products')}
        </p>
      </Reveal>

      {focus.eyebrow && (
        <Reveal delay={0.18} className="mt-14 flex items-center gap-2">
          <ArrowDoodle className="text-fog/50 h-6 w-9 -translate-y-1 rotate-90" />
          <p className="text-fog font-mono text-xs tracking-[0.2em] uppercase">
            {focus.eyebrow.replace(/^\/\/\s*/, '')}
          </p>
        </Reveal>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {focus.notes.map((note, index) => (
          <li key={note.title} className="h-full">
            <Reveal delay={0.24 + index * 0.09} className="h-full">
              <StickyNote note={note} index={index} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
