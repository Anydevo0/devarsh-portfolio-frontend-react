import { Link } from 'react-router'

const SECTIONS = [
  {
    to: '/admin/content',
    title: 'Site content',
    description: 'Hero copy, profile photo, and the professional-focus highlights.',
  },
  {
    to: '/admin/projects',
    title: 'Projects',
    description: 'Case studies shown in the Selected work section.',
  },
  { to: '/admin/blog', title: 'Blog', description: 'Long-form posts.' },
  { to: '/admin/contact', title: 'Contact', description: 'Submissions from the contact form.' },
  { to: '/admin/chat', title: 'Chat', description: 'Conversation logs from the chat widget.' },
]

export function AdminHomePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="border-line hover:border-wire rounded-lg border p-5 transition-colors"
          >
            <h2 className="font-display text-lg font-bold">{section.title}</h2>
            <p className="text-mute mt-1 text-sm">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
