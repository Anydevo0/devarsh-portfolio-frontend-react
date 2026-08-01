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
  profileImage: string
  /** Multiplier on the portrait's base height (1 = default). */
  profileImageScale: number
  /** Fine-nudge in pixels, applied via CSS transform — doesn't affect layout flow. */
  profileImageOffsetX: number
  profileImageOffsetY: number
  /** Toggles the aura/glow/ring treatment behind the portrait (Option 3: bare image only). */
  profileImageEffects: boolean
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
