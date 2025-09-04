/**
 * Unified Chat System Types
 * Single source of truth for all chat-related types
 */

// Core message types
export interface UnifiedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
  type?: 'text' | 'tool' | 'multimodal'
}

// Chat session types
export interface UnifiedChatSession {
  id: string
  messages: UnifiedMessage[]
  context?: UnifiedContext
  createdAt: Date
  updatedAt: Date
  mode: ChatMode
}

// Context management
export interface UnifiedContext {
  sessionId?: string
  leadContext?: LeadContext
  intelligenceContext?: IntelligenceContext
  multimodalData?: MultimodalData
  conversationIds?: string[] // For admin chat lead context
  adminId?: string // For admin chat
}

// Chat modes
export type ChatMode = 'standard' | 'realtime' | 'admin' | 'multimodal'

// Provider interface
export interface UnifiedChatProvider {
  generate(input: { messages: UnifiedMessage[]; context?: UnifiedContext; mode?: ChatMode }): AsyncIterable<UnifiedMessage>
  supportsMode(mode: ChatMode): boolean
  getCapabilities(): ChatCapabilities

  // Admin session management
  initializeAdminSession(sessionId: string, adminId?: string): Promise<void>
  updateAdminActivity(sessionId: string): Promise<void>
  disconnectAdminSession(sessionId: string): Promise<void>
  getAdminSessionStatus(sessionId: string): Promise<{ isActive: boolean; lastActivity: Date } | null>

  // Admin context and search
  searchAdminConversations(query: string, limit?: number, adminId?: string): Promise<any[]>
  getAdminConversationContext(sessionId: string, currentMessage?: string, limit?: number): Promise<any>
}

// Streaming response types
export interface UnifiedChatChunk {
  id: string
  type: 'text' | 'tool' | 'done' | 'error'
  data: unknown
  timestamp: Date
}

// Hook interfaces
export interface UnifiedChatOptions {
  sessionId?: string
  mode?: ChatMode
  initialMessages?: UnifiedMessage[]
  context?: UnifiedContext
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
  clearMessages: () => void
  updateContext: (context: Partial<UnifiedContext>) => void
}

// API request/response types
export interface UnifiedChatRequest {
  messages: UnifiedMessage[]
  context?: UnifiedContext
  mode?: ChatMode
  stream?: boolean
}

export interface UnifiedChatResponse {
  message?: UnifiedMessage
  error?: string
  sessionId?: string
}

// Supporting types
export interface LeadContext {
  name?: string
  email?: string
  company?: string
  role?: string
  interests?: string[]
}

export interface IntelligenceContext {
  userType: string
  intelligenceEnabled: boolean
  conversationHistory?: UnifiedMessage[]
}

export interface MultimodalData {
  imageData?: string
  audioData?: Uint8Array | string
  videoData?: Uint8Array | string
}

export interface ChatCapabilities {
  supportsStreaming: boolean
  supportsMultimodal: boolean
  supportsRealtime: boolean
  maxTokens: number
  supportedModes: ChatMode[]
}
