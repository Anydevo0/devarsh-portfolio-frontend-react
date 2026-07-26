import { Reveal } from '@/components/common/Reveal'
import { ContactForm } from '@/components/contact/ContactForm'
import { ExperienceTimeline } from '@/components/experience/ExperienceTimeline'
import { Hero } from '@/components/hero/Hero'
import { ManifestBand } from '@/components/hero/ManifestBand'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { SkillsSection } from '@/components/skills/SkillsSection'

export function HomePage() {
  return (
    <main>
      <Hero />
      <Reveal>
        <ManifestBand />
      </Reveal>
      <Reveal>
        <SkillsSection />
      </Reveal>
      <Reveal>
        <ExperienceTimeline />
      </Reveal>
      <Reveal>
        <section id="projects" className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Selected work</h2>
          <div className="mt-10">
            <ProjectGrid />
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section id="contact" className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Get in touch</h2>
          <div className="mt-10 max-w-lg">
            <ContactForm />
          </div>
        </section>
      </Reveal>
    </main>
  )
}
