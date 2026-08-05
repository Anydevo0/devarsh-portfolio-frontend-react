import { TimelineItem } from './TimelineItem'

import { Section } from '@/components/layout/Section'

/**
 * Newest first — the order is the information, which is what earns the rail and the
 * markers here when the rest of the page avoids ordered decoration.
 */
const EXPERIENCE = [
  {
    company: 'Simform',
    location: 'Ahmedabad, India',
    role: 'Software Engineer',
    dateRange: 'July 2025 — Present',
    isCurrent: true,
    description:
      'Contributed to a customized ERP solution within a multi-ERP ecosystem for managing semiconductor sample-chip orders and related operational workflows.',
    highlights: [
      'Improved REST API design and raised test coverage using pytest and mocks.',
      'Added structured CloudWatch logging and secure AWS S3 upload APIs.',
      'Built SSE-based streaming for chunked LangGraph responses in an AI-powered fintech application.',
    ],
    stack: ['FastAPI', 'AWS', 'LangGraph', 'pytest'],
  },
  {
    company: 'Simform',
    location: 'Ahmedabad, India',
    role: 'Software Engineer Intern',
    dateRange: 'Jan 2025 — July 2025',
    description:
      'Built backend features across SQL and NoSQL databases, working end to end from schema to endpoint.',
    highlights: [
      'Implemented RESTful APIs with Django ORM and SQLAlchemy.',
      'Developed asynchronous web scraping with Beautiful Soup and Selenium.',
    ],
    stack: ['Django', 'FastAPI', 'Flask', 'PostgreSQL'],
  },
  {
    company: 'Techrover Solutions Pvt Ltd',
    location: 'Ahmedabad, India',
    role: 'Internship',
    dateRange: 'May 2023 — June 2023',
    description:
      'Gained hands-on experience with the MERN stack, strengthening my software development skills while contributing to real-world projects.',
    highlights: [
      'Developed a ToDo List application using MongoDB, Express.js and Node.js, demonstrating end-to-end full-stack development.',
      'Designed and built a fully functional blog website with EJS templates, database integration and a responsive UI.',
      'Collaborated with teammates to troubleshoot issues, optimize application performance and improve user experience.',
    ],
    stack: ['MongoDB', 'Express.js', 'Node.js', 'EJS'],
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

          `left-[13px]` centres the rail under the 28px marker discs in TimelineItem;
          the two have to be set together or the nodes sit visibly off the line. */}
      <ol className="from-pulse/70 via-halo/30 relative flex flex-col gap-5 before:absolute before:top-6 before:bottom-6 before:left-[13px] before:w-px before:bg-gradient-to-b before:to-transparent sm:gap-6">
        {EXPERIENCE.map((item, index) => (
          <TimelineItem
            key={`${item.company}-${item.dateRange}`}
            {...item}
            delay={index * 0.07}
          />
        ))}
      </ol>
    </Section>
  )
}
