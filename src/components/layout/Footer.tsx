import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/siteInfo'

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-edge px-6 py-8 font-mono text-xs text-fog">
      <span>© {new Date().getFullYear()} Devarsh Chhatrala</span>
      <nav className="flex gap-5">
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-pulse">
          GitHub
        </a>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pulse"
        >
          LinkedIn
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-pulse">
          Email
        </a>
      </nav>
    </footer>
  )
}
