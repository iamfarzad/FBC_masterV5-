import { chatService } from '@/src/core/chat/service'
import { sseFromAsyncIterable } from '@/src/core/stream/sse'
import type { ChatRequest } from '@/src/core/types/chat'

export async function handleChat(request: ChatRequest) {
  // Request is already validated by the API route

  // Create async iterable that yields text chunks from the chat service
  async function* textChunks() {
    for await (const message of chatService(request)) {
      // For now, just yield the content of assistant messages
      if (message.role === 'assistant' && message.content) {
        yield message.content
      }
      // Handle other message types as needed
    }
  }

  return sseFromAsyncIterable(textChunks())
}