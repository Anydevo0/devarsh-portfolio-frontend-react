import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteConversation, setConversationFlag } from '@/admin/api/chat'

export function useSetConversationFlag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFlagged }: { id: string; isFlagged: boolean }) =>
      setConversationFlag(id, isFlagged),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'conversations', variables.id] })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    // A plain prefix invalidation would also match this exact conversation's own
    // ['admin','conversations', id] detail query — which is still mounted for a
    // moment before the caller navigates away — causing a pointless 404 refetch
    // of a resource that was just deleted. The predicate matches only the list
    // query (whose third key segment is the {flagged} filter object, not a raw id).
    onSuccess: () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' &&
          query.queryKey[1] === 'conversations' &&
          typeof query.queryKey[2] !== 'string',
      }),
  })
}
