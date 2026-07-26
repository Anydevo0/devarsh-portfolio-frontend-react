import { useQuery } from '@tanstack/react-query'

import { listConversations } from '@/admin/api/chat'

export function useAdminConversations(flagged: boolean) {
  return useQuery({
    queryKey: ['admin', 'conversations', { flagged }],
    queryFn: () => listConversations(flagged),
  })
}
