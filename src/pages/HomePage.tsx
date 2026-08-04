import { AboutSection } from '@/components/about/AboutSection'
import { ContactSection } from '@/components/contact/ContactSection'
import { ExperienceTimeline } from '@/components/experience/ExperienceTimeline'
import { Hero } from '@/components/hero/Hero'
import { ProjectsSection } from '@/components/projects/ProjectsSection'
import { SkillsSection } from '@/components/skills/SkillsSection'
import { WritingSection } from '@/components/writing/WritingSection'

/**
 * Section order is an argument: who I am, what I know, where I've done it, what I
 * built, what I think, how to reach me. Evidence before the ask.
 *
 * Each section owns its own reveal animation and its own heading, so this file stays
 * a table of contents rather than a layout — the `<Section>` primitive carries the
 * shared rhythm.
 */
export function HomePage() {
  return (
    <main>
      <Hero />
      <AboutSection />
      <SkillsSection />
      <ExperienceTimeline />
      <ProjectsSection />
      <WritingSection />
      <ContactSection />
    </main>
  )
}
