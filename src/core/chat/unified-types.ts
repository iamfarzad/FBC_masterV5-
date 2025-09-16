/**
 * Unified Types - AI SDK Compatible
 * Essential types for backward compatibility
 */

export interface UnifiedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'tool' | 'multimodal' | 'meta'
  metadata?: Record<string, any>
}

export interface UnifiedContext {
  sessionId?: string
  leadContext?: {
    name?: string
    email?: string
    company?: string
    role?: string
  }
  intelligenceContext?: any
  conversationIds?: string[]
  adminId?: string
  multimodalData?: {
    audioData?: string
    imageData?: string
    videoData?: string
  }
}

export type ChatMode = 'standard' | 'realtime' | 'admin' | 'multimodal' | 'automation'

export interface UnifiedChatRequest {
  messages: UnifiedMessage[]
  context?: UnifiedContext
  mode?: ChatMode
  stream?: boolean
}

export interface UnifiedChatOptions {
  sessionId?: string
  mode?: ChatMode
  context?: UnifiedContext
  initialMessages?: UnifiedMessage[]
  onMessage?: (message: UnifiedMessage) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export interface UnifiedChatReturn {
  messages: UnifiedMessage[]
  isLoading: boolean
  isStreaming: boolean
  error: Error | null
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Omit<UnifiedMessage, 'id'>) => UnifiedMessage
  clearMessages: () => void
  updateContext: (context: Partial<UnifiedContext>) => void
}