import { SkillCategory } from './SkillCategory'

const SKILL_CATEGORIES = [
  {
    title: 'Languages',
    skills: ['Python', 'JavaScript', 'C++', 'Java', 'SQL'],
  },
  {
    title: 'Backend',
    skills: [
      'FastAPI',
      'Django REST Framework',
      'Flask',
      'REST APIs',
      'GraphQL',
      'Node.js',
    ],
  },
  {
    title: 'Cloud & Infrastructure',
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
    <section id="skills" className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <h2 className="font-tech text-3xl font-bold text-mist sm:text-4xl">Skills</h2>
      <p className="mt-4 max-w-3xl text-base text-fog sm:text-lg">
        Backend-focused engineer building API-driven systems with Python, FastAPI, Django,
        PostgreSQL, AWS, Docker, Celery, Redis, and automation tools for scraping, observability,
        and async work.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILL_CATEGORIES.map((category) => (
          <SkillCategory key={category.title} title={category.title} skills={category.skills} />
        ))}
      </div>
    </section>
  )
}
