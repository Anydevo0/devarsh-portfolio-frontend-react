import { ProjectGrid } from './ProjectGrid'

import { Section } from '@/components/layout/Section'

/**
 * Personal and open-source work — deliberately not "Selected work" or "Experience":
 * these are things built on my own time, not case studies from an employer, and the
 * heading and lede now say that directly instead of leaving it to be inferred. No
 * route eyebrow, for the same reason About drops it: it follows About directly now
 * that Skills and Experience are gone, and a second unlabelled, handwritten-adjacent
 * section in a row reads more like one continuing page than a label would.
 */
export function ProjectsSection() {
  return (
    <Section
      id="projects"
      title="Things I Built"
      lede="Some started as ideas, some started as learning, and some started because I wanted to see if I could actually build them."
    >
      <ProjectGrid />
    </Section>
  )
}
