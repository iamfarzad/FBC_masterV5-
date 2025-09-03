import { chatService } from '@/src/core/chat/service'
import { sseFromAsyncIterable } from '@/src/core/stream/sse'
import { chatRequestSchema } from '@/src/core/validation'
import type { ChatRequest } from '@/src/core/types/chat'

export async function handleChat(body: unknown) {
  // Validate request using new validation schema
  const request = chatRequestSchema.parse(body)

  // Create async iterable that yields text chunks from the chat service
  async function* textChunks() {
    for await (const chunk of chatService(request)) {
      if (chunk.type === 'text') {
        yield String(chunk.data)
      } else if (chunk.type === 'tool' && chunk.data && typeof chunk.data === 'object' && 'error' in chunk.data) {
        throw new Error(String(chunk.data.error))
      }
      // Skip 'done' chunks - they're handled by the SSE helper
    }
  }

  return sseFromAsyncIterable(textChunks())
}