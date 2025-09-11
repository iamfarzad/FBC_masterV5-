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

// Node.js runtime for streaming compatibility - no edge caching
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * Unified POST handler for all chat interactions
 */
export async function POST(req: NextRequest) {
  try {
    // Request correlation for debugging
    const reqId = req.headers.get('x-request-id') || (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    const startTime = Date.now()
    console.log('[UNIFIED_ROUTE] Called with reqId:', reqId)

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

    const chatMode = mode || 'standard';
    let chatContext = context || { sessionId: 'anonymous' };

    // Log request start
    console.log('[UNIFIED]', { reqId, phase: 'start', mode: chatMode, hasContext: !!chatContext.intelligenceContext })

    // 🔧 MASTER FLOW: Server-side safety net - lazy-load intelligence context if missing
    if (!chatContext.intelligenceContext && chatContext.sessionId && chatContext.sessionId !== 'anonymous') {
      try {
        console.log('🔍 Server-side: Loading intelligence context for session:', chatContext.sessionId)

        const { ContextStorage } = await import('@/src/core/context/context-storage')
        const contextStorage = new ContextStorage()
        const storedContext = await contextStorage.get(chatContext.sessionId)

        if (storedContext) {
          // Check if we have meaningful intelligence data
          const hasIntelligenceData = storedContext.company_context ||
                                     storedContext.person_context ||
                                     storedContext.role ||
                                     (storedContext.ai_capabilities_shown && storedContext.ai_capabilities_shown.length > 0)

          if (hasIntelligenceData) {
            chatContext.intelligenceContext = {
              lead: {
                email: storedContext.email || '',
                name: storedContext.name || 'Unknown'
              },
              ...(storedContext.company_context ? { company: storedContext.company_context } : {}),
              ...(storedContext.person_context ? { person: storedContext.person_context } : {}),
              ...(storedContext.role ? { role: storedContext.role } : {}),
              ...(storedContext.role_confidence !== null ? { roleConfidence: storedContext.role_confidence } : {}),
              capabilities: storedContext.ai_capabilities_shown || [],
              ...(storedContext.intent_data ? { intent: storedContext.intent_data } : {})
            }
            console.log('✅ Server-side intelligence context loaded successfully for session:', chatContext.sessionId)
          } else {
            console.log('ℹ️ Server-side: No intelligence data available for session:', chatContext.sessionId)
          }
        } else {
          console.log('ℹ️ Server-side: No stored context found for session:', chatContext.sessionId)
        }
      } catch (error) {
        console.warn('⚠️ Failed to lazy-load intelligence context:', error)
      }
    }

    // Check if the provider supports the requested mode
    if (!unifiedChatProvider.supportsMode(chatMode)) {
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
      context: chatContext,
      mode: chatMode
    });

    // Handle streaming vs non-streaming responses
    if (stream !== false) {
      // Log completion for streaming
      console.log('[UNIFIED]', { reqId, phase: 'end', tokensOut: 'streaming', ms: Date.now() - startTime })

      // Return streaming response with meta event for reqId
      console.log('[UNIFIED_ROUTE] Returning streaming response with reqId in payload:', reqId)
      console.log('[UNIFIED_ROUTE] Headers being sent:', {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'x-fbc-endpoint': 'unified',
        'x-request-id': reqId
      })
      return unifiedStreamingService.streamToSSE(messageStream, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'x-fbc-endpoint': 'unified',
          'x-request-id': reqId,
          'X-Unified-Chat': 'true',
          'X-Chat-Mode': chatMode,
          'X-Session-Id': chatContext?.sessionId || 'anonymous'
        },
        reqId // Pass reqId to streaming service for meta event
      })
      console.log('[UNIFIED_ROUTE] Called streaming service with reqId:', reqId)
    } else {
      // Collect all messages for non-streaming response
      const responseMessages: any[] = []
      let tokenCount = 0
      for await (const message of messageStream) {
        responseMessages.push(message)
        tokenCount += message.content?.length || 0
      }

      // Log completion for non-streaming
      console.log('[UNIFIED]', { reqId, phase: 'end', tokensOut: tokenCount, ms: Date.now() - startTime })

      return NextResponse.json({
        messages: responseMessages,
        mode,
        sessionId: context?.sessionId,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'x-fbc-endpoint': 'unified',
          'x-request-id': reqId
        }
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
            'GET (capabilities)': '/api/chat/unified?action=capabilities - Get capabilities',
            'GET (status)': '/api/chat/unified?action=status - Get status'
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
          mode: unifiedData.mode || ('standard' as ChatMode),
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
    const leadContextData = (legacyData as any).data?.leadContext;
    const context: UnifiedContext = {
      sessionId: (legacyData as any).data?.conversationSessionId,
      ...(leadContextData && { leadContext: {
        name: leadContextData.name || '',
        email: leadContextData.email || '',
        company: leadContextData.company || '',
        role: leadContextData.role || ''
      }})
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
