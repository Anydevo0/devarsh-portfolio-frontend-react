import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { TagChipInput } from '@/admin/components/TagChipInput'

function ControlledTagChipInput() {
  const [tags, setTags] = useState<string[]>([])
  return <TagChipInput value={tags} onChange={setTags} placeholder="Add a technology…" />
}

describe('TagChipInput', () => {
  it('adds a tag on Enter and clears the draft', async () => {
    const user = userEvent.setup()
    render(<ControlledTagChipInput />)

    const input = screen.getByPlaceholderText('Add a technology…')
    await user.type(input, 'FastAPI{Enter}')

    expect(screen.getByText('FastAPI')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('removes a tag when its remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledTagChipInput />)

    await user.type(screen.getByPlaceholderText('Add a technology…'), 'FastAPI{Enter}')
    await user.click(screen.getByRole('button', { name: 'Remove FastAPI' }))

    expect(screen.queryByText('FastAPI')).not.toBeInTheDocument()
  })

  it('removes the last tag on Backspace when the draft is empty', async () => {
    const user = userEvent.setup()
    render(<ControlledTagChipInput />)

    const input = screen.getByPlaceholderText('Add a technology…')
    await user.type(input, 'FastAPI{Enter}')
    await user.type(input, '{Backspace}')

    expect(screen.queryByText('FastAPI')).not.toBeInTheDocument()
  })

  it('does not add a duplicate tag', async () => {
    const user = userEvent.setup()
    render(<ControlledTagChipInput />)

    const input = screen.getByPlaceholderText('Add a technology…')
    await user.type(input, 'FastAPI{Enter}')
    await user.type(input, 'FastAPI{Enter}')

    expect(screen.getAllByText('FastAPI')).toHaveLength(1)
  })
})
