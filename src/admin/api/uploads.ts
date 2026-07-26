import { adminFetch } from './client'

interface UploadSignResponse {
  cloud_name: string
  api_key: string
  timestamp: number
  signature: string
  folder: string
}

interface CloudinaryUploadResponse {
  secure_url: string
}

/** Signs with the backend, then uploads directly to Cloudinary from the browser —
 * the API secret never leaves the server. */
export async function uploadImage(file: File, folder: 'projects' | 'blog'): Promise<string> {
  const sign = await adminFetch<UploadSignResponse>('/admin/uploads/sign', {
    method: 'POST',
    body: JSON.stringify({ folder }),
  })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sign.api_key)
  formData.append('timestamp', String(sign.timestamp))
  formData.append('signature', sign.signature)
  formData.append('folder', sign.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloud_name}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    throw new Error('Image upload failed. Please try again.')
  }
  const data = (await res.json()) as CloudinaryUploadResponse
  return data.secure_url
}
