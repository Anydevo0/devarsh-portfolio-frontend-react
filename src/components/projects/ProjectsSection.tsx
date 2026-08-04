import { ProjectGrid } from './ProjectGrid'

import { Section } from '@/components/layout/Section'

export function ProjectsSection() {
  return (
    <Section
      id="projects"
      route="GET /projects"
      title="Selected work"
      lede="Production systems and side projects — APIs, AI workflows, and the infrastructure underneath them."
    >
      <ProjectGrid />
    </Section>
  )
}
