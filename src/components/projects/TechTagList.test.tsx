import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TechTagList } from '@/components/projects/TechTagList'

describe('TechTagList', () => {
  it('renders each tag separated by middle dots', () => {
    render(<TechTagList tags={['FastAPI', 'PostgreSQL', 'Redis']} />)
    expect(screen.getByText('FastAPI ·')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL ·')).toBeInTheDocument()
    expect(screen.getByText('Redis')).toBeInTheDocument()
  })

  it('renders nothing for an empty tag list', () => {
    const { container } = render(<TechTagList tags={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
