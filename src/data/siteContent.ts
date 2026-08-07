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
    eyebrow: '// field notes',
    heading: "Who am I?",
    intro:
      "I am a developer who builds production-grade backend systems and AI-powered applications. My work centers on scalable APIs, intelligent workflows, and turning LLMs into practical products — I'm always looking for better ways to solve real-world problems with software.",
    notes: [
      {
        title: 'What I Build',
        items: [
          'Scalable APIs with FastAPI and DRF',
          'An AI-powered financial platform backend',
          'An order routing engine spanning a multi-ERP ecosystem, tracking orders from creation to shipment',
          'Custom MCP servers',
          'Voice agents for recruitment and customer support, wired straight into phone calls',
        ],
      },
      {
        title: 'Current Obsession',
        items: [
          'Building LLM-powered workflows',
          'Exploring LangChain and LangGraph',
          'Azure AI Services',
        ],
      },
      {
        title: 'Things You Should Know',
        items: [
          'Clean code makes me unusually happy.',
          'I love turning complex ideas into simple products.',
          'If I can improve the UI, I probably will.',
          'Always curious. Always learning.',
        ],
      },
      {
        title: 'Beyond VS Code',
        items: [
          'Music is mandatory while coding.',
          'Movies & web series are my reset button.',
          'I enjoy competitive games.',
          'Nature trips recharge my brain.',
        ],
      },
    ],
  },
}
