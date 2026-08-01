import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { ContentEditorPage } from '@/admin/pages/ContentEditorPage'
import { DEFAULT_SITE_CONTENT } from '@/data/siteContent'
import { getSnapshot, resetToDefaults } from '@/lib/siteContent/store'

afterEach(() => {
  resetToDefaults()
  localStorage.clear()
})

describe('ContentEditorPage', () => {
  it('pre-fills the form with the current content', () => {
    render(<ContentEditorPage />)

    expect(screen.getByLabelText('Name')).toHaveValue(DEFAULT_SITE_CONTENT.hero.name)
    expect(screen.getByLabelText('Main heading')).toHaveValue(DEFAULT_SITE_CONTENT.hero.headline)
  })

  it('saves edits to the shared store', async () => {
    const user = userEvent.setup()
    render(<ContentEditorPage />)

    const nameInput = screen.getByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(getSnapshot().hero.name).toBe('Jane Doe')
    expect(await screen.findByText(/Saved/)).toBeInTheDocument()
  })

  it('resets to defaults after confirming', async () => {
    const user = userEvent.setup()
    render(<ContentEditorPage />)

    const nameInput = screen.getByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(getSnapshot().hero.name).toBe('Jane Doe')

    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(getSnapshot().hero.name).toBe(DEFAULT_SITE_CONTENT.hero.name)
    expect(screen.getByLabelText('Name')).toHaveValue(DEFAULT_SITE_CONTENT.hero.name)
  })

  it('reveals the export panel with the current content as JSON', async () => {
    const user = userEvent.setup()
    render(<ContentEditorPage />)

    await user.click(screen.getByRole('button', { name: 'Export' }))

    const textarea = screen.getByDisplayValue(/"hero"/)
    expect(
      JSON.parse(textarea.textContent ?? (textarea as HTMLTextAreaElement).value).hero.name,
    ).toBe(DEFAULT_SITE_CONTENT.hero.name)
  })
})
