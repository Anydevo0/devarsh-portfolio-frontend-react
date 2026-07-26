import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Hero } from '@/components/hero/Hero'

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

describe('Hero', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('omits animation classes when the visitor prefers reduced motion', () => {
    mockMatchMedia(true)
    const { container } = render(<Hero />)
    expect(container.querySelector('.animate-rise')).toBeNull()
  })

  it('applies animation classes when motion is not reduced', () => {
    mockMatchMedia(false)
    const { container } = render(<Hero />)
    expect(container.querySelector('.animate-rise')).not.toBeNull()
  })
})
