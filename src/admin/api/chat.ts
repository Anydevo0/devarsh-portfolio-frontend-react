import { adminFetch } from './client'

import type { ChatConversationDetail, ChatConversationRead, Page } from '@/types/api'

export function listConversations(flagged?: boolean): Promise<Page<ChatConversationRead>> {
  const query = flagged ? '&flagged=true' : ''
  return adminFetch<Page<ChatConversationRead>>(`/admin/chat/conversations?limit=100${query}`)
}

export function getConversation(id: string): Promise<ChatConversationDetail> {
  return adminFetch<ChatConversationDetail>(`/admin/chat/conversations/${id}`)
}

export function setConversationFlag(id: string, isFlagged: boolean): Promise<ChatConversationRead> {
  return adminFetch<ChatConversationRead>(`/admin/chat/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_flagged: isFlagged }),
  })
}

export function deleteConversation(id: string): Promise<void> {
  return adminFetch<void>(`/admin/chat/conversations/${id}`, { method: 'DELETE' })
}
