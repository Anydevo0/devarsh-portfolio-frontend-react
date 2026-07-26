import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { MarkdownEditor } from '@/admin/components/MarkdownEditor'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function ControlledMarkdownEditor() {
  const [value, setValue] = useState('')
  return <MarkdownEditor value={value} onChange={setValue} label="Post content" />
}

function makeFile(name: string) {
  return new File(['fake-image-bytes'], name, { type: 'image/png' })
}

function mockUploadFlow() {
  server.use(
    http.post(`${BASE}/admin/uploads/sign`, () =>
      HttpResponse.json({
        cloud_name: 'demo',
        api_key: 'key',
        timestamp: 1700000000,
        signature: 'sig',
        folder: 'blog',
      }),
    ),
    http.post('https://api.cloudinary.com/v1_1/demo/image/upload', () =>
      HttpResponse.json({ secure_url: 'https://res.cloudinary.com/demo/diagram.png' }),
    ),
  )
}

describe('MarkdownEditor', () => {
  it('wraps the selection in ** when Bold is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledMarkdownEditor />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'hello world')
    textarea.setSelectionRange(0, 5)

    await user.click(screen.getByRole('button', { name: 'Bold' }))

    expect(textarea).toHaveValue('**hello** world')
  })

  it('prefixes the current line with ## when Heading is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledMarkdownEditor />)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'Section title')
    textarea.setSelectionRange(3, 3)

    await user.click(screen.getByRole('button', { name: 'Heading' }))

    expect(textarea).toHaveValue('## Section title')
  })

  it('renders a live preview of the Markdown content', async () => {
    const user = userEvent.setup()
    render(<ControlledMarkdownEditor />)

    await user.type(screen.getByRole('textbox'), '# Hello there')

    expect(await screen.findByRole('heading', { name: 'Hello there' })).toBeInTheDocument()
  })

  it('never renders raw HTML from the content — XSS regression', async () => {
    const user = userEvent.setup()
    render(<ControlledMarkdownEditor />)

    await user.type(screen.getByRole('textbox'), '<img src=x onerror="window.__xss=true">')

    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
    expect(document.querySelector('img[onerror]')).not.toBeInTheDocument()
  })

  describe('image insertion', () => {
    beforeEach(() => {
      saveSession('a-token', 900)
    })

    afterEach(() => {
      clearSession()
    })

    it('uploads and inserts a dropped image at the cursor', async () => {
      mockUploadFlow()
      render(<ControlledMarkdownEditor />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

      fireEvent.drop(textarea, {
        dataTransfer: { files: [makeFile('diagram.png')] } as unknown as DataTransfer,
      })

      await screen.findByDisplayValue(/diagram\.png/)
      expect(textarea.value).toContain(
        '![diagram.png](https://res.cloudinary.com/demo/diagram.png)',
      )
    })

    it('uploads and inserts a pasted image at the cursor', async () => {
      mockUploadFlow()
      render(<ControlledMarkdownEditor />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      const file = makeFile('screenshot.png')

      fireEvent.paste(textarea, {
        clipboardData: {
          items: [{ kind: 'file', type: 'image/png', getAsFile: () => file }],
        } as unknown as DataTransfer,
      })

      await screen.findByDisplayValue(/screenshot\.png/)
      expect(textarea.value).toMatch(/!\[screenshot\.png\]\(https:\/\/res\.cloudinary\.com\/.+\)/)
    })
  })
})
