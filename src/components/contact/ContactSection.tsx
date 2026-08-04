import { ContactForm } from './ContactForm'

import { Reveal } from '@/components/common/Reveal'
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/common/icons'
import { Section } from '@/components/layout/Section'
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/siteInfo'

const DIRECT_LINKS = [
  { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, Icon: MailIcon },
  { label: 'GitHub', value: 'Anydevo0', href: GITHUB_URL, Icon: GitHubIcon },
  { label: 'LinkedIn', value: 'devarsh-chhatrala', href: LINKEDIN_URL, Icon: LinkedInIcon },
]

/**
 * The one section a visitor writes to rather than reads — hence the POST in its
 * route label, the only one on the page.
 *
 * The form is paired with the direct channels rather than replacing them: a recruiter
 * who would rather use their own mail client should not have to hunt for an address.
 */
export function ContactSection() {
  return (
    <Section
      id="contact"
      route="POST /contact"
      title="Let's build something"
      lede="Open to backend and AI engineering roles, and always glad to talk through an interesting systems problem."
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <Reveal>
          <div className="glass rounded-3xl p-7 sm:p-9">
            <ContactForm />
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex flex-col gap-3">
            <p className="text-fog mb-2 font-mono text-xs tracking-[0.2em] uppercase">
              Or reach me directly
            </p>
            {DIRECT_LINKS.map(({ label, value, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="glass-soft group hover:border-pulse/30 flex items-center gap-4 rounded-2xl px-5 py-4 transition-all hover:-translate-y-0.5"
              >
                <span className="text-fog group-hover:text-pulse transition-colors">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="text-fog block font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
                    {label}
                  </span>
                  <span className="text-mist block truncate text-sm">{value}</span>
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
