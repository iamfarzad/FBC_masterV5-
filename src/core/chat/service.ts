import type { ChatRequest, ChatChunk } from '../types/chat'
import { getProvider } from '../ai'
import { ContextStorage } from '../context/context-storage'

export async function* chatService(req: ChatRequest): AsyncIterable<ChatChunk> {
  const provider = getProvider()
  let chunkId = 0
  let responseText = ''

  try {
    // Extract session ID and lead context from request
    const sessionId = (req as any).sessionId || 'default-session'
    const leadContext = (req as any).leadContext || {}

    // Add session data to first message for system prompt generation
    const enhancedMessages = req.messages.map((msg, index) => ({
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
        id: String(chunkId++),
        type: 'text',
        data: text
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

    yield {
      id: 'done',
      type: 'done',
      data: null
    }
  } catch (error) {
    console.error('Chat service error:', error)

    // If we haven't yielded anything yet, send an error response
    if (chunkId === 0) {
      yield {
        id: 'error',
        type: 'text',
        data: 'I apologize, but I\'m having trouble responding right now. Please try again.'
      }
    }

    yield {
      id: 'done',
      type: 'done',
      data: null
    }
  }
}