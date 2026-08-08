import { AboutSection } from '@/components/about/AboutSection'
import { AssistantCallout } from '@/components/chat/AssistantCallout'
import { ContactSection } from '@/components/contact/ContactSection'
import { Hero } from '@/components/hero/Hero'
import { PageAtmosphere } from '@/components/layout/PageAtmosphere'
import { ProjectsSection } from '@/components/projects/ProjectsSection'

/**
 * Section order is an argument: who I am, what I built, how to reach me. Evidence
 * before the ask — Projects follows About directly, since the projects themselves are
 * the evidence and nothing else needs to stand between the introduction and the work.
 *
 * Writing deliberately is not here. A three-post teaser competed with the projects
 * grid immediately above it and sent people off the page before the ask; the blog is
 * its own destination, reached from the nav.
 *
 * Each section owns its own reveal animation and its own heading, so this file stays
 * a table of contents rather than a layout — the `<Section>` primitive carries the
 * shared rhythm.
 */
export function HomePage() {
  return (
    <main>
      <Hero />
      {/* One environment for the whole run below the hero — see PageAtmosphere. */}
      <div className="relative isolate">
        <PageAtmosphere />
        <AboutSection />
        <ProjectsSection />
        <AssistantCallout />
        <ContactSection />
      </div>
    </main>
  )
}
