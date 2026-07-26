import { apiFetch } from '@/lib/apiClient'

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export function login(password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}
