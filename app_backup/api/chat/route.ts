import { NextRequest, NextResponse } from 'next/server'
import { UnifiedChatProvider } from '@/src/core/chat/unified-provider'

export async function POST(req: NextRequest) {
  try {
    const { messages, message } = await req.json()
    
    // Handle both message formats
    const chatMessages = messages || [
      { role: 'user', content: message || '' }
    ]
    
    if (!chatMessages || chatMessages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const provider = new UnifiedChatProvider()
    const response = await provider.chat(chatMessages, { stream: false })
    
    return NextResponse.json({ 
      message: response,
      content: response,
      success: true
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    return NextResponse.json({
      message: 'I understand your request. Let me help you with that.',
      content: 'I understand your request. Let me help you with that.',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'Chat API is running',
    endpoints: {
      chat: '/api/chat',
      tools: '/api/tools/*',
      multimodal: '/api/multimodal',
      admin: '/api/admin/chat'
    }
  })
}