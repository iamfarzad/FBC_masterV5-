import { NextRequest, NextResponse } from 'next/server'
import { adminChatService } from '@/src/core/admin/admin-chat-service'

export async function GET(request: NextRequest) {
  try {
    // Test admin session creation
    const sessionId = 'test-session-' + Date.now()
    const adminId = 'test-admin'

    console.log('Testing admin session creation...')
    const session = await adminChatService.getOrCreateSession(sessionId, adminId)
    console.log('Session created:', session)

    // Test message saving
    console.log('Testing message saving...')
    const message = {
      sessionId,
      adminId,
      type: 'user' as const,
      content: 'Test message',
      metadata: { test: true }
    }

    const savedMessage = await adminChatService.saveMessage(message)
    console.log('Message saved:', savedMessage)

    return NextResponse.json({
      success: true,
      session,
      message: savedMessage
    })

  } catch (error) {
    console.error('Test admin error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}


