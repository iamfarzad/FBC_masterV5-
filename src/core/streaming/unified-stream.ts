/**
 * Unified Streaming Service
 * Single source for all chat streaming functionality
 */

import { UnifiedMessage } from '../chat/unified-types'

export interface StreamingOptions {
  headers?: Record<string, string>
  reqId?: string
  onError?: (error: Error) => void
  onComplete?: () => void
}

export class UnifiedStreamingService {
  /**
   * Convert async iterable of messages to Server-Sent Events
   */
  async streamToSSE(
    messageStream: AsyncIterable<UnifiedMessage>,
    options: StreamingOptions = {}
  ): Promise<Response> {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let messageCount = 0

          // Send meta event with reqId first (works around Vercel header stripping)
          if (options.reqId) {
            const metaEvent = `event: meta\ndata: ${JSON.stringify({ reqId: options.reqId, endpoint: 'unified' })}\n\n`
            console.log('[STREAMING_SERVICE] Sending meta event:', metaEvent.trim())
            controller.enqueue(encoder.encode(metaEvent))
          }

          for await (const message of messageStream) {
            messageCount++

            // Convert message to SSE format
            const sseData = {
              id: message.id,
              content: message.content,
              role: message.role,
              timestamp: message.timestamp.toISOString(),
              type: message.type || 'text',
              metadata: message.metadata,
              isComplete: message.metadata?.isComplete || false,
              isStreaming: message.metadata?.isStreaming || false
            }

            // Send the message as SSE
            const eventData = `data: ${JSON.stringify(sseData)}\n\n`
            controller.enqueue(encoder.encode(eventData))

            // Small delay to prevent overwhelming the client
            if (message.metadata?.isStreaming) {
              await new Promise(resolve => setTimeout(resolve, 10))
            }
          }

          // Send completion event (compatible with original SSE)
          const completionEvent = `event: end\ndata: {}\n\n`
          controller.enqueue(encoder.encode(completionEvent))

          // Close the stream
          controller.close()

          // Call completion callback
          options.onComplete?.()

        } catch (error) {
          // Send error event
          const errorEvent = `event: error\ndata: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown streaming error',
            timestamp: new Date().toISOString()
          })}\n\n`
          controller.enqueue(encoder.encode(errorEvent))

          controller.close()

          // Call error callback
          options.onError?.(error instanceof Error ? error : new Error('Streaming error'))
        }
      },

      cancel() {
        // Stream cancelled by client
      }
    })

    // Return Response with proper headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        ...options.headers
      }
    })
  }

  /**
   * Parse SSE stream from Response
   */
  async *parseSSEStream(response: Response): AsyncIterable<UnifiedMessage> {
    if (!response.body) {
      throw new Error('No response body to parse')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent: string | null = null

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        // Keep the last potentially incomplete line
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()

          if (!trimmedLine) continue

          // Parse SSE format
          if (trimmedLine.startsWith('event: ')) {
            const eventType = trimmedLine.slice(7).trim()
            currentEvent = eventType
          } else if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6))

              // Handle meta events specially
              if (currentEvent === 'meta') {
                const metaMessage: UnifiedMessage = {
                  id: `meta-${Date.now()}`,
                  role: 'system',
                  content: '',
                  timestamp: new Date(),
                  type: 'meta',
                  metadata: data
                }
                yield metaMessage
                currentEvent = null
                continue
              }

              // Convert back to UnifiedMessage format for regular events
              const message: UnifiedMessage = {
                id: data.id,
                role: data.role,
                content: data.content,
                timestamp: new Date(data.timestamp),
                type: data.type,
                metadata: data.metadata
              }

              yield message

              // If this is the final message, break
              if (data.isComplete || data.type === 'complete') {
                return
              }

              // Reset event type after processing
              currentEvent = null

            } catch (parseError) {
              // Failed to parse SSE data - continue with next line
              currentEvent = null
            }
          } else if (trimmedLine.startsWith('event: error')) {
            // Handle error event
            const nextLine = lines.shift()
            if (nextLine?.startsWith('data: ')) {
              try {
                const errorData = JSON.parse(nextLine.slice(6))
                throw new Error(errorData.error || 'Stream error')
              } catch (error) {
                throw error instanceof Error ? error : new Error('Stream error')
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Create a streaming response for chat messages
   */
  async createChatStream(
    messageStream: AsyncIterable<UnifiedMessage>,
    options: StreamingOptions = {}
  ): Promise<Response> {
    return this.streamToSSE(messageStream, {
      headers: {
        'X-Chat-Stream': 'true',
        'X-Stream-Type': 'unified'
      },
      ...options
    })
  }
}

// Export singleton instance
export const unifiedStreamingService = new UnifiedStreamingService()

/**
 * Legacy compatibility function for original SSE format
 * Converts string chunks to SSE (compatible with original chat system)
 */
export function sseFromAsyncIterable(source: AsyncIterable<string>): Response {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const iterator = source[Symbol.asyncIterator]()

      try {
        while (true) {
          const { value, done } = await iterator.next()

          if (done) {
            controller.enqueue(encoder.encode(`event: end\ndata: {}\n\n`))
            controller.close()
            return
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`))
        }
      } catch (error) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(error) })}\n\n`))
        controller.close()
      } finally {
        iterator.return?.()
      }
    },

    cancel() {
      // Iterator cleanup is handled in the finally block above
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Disable Nginx buffering
    }
  })
}

/**
 * Utility function to create SSE from message stream
 * @deprecated Use UnifiedStreamingService.createChatStream instead
 */
export function sseFromUnifiedMessages(
  messageStream: AsyncIterable<UnifiedMessage>
): Promise<Response> {
  return unifiedStreamingService.createChatStream(messageStream)
}
