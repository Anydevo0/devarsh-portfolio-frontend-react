export interface ChatMessageIn {
  message: string
  conversation_id?: string
}

// The three possible `data:` payload shapes streamed by POST /chat's SSE response.
export interface ChatTokenPayload {
  content: string
}

export interface ChatErrorPayload {
  message: string
}

export interface ChatDonePayload {
  conversation_id: string
}

// Admin conversation-review shapes.
export interface ChatMessageRead {
  id: number
  role: 'user' | 'assistant'
  content: string
  is_flagged: boolean
  created_at: string
}

export interface ChatConversationRead {
  id: string
  ip_address_hash: string | null
  user_agent: string | null
  is_flagged: boolean
  created_at: string
  updated_at: string
}

export interface ChatConversationDetail extends ChatConversationRead {
  messages: ChatMessageRead[]
}
