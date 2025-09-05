import { config } from '../config'

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  id?: string
}

export interface ConversationContext {
  sessionId: string
  messages: ConversationMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: {
    totalTokens?: number
    lastActivity?: Date
    topic?: string
    userId?: string
  }
}

export class ConversationMemory {
  private cache = new Map<string, ConversationContext>()
  private readonly maxMessages = 50 // Maximum messages to keep in memory
  private readonly maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Load conversation history for a session
   */
  async loadConversation(sessionId: string): Promise<ConversationMessage[]> {
    try {
      // Check in-memory cache first
      const cached = this.cache.get(sessionId)
      if (cached && this.isValidCache(cached)) {
        console.log(`📚 Loaded conversation from cache: ${cached.messages.length} messages`)
        return this.prepareMessagesForAI(cached.messages)
      }

      // Try to load from persistent storage (if available)
      const persisted = await this.loadFromStorage(sessionId)
      if (persisted) {
        this.cache.set(sessionId, persisted)
        console.log(`💾 Loaded conversation from storage: ${persisted.messages.length} messages`)
        return this.prepareMessagesForAI(persisted.messages)
      }

      // Return empty array for new conversations
      console.log(`🆕 New conversation session: ${sessionId}`)
      return []
    } catch (error) {
      console.error('Error loading conversation:', error)
      return []
    }
  }

  /**
   * Save a message to conversation memory
   */
  async saveMessage(sessionId: string, message: Omit<ConversationMessage, 'timestamp'>): Promise<void> {
    try {
      const fullMessage: ConversationMessage = {
        ...message,
        timestamp: new Date()
      }

      // Get or create conversation context
      let context = this.cache.get(sessionId)
      if (!context) {
        context = {
          sessionId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }

      // Add message to conversation
      context.messages.push(fullMessage)
      context.updatedAt = new Date()

      // Trim conversation if too long (keep most recent messages)
      if (context.messages.length > this.maxMessages) {
        const keepCount = Math.floor(this.maxMessages * 0.8) // Keep 80% of max
        context.messages = context.messages.slice(-keepCount)
        console.log(`✂️ Trimmed conversation to ${keepCount} messages`)
      }

      // Update metadata
      context.metadata = {
        ...context.metadata,
        lastActivity: new Date(),
        totalTokens: this.estimateTokens(context.messages)
      }

      // Save to cache
      this.cache.set(sessionId, context)

      // Persist to storage (if available)
      await this.saveToStorage(context)

      console.log(`💾 Saved message to conversation: ${sessionId} (${context.messages.length} total messages)`)
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  /**
   * Clear conversation memory for a session
   */
  async clearConversation(sessionId: string): Promise<void> {
    try {
      this.cache.delete(sessionId)
      await this.deleteFromStorage(sessionId)
      console.log(`🗑️ Cleared conversation: ${sessionId}`)
    } catch (error) {
      console.error('Error clearing conversation:', error)
    }
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(sessionId: string): {
    messageCount: number
    totalTokens: number
    lastActivity: Date | null
    createdAt: Date | null
  } {
    const context = this.cache.get(sessionId)
    if (!context) {
      return { messageCount: 0, totalTokens: 0, lastActivity: null, createdAt: null }
    }

    return {
      messageCount: context.messages.length,
      totalTokens: context.metadata?.totalTokens || 0,
      lastActivity: context.metadata?.lastActivity || null,
      createdAt: context.createdAt
    }
  }

  /**
   * Prepare messages for AI consumption (limit context, format properly)
   */
  private prepareMessagesForAI(messages: ConversationMessage[]): ConversationMessage[] {
    // Limit to recent messages to stay within context window
    const maxContextMessages = 20
    const recentMessages = messages.slice(-maxContextMessages)

    // Convert to AI-friendly format
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      id: msg.id,
      timestamp: new Date()
    }))
  }

  /**
   * Check if cached conversation is still valid
   */
  private isValidCache(context: ConversationContext): boolean {
    const age = Date.now() - context.updatedAt.getTime()
    return age < this.maxAge
  }

  /**
   * Estimate total tokens in conversation
   */
  private estimateTokens(messages: ConversationMessage[]): number {
    return messages.reduce((total, msg) => {
      // Rough approximation: 1 token ≈ 4 characters
      return total + Math.ceil(msg.content.length / 4)
    }, 0)
  }

  /**
   * Load conversation from persistent storage (placeholder)
   * In a real implementation, this would load from database/cache
   */
  private async loadFromStorage(sessionId: string): Promise<ConversationContext | null> {
    // TODO: Implement persistent storage (Redis, Database, etc.)
    // For now, return null to use in-memory only
    return null
  }

  /**
   * Save conversation to persistent storage (placeholder)
   */
  private async saveToStorage(context: ConversationContext): Promise<void> {
    // TODO: Implement persistent storage
    // For now, just log that we'd save it
    console.log(`📦 Would persist conversation: ${context.sessionId} (${context.messages.length} messages)`)
  }

  /**
   * Delete conversation from storage (placeholder)
   */
  private async deleteFromStorage(sessionId: string): Promise<void> {
    // TODO: Implement storage deletion
    console.log(`🗑️ Would delete conversation from storage: ${sessionId}`)
  }

  /**
   * Clean up expired conversations from cache
   */
  cleanupExpiredConversations(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [sessionId, context] of this.cache.entries()) {
      if (!this.isValidCache(context)) {
        this.cache.delete(sessionId)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired conversations`)
    }
  }
}

// Auto-cleanup expired conversations every hour
setInterval(() => {
  const memory = new ConversationMemory()
  memory.cleanupExpiredConversations()
}, 60 * 60 * 1000)
