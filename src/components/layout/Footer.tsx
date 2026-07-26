import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/siteInfo'

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-8 text-sm text-mute">
      <span>© {new Date().getFullYear()} Devarsh Chhatrala</span>
      <nav className="flex gap-5">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-wire">
          GitHub
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-wire"
        >
          LinkedIn
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-wire">
          Email
        </a>
      </nav>
    </footer>
  )
}
