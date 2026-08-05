import type { SiteContent } from '@/types/siteContent'

// Editable from /admin/content (see src/lib/siteContent/store.ts) — this object is
// only the fallback baseline. Live edits persist to localStorage; the admin panel's
// "Export" action gives you an updated version of this file's contents to commit so
// real visitors (who never touch your localStorage) see the change after redeploy.
export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    name: 'Devarsh Chhatrala',
    designation: 'Software Engineer',
    tagline: 'Backend & AI Systems',
    headline: 'Building scalable systems and intelligent AI applications.',
    intro:
      'I design and develop production-grade systems using Python, FastAPI, cloud platforms, and modern AI frameworks. My work focuses on scalable APIs, intelligent workflows, and LLM-powered applications.',
    greeting: 'Namaste 🙏',
    ctaPrimary: { label: 'View projects', href: '#projects' },
    ctaSecondary: { label: 'Contact me', href: '#contact' },
  },
  focus: {
    eyebrow: '// backend + ai focus',
    intro:
      'I build software systems that are designed for real-world complexity — combining reliable backend engineering with practical AI solutions to create scalable, production-ready applications.',
    highlights: [
      {
        title: 'Backend architecture',
        text: 'I build scalable backend services with Python, FastAPI, and DRF, designing clean APIs, maintainable service layers, and efficient data flows for complex applications.',
        tags: ['Python', 'FastAPI', 'DRF', 'PostgreSQL'],
      },
      {
        title: 'AI-powered systems',
        text: 'I develop intelligent applications using LLM workflows, RAG pipelines, and AI integrations, custom MCPs that transform business processes into smarter user experiences.',
        tags: ['LLM Workflows', 'RAG', 'MCP'],
      },
      {
        title: 'Production engineering',
        text: 'I focus on building reliable systems with cloud infrastructure, background processing, observability, and scalable data architectures that perform in real-world environments.',
        tags: ['AWS', 'Docker', 'Celery', 'Observability'],
      },
    ],
  },
}
