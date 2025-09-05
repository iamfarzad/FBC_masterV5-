import { unifiedChatService } from '@/src/core/chat/unified-provider'
import { sseFromAsyncIterable } from '@/src/core/stream/sse'
import type { UnifiedChatRequest } from '@/src/core/chat/unified-types'

export async function handleChat(request: UnifiedChatRequest) {
  // Request is already validated by the API route

  // Create async iterable that yields text chunks from the chat service
  async function* textChunks() {
    for await (const message of unifiedChatService(request)) {
      // For now, just yield the content of assistant messages
      if (message.role === 'assistant' && message.content) {
        yield message.content
      }
      // Handle other message types as needed
    }
  }

  return sseFromAsyncIterable(textChunks())
}