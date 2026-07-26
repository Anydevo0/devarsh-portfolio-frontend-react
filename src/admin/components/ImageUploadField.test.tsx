import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ImageUploadField } from '@/admin/components/ImageUploadField'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function ControlledImageUploadField() {
  const [url, setUrl] = useState<string | null>(null)
  return <ImageUploadField value={url} onChange={setUrl} folder="blog" />
}

function makeFile(name: string) {
  return new File(['fake-image-bytes'], name, { type: 'image/png' })
}

function signHandler() {
  return http.post(`${BASE}/admin/uploads/sign`, () =>
    HttpResponse.json({
      cloud_name: 'demo',
      api_key: 'key',
      timestamp: 1700000000,
      signature: 'sig',
      folder: 'blog',
    }),
  )
}

describe('ImageUploadField', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('uploads a cover image and offers replace/remove afterward', async () => {
    server.use(
      signHandler(),
      http.post('https://api.cloudinary.com/v1_1/demo/image/upload', () =>
        HttpResponse.json({ secure_url: 'https://res.cloudinary.com/demo/cover.png' }),
      ),
    )
    const user = userEvent.setup()
    render(<ControlledImageUploadField />)

    const input = document.querySelector('input[type="file"]')
    if (!input) throw new Error('file input not found')
    await user.upload(input as HTMLInputElement, makeFile('cover.png'))

    const image = await screen.findByRole('img')
    expect(image).toHaveAttribute('src', 'https://res.cloudinary.com/demo/cover.png')
    expect(screen.getByText('Replace')).toBeInTheDocument()
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('clears the image when Remove is clicked', async () => {
    server.use(
      signHandler(),
      http.post('https://api.cloudinary.com/v1_1/demo/image/upload', () =>
        HttpResponse.json({ secure_url: 'https://res.cloudinary.com/demo/cover.png' }),
      ),
    )
    const user = userEvent.setup()
    render(<ControlledImageUploadField />)

    const input = document.querySelector('input[type="file"]')
    if (!input) throw new Error('file input not found')
    await user.upload(input as HTMLInputElement, makeFile('cover.png'))
    await screen.findByRole('img')

    await user.click(screen.getByText('Remove'))
    expect(screen.getByText('+ Add cover image')).toBeInTheDocument()
  })
})
