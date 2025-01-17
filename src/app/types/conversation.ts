export interface Conversation {
  id: string
  assistantId: string
  assistant: {
    id: string
    name: string
    model: string
    personality: string
  }
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  content: string
  role: string
  createdAt: string
}

