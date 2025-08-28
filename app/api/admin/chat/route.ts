import { NextRequest, NextResponse } from 'next/server'
import { adminChatService } from '@/src/core/admin/admin-chat-service'
import { getProvider } from '@/src/core/ai'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, conversationIds, adminId } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      )
    }

    // Ensure session exists
    await adminChatService.getOrCreateSession(sessionId, adminId)

    // Save user message
    await adminChatService.saveMessage({
      sessionId,
      adminId,
      type: 'user',
      content: message,
      contextLeads: conversationIds
    })

    // Build AI context from conversation history and lead data
    const context = await adminChatService.buildAIContext(
      sessionId,
      message,
      conversationIds
    )

    // Get AI response
    const provider = getProvider()
    const messages = [
      {
        role: 'system' as const,
        content: `You are an AI assistant helping with lead management and business operations. You have access to conversation history and can reference specific leads when asked. Always be helpful, accurate, and professional.`
      },
      {
        role: 'user' as const,
        content: `${context}\n\nCurrent User Query: ${message}\n\nPlease provide a helpful response based on the available context.`
      }
    ]

    let responseContent = ''
    try {
      for await (const chunk of provider.generate({ messages })) {
        if (chunk) {
          responseContent += chunk
        }
      }
    } catch (error) {
      console.error('AI generation error:', error)
      responseContent = 'I apologize, but I encountered an error processing your request. Please try again.'
    }

    // Save assistant response
    await adminChatService.saveMessage({
      sessionId,
      adminId,
      type: 'assistant',
      content: responseContent,
      contextLeads: conversationIds,
      metadata: {
        context_used: context.length > 0,
        leads_referenced: conversationIds?.length || 0
      }
    })

    return NextResponse.json({
      response: responseContent,
      sessionId,
      contextUsed: context.length > 0,
      leadsReferenced: conversationIds?.length || 0
    })

  } catch (error) {
    console.error('Admin chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
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
      // Semantic search across all conversations
      const results = await adminChatService.searchAllConversations(query, 10, adminId || undefined)
      return NextResponse.json({ results })
    } else {
      // Get conversation context
      const context = await adminChatService.getConversationContext(sessionId, '', 50)
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