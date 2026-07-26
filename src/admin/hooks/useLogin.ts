import { useMutation } from '@tanstack/react-query'

import { login } from '@/admin/api/auth'
import { useAuth } from '@/admin/auth/AuthContext'

export function useLogin() {
  const { login: startSession } = useAuth()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => startSession(data.access_token, data.expires_in),
  })
}
