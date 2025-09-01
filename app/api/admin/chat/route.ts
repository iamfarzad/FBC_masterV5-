import { NextRequest, NextResponse } from 'next/server'
import { unifiedChatProvider } from '@/src/core/chat/unified-provider'
import { unifiedStreamingService } from '@/src/core/streaming/unified-stream'
import { validateRequest, chatRequestSchema } from '@/src/core/validation'
import { unifiedErrorHandler } from '@/src/core/chat/unified-error-handler'
import type { UnifiedMessage } from '@/src/core/chat/unified-types'

// Edge Function Configuration for optimal performance
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  let sessionId = 'unknown'
  let adminId = 'unknown'

  try {
    const body = await request.json()
    const { message, sessionId: reqSessionId, conversationIds, adminId: reqAdminId } = body
    sessionId = reqSessionId || sessionId
    adminId = reqAdminId || adminId

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      )
    }

    // Initialize admin session
    await unifiedChatProvider.initializeAdminSession(sessionId, adminId)

    // Create user message
    const userMessage: UnifiedMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      type: 'text'
    }

    // Prepare base context for admin mode
    let context = {
      sessionId,
      adminId,
      conversationIds,
      leadContext: conversationIds ? { conversationIds } : undefined
    }

    // INTEGRATE INTELLIGENCE: If conversationIds provided, get intelligence context
    let intelligenceContext = null
    if (conversationIds && conversationIds.length > 0) {
      try {
        // Call server-side intelligence handler
        const intelligenceResponse = await fetch(`${request.nextUrl.origin}/api/admin/server-handler`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'build_admin_context',
            conversationIds,
            sessionId,
            userMessage: message
          })
        })

        if (intelligenceResponse.ok) {
          const intelligenceData = await intelligenceResponse.json()
          intelligenceContext = intelligenceData.context
          // Add intelligence context to unified context
          context = {
            ...context,
            intelligenceContext: intelligenceData.context.adminContext,
            leadResearch: intelligenceData.context.leadResearch
          }
        } else {
          console.warn('Intelligence integration failed:', await intelligenceResponse.text())
        }
      } catch (intelligenceError) {
        console.warn('Intelligence integration error:', intelligenceError)
        // Continue without intelligence data - don't break admin chat
      }
    }

    // Generate response using unified provider
    const messageStream = unifiedChatProvider.generate({
      messages: [userMessage],
      context,
      mode: 'admin'
    })

    // Convert to array for response (admin chat doesn't use streaming)
    const responseMessages: UnifiedMessage[] = []
    for await (const msg of messageStream) {
      responseMessages.push(msg)
    }

    const responseContent = responseMessages.map(m => m.content).join('') || 'I apologize, but I encountered an error processing your request. Please try again.'

    // Update admin session activity
    await unifiedChatProvider.updateAdminActivity(sessionId)

    return NextResponse.json({
      response: responseContent,
      sessionId,
      contextUsed: conversationIds?.length > 0,
      leadsReferenced: conversationIds?.length || 0,
      intelligenceIntegrated: intelligenceContext !== null,
      leadResearchCount: intelligenceContext?.leadResearch?.length || 0
    })

  } catch (error) {
    const chatError = unifiedErrorHandler.handleError(error, {
      sessionId: 'unknown',
      mode: 'admin',
      userId: 'unknown'
    }, 'admin_chat_api')

    return NextResponse.json(
      {
        error: chatError.message,
        code: chatError.code,
        recoverable: chatError.recoverable
      },
      { status: chatError.recoverable ? 500 : 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const query = searchParams.get('query')
    const adminId = searchParams.get('adminId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    if (query) {
      // Semantic search across all conversations using unified provider
      const results = await unifiedChatProvider.searchAdminConversations(query, 10, adminId || undefined)
      return NextResponse.json({ results })
    } else {
      // Get conversation context using unified provider
      const context = await unifiedChatProvider.getAdminConversationContext(sessionId, '', 50)
      return NextResponse.json({ context })
    }

  } catch (error) {
    console.error('Admin chat GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve chat data' },
      { status: 500 }
    )
  }
}