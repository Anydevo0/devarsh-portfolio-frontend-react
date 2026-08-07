import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AboutSection } from '@/components/about/AboutSection'
import { DEFAULT_SITE_CONTENT } from '@/data/siteContent'
import { resetToDefaults } from '@/lib/siteContent/store'

afterEach(() => {
  resetToDefaults()
  localStorage.clear()
})

describe('AboutSection', () => {
  it('renders the handwritten heading and intro from the content store', () => {
    render(<AboutSection />)

    expect(screen.getByText(DEFAULT_SITE_CONTENT.focus.heading)).toBeInTheDocument()
    // The intro is split around a highlighted phrase, so it is asserted as a
    // substring match against the section rather than a single exact text node.
    expect(
      screen.getByText(/turning LLMs into practical products/, { exact: false }),
    ).toBeInTheDocument()
  })

  it('renders every sticky note with its title and items', () => {
    render(<AboutSection />)

    for (const note of DEFAULT_SITE_CONTENT.focus.notes) {
      expect(screen.getByText(note.title)).toBeInTheDocument()
      for (const item of note.items) {
        expect(screen.getByText(item)).toBeInTheDocument()
      }
    }
  })
})
