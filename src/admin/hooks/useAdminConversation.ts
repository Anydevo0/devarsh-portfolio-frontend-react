import { useQuery } from '@tanstack/react-query'

import { getConversation } from '@/admin/api/chat'

export function useAdminConversation(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'conversations', id],
    queryFn: () => getConversation(id as string),
    enabled: id !== undefined,
  })
}
