import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ImageGalleryField } from '@/admin/components/ImageGalleryField'
import { clearSession, saveSession } from '@/admin/auth/session'
import { server } from '@/test/mocks/server'

const BASE = import.meta.env.VITE_API_BASE_URL

function ControlledImageGalleryField() {
  const [urls, setUrls] = useState<string[]>([])
  return <ImageGalleryField value={urls} onChange={setUrls} folder="projects" />
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
      folder: 'projects',
    }),
  )
}

describe('ImageGalleryField', () => {
  beforeEach(() => {
    saveSession('a-token', 900)
  })

  afterEach(() => {
    clearSession()
  })

  it('uploads a file through the sign + Cloudinary flow and shows the result', async () => {
    server.use(
      signHandler(),
      http.post('https://api.cloudinary.com/v1_1/demo/image/upload', () =>
        HttpResponse.json({ secure_url: 'https://res.cloudinary.com/demo/image1.png' }),
      ),
    )

    const user = userEvent.setup()
    render(<ControlledImageGalleryField />)

    const input = document.querySelector('input[type="file"]')
    if (!input) throw new Error('file input not found')
    await user.upload(input as HTMLInputElement, makeFile('one.png'))

    const image = await screen.findByRole('img')
    expect(image).toHaveAttribute('src', 'https://res.cloudinary.com/demo/image1.png')
  })

  it('shows a retry option when the upload fails, and clears it on cancel', async () => {
    server.use(
      signHandler(),
      http.post(
        'https://api.cloudinary.com/v1_1/demo/image/upload',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )

    const user = userEvent.setup()
    render(<ControlledImageGalleryField />)

    const input = document.querySelector('input[type="file"]')
    if (!input) throw new Error('file input not found')
    await user.upload(input as HTMLInputElement, makeFile('one.png'))

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })
})
