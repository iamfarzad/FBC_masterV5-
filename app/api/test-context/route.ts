import { NextRequest, NextResponse } from 'next/server'
import { ContextStorage } from '@/src/core/context/context-storage'

const contextStorage = new ContextStorage()

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, data } = await req.json()

    switch (action) {
      case 'store':
        await contextStorage.store(sessionId, data)
        return NextResponse.json({ success: true, message: 'Context stored' })

      case 'get':
        const context = await contextStorage.get(sessionId)
        return NextResponse.json({ success: true, context })

      case 'update':
        await contextStorage.update(sessionId, data)
        return NextResponse.json({ success: true, message: 'Context updated' })

      case 'delete':
        await contextStorage.delete(sessionId)
        return NextResponse.json({ success: true, message: 'Context deleted' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Test context API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
