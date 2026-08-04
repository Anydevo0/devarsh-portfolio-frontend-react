import { SkillCategory } from './SkillCategory'

import { Reveal } from '@/components/common/Reveal'
import { Section } from '@/components/layout/Section'

const SKILL_CATEGORIES = [
  {
    title: 'Languages',
    accent: 'bg-pulse',
    skills: ['Python', 'JavaScript', 'C++', 'Java', 'SQL'],
  },
  {
    title: 'Backend',
    accent: 'bg-beam',
    skills: ['FastAPI', 'Django REST Framework', 'Flask', 'REST APIs', 'GraphQL', 'Node.js'],
  },
  {
    title: 'Cloud & Infrastructure',
    accent: 'bg-halo',
    skills: [
      'AWS',
      'EC2',
      'ECS',
      'ECR',
      'S3',
      'CloudWatch',
      'Azure',
      'Blob Storage',
      'App Service',
      'ACR',
    ],
  },
  {
    title: 'Tools & Data',
    accent: 'bg-live',
    skills: [
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Celery',
      'Docker',
      'Selenium',
      'Beautiful Soup',
      'Postman',
    ],
  },
]

export function SkillsSection() {
  return (
    <Section
      id="skills"
      route="GET /skills"
      title="The stack I work in"
      lede="API-driven systems in Python and FastAPI, deployed on AWS with Docker, Celery and Redis — plus the automation tooling that keeps scraping, observability and async work running."
    >
      <Reveal>
        {/* A 1px grid gap over an edge-coloured surface draws every divider at once,
            so no cell carries its own border and adjacent rules never double up. */}
        <div className="bg-edge/70 grid grid-cols-1 gap-px overflow-hidden rounded-3xl sm:grid-cols-2">
          {SKILL_CATEGORIES.map((category) => (
            <SkillCategory
              key={category.title}
              title={category.title}
              skills={category.skills}
              accent={category.accent}
            />
          ))}
        </div>
      </Reveal>
    </Section>
  )
}
