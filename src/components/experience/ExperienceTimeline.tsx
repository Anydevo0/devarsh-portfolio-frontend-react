import { TimelineItem } from './TimelineItem'

const EXPERIENCE = [
  {
    company: 'Simform, Ahmedabad, India',
    role: 'Software Engineer',
    dateRange: 'July 2025 — Present',
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
    <section id="experience" className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <h2 className="font-tech text-3xl font-bold text-mist sm:text-4xl">Experience</h2>
      <div className="mt-10 flex flex-col gap-8">
        {EXPERIENCE.map((item, index) => (
          <TimelineItem
            key={`${item.company}-${item.role}`}
            {...item}
            isLast={index === EXPERIENCE.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
