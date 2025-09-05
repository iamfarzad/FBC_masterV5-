import type { UnifiedMessage } from './unified-types'
import { getProvider } from '../ai'
import { ContextStorage } from '../context/context-storage'

// Option A (preferred if you don't actually need a shared type): define a local minimal type and remove the import.

// Use proper types from the types file
import type { ChatMessage, ChatRequest as BaseChatRequest } from '../types/chat'

// Extend the base ChatRequest with additional fields used by the service
type ChatRequest = BaseChatRequest & {
  sessionId?: string;
  mode?: string;
  userId?: string;
};

export async function* chatService(req: ChatRequest): AsyncIterable<ChatMessage> {
  const provider = getProvider()
  let chunkId = 0
  let responseText = ''

  try {
    // Extract session ID and lead context from request
    const sessionId = req.sessionId || 'default-session'
    const leadContext = req.data?.leadContext || {}

    // Add session data to first message for system prompt generation
    // ⬇️ annotate params
    const enhancedMessages = req.messages.map((msg: ChatMessage, index: number) => ({
      ...msg,
      ...(index === 0 ? {
        sessionData: {
          sessionId,
          leadContext,
          timestamp: new Date().toISOString()
        }
      } : {})
    }))

    // Generate response using provider with enhanced context
    for await (const text of provider.generate({ messages: enhancedMessages })) {
      responseText += text
      yield {
        role: 'assistant' as const,
        content: text
      }
    }

    // Save conversation to context storage (non-blocking)
    if (responseText) {
      try {
        const contextStorage = new ContextStorage()
        const userMessage = req.messages[req.messages.length - 1]?.content || ''

        // Update context asynchronously without blocking the response
        contextStorage.update(sessionId, {
          last_user_message: userMessage
        }).catch(err => console.error('Failed to save conversation context:', err))
      } catch (contextError) {
        // Don't fail the response if context saving fails
        console.error('Context save error (non-critical):', contextError)
      }
    }

  } catch (error) {
    console.error('Chat service error:', error)

    // If we haven't yielded anything yet, send an error response
    if (chunkId === 0) {
      yield {
        role: 'assistant' as const,
        content: 'I apologize, but I\'m having trouble responding right now. Please try again.'
      }
    }
  }
}