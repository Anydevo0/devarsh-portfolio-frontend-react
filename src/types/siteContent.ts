export interface CtaButtonContent {
  label: string
  href: string
}

export interface HeroContent {
  name: string
  designation: string
  tagline: string
  headline: string
  intro: string
  /** The hero's opening line, set in the script face. */
  greeting: string
  ctaPrimary: CtaButtonContent
  ctaSecondary: CtaButtonContent
}

/** One sticky note on the About page's notebook spread. */
export interface NotebookNote {
  title: string
  items: string[]
}

export interface FocusSectionContent {
  eyebrow: string
  /** The handwritten heading above the intro paragraph, e.g. "Hey, I'm Devarsh..!" */
  heading: string
  intro: string
  notes: NotebookNote[]
}

export interface SiteContent {
  hero: HeroContent
  focus: FocusSectionContent
}
