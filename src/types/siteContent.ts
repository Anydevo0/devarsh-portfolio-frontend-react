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
  availability: string
  ctaPrimary: CtaButtonContent
  ctaSecondary: CtaButtonContent
}

export interface FocusHighlight {
  title: string
  text: string
  tags: string[]
}

export interface FocusSectionContent {
  eyebrow: string
  intro: string
  highlights: FocusHighlight[]
}

export interface SiteContent {
  hero: HeroContent
  focus: FocusSectionContent
}
