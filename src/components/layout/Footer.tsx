import { Link } from 'react-router'

import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/common/icons'
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/siteInfo'

const SOCIALS = [
  { label: 'GitHub', href: GITHUB_URL, Icon: GitHubIcon },
  { label: 'LinkedIn', href: LINKEDIN_URL, Icon: LinkedInIcon },
  { label: 'Email', href: `mailto:${CONTACT_EMAIL}`, Icon: MailIcon },
]

export function Footer() {
  return (
    <footer className="relative mt-8">
      <hr className="hairline mx-auto max-w-6xl border-0" />
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
        <div>
          <p className="font-tech text-mist text-sm font-semibold tracking-tight">
            Devarsh Chhatrala
          </p>
          <p className="text-fog mt-1 font-mono text-xs">
            © {new Date().getFullYear()} · Backend &amp; AI systems
          </p>
        </div>

        <nav aria-label="Elsewhere" className="flex items-center gap-2">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={label}
              className="glass-soft text-fog hover:text-pulse flex size-10 items-center justify-center rounded-full transition-all hover:-translate-y-0.5"
            >
              <Icon className="size-4" />
            </a>
          ))}
          {/* The admin panel is deliberately unlinked from the public nav; this is the
              one quiet way back in, and it still lands on a protected route. */}
          <Link
            to="/admin"
            className="text-fog/40 hover:text-fog ml-2 font-mono text-[0.6875rem] transition-colors"
          >
            admin
          </Link>
        </nav>
      </div>
    </footer>
  )
}
