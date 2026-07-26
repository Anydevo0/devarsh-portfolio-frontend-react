import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('never renders raw HTML as executable markup', () => {
    const malicious = [
      'Some text before.',
      '<script>window.__xss = true</script>',
      '<img src="x" onerror="window.__xss = true">',
      '',
      '## A real heading',
    ].join('\n\n')

    const { container } = render(<MarkdownRenderer content={malicious} />)

    // Neither injection attempt actually executed.
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
    // Neither raw tag exists as a real DOM element — react-markdown (without
    // rehype-raw) renders them as literal escaped text, not markup.
    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    // The literal text is still visible (escaped, not silently dropped).
    expect(container.textContent).toContain('<script>')
    // Legitimate Markdown still renders as real elements.
    expect(screen.getByRole('heading', { level: 2, name: 'A real heading' })).toBeInTheDocument()
  })
})
