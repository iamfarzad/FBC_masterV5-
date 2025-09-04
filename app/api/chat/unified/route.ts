/**
 * Unified Chat API Endpoint
 * Single endpoint that handles all chat modes and streaming
 */

import { NextRequest, NextResponse } from 'next/server'
import { unifiedChatProvider } from '@/src/core/chat/unified-provider'
import { unifiedStreamingService } from '@/src/core/streaming/unified-stream'
import { validateRequest, chatRequestSchema } from '@/src/core/validation'
import {
  UnifiedChatRequest,
  ChatMode,
  UnifiedContext
} from '@/src/core/chat/unified-types'

// Edge Function Configuration for optimal performance
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * Unified POST handler for all chat interactions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate the unified request format
    const validation = validateUnifiedRequest(body)

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: validation.errors
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { messages, context, mode, stream } = validation.data

    // Check if the provider supports the requested mode
    if (!unifiedChatProvider.supportsMode(mode)) {
      return new Response(
        JSON.stringify({
          error: `Unsupported chat mode: ${mode}`,
          supportedModes: unifiedChatProvider.getCapabilities().supportedModes
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create the message stream using the unified provider
    const messageStream = unifiedChatProvider.generate({
      messages,
      ...(context && { context }),
      mode
    });

    // Handle streaming vs non-streaming responses
    if (stream !== false) {
      // Return streaming response
      return unifiedStreamingService.createChatStream(messageStream, {
        headers: {
          'X-Unified-Chat': 'true',
          'X-Chat-Mode': mode,
          'X-Session-Id': context?.sessionId || 'anonymous'
        }
      })
    } else {
      // Collect all messages for non-streaming response
      const messages: any[] = []
      for await (const message of messageStream) {
        messages.push(message)
      }

      return NextResponse.json({
        messages,
        mode,
        sessionId: context?.sessionId,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Unified chat API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    // For streaming requests, send error as SSE
    if (req.headers.get('accept')?.includes('text/event-stream')) {
      const errorStream = unifiedStreamingService.createChatStream(
        (async function* () {
          yield {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
            timestamp: new Date(),
            type: 'text',
            metadata: {
              error: true,
              errorMessage,
              mode: 'error'
            }
          }
        })(),
        {
          headers: {
            'X-Error': 'true'
          }
        }
      )
      return errorStream
    }

    // For regular requests, return JSON error
    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/**
 * GET handler for chat capabilities and status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'capabilities':
        return NextResponse.json({
          capabilities: unifiedChatProvider.getCapabilities(),
          timestamp: new Date().toISOString()
        })

      case 'status':
        return NextResponse.json({
          status: 'operational',
          provider: 'unified-chat',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          message: 'Unified Chat API',
          endpoints: {
            POST: '/api/chat/unified - Send chat messages',
            GET: '/api/chat/unified?action=capabilities - Get capabilities',
            GET: '/api/chat/unified?action=status - Get status'
          },
          supportedModes: unifiedChatProvider.getCapabilities().supportedModes,
          timestamp: new Date().toISOString()
        })
    }

  } catch (error) {
    console.error('Unified chat GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Validate and transform unified chat request
 */
function validateUnifiedRequest(data: unknown): {
  success: true
  data: UnifiedChatRequest
} | {
  success: false
  errors: string[]
} {
  try {
    // Check if this is already in the new unified format
    if (data && typeof data === 'object' && 'messages' in data) {
      const unifiedData = data as any

      // Validate messages array
      if (!Array.isArray(unifiedData.messages)) {
        return {
          success: false,
          errors: ['Messages must be an array']
        }
      }

      // Transform to UnifiedMessage format if needed
      const messages = unifiedData.messages.map((msg: any) => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        type: msg.type || 'text',
        metadata: msg.metadata
      }))

      return {
        success: true,
        data: {
          messages,
          context: unifiedData.context,
          mode: unifiedData.mode || 'standard',
          stream: unifiedData.stream !== false
        }
      }
    }

    // Fallback to legacy validation
    const legacyValidation = validateRequest(chatRequestSchema, data)
    if (!legacyValidation.success) {
      return legacyValidation
    }

    // Transform legacy format to unified format
    const legacyData = legacyValidation.data
    const messages = legacyData.messages.map(msg => ({
      id: crypto.randomUUID(),
      role: msg.role,
      content: msg.content,
      timestamp: new Date(),
      type: 'text' as const
    }))

    // Extract context from legacy data
    const context: UnifiedContext = {
      sessionId: (legacyData as any).data?.conversationSessionId,
      leadContext: (legacyData as any).data?.leadContext ? {
        name: (legacyData as any).data.leadContext.name,
        email: (legacyData as any).data.leadContext.email,
        company: (legacyData as any).data.leadContext.company,
        role: (legacyData as any).data.leadContext.role
      } : undefined
    }

    return {
      success: true,
      data: {
        messages,
        context,
        mode: 'standard' as ChatMode,
        stream: true
      }
    }

  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Validation failed']
    }
  }
}
