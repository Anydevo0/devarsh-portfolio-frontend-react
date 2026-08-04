import { TimelineItem } from './TimelineItem'

import { Section } from '@/components/layout/Section'

/** Newest first. `isCurrent` drives the live marker; the list order carries the sequence. */
const EXPERIENCE = [
  {
    company: 'Simform, Ahmedabad, India',
    role: 'Software Engineer',
    dateRange: 'July 2025 — Present',
    isCurrent: true,
    description:
      'Contributed to a customized ERP solution within a multi-ERP ecosystem for managing semiconductor sample-chip orders and related operational workflows, and other than that worked on improving REST API design, test coverage with pytest and mocks, structured CloudWatch logging, secure AWS S3 upload APIs, and SSE-based streaming for chunked LangGraph responses in an AI powered Fintech application.',
  },
  {
    company: 'Simform, Ahmedabad, India',
    role: 'Software Engineer Intern',
    dateRange: 'Jan 2025 — July 2025',
    description:
      'Built backend features with Django, FastAPI, and Flask across SQL and NoSQL databases, implemented end-to-end RESTful APIs with Django ORM and SQLAlchemy, and developed asynchronous web scraping solutions with Beautiful Soup and Selenium.',
  },
]

export function ExperienceTimeline() {
  return (
    <Section
      id="experience"
      route="GET /experience"
      title="Where I've shipped"
      lede="Backend and AI systems work in production, on teams and against real deadlines."
    >
      {/* An ordered list, because the order is the information. The rail is a gradient
          on the list itself, fading out at the bottom so the timeline reads as
          continuing rather than stopping at a hard end-cap.

          `left-[5px]` puts the rail's centre at 5.5px, which is where the 10px markers
          in TimelineItem centre too — the two have to be set together or the dots sit
          visibly off the line. */}
      <ol className="from-pulse/70 via-fog/30 relative flex flex-col gap-6 before:absolute before:top-3 before:bottom-3 before:left-[5px] before:w-px before:bg-gradient-to-b before:to-transparent">
        {EXPERIENCE.map((item, index) => (
          <TimelineItem key={`${item.company}-${item.role}`} {...item} delay={index * 0.08} />
        ))}
      </ol>
    </Section>
  )
}
