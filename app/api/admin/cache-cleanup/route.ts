import { NextRequest, NextResponse } from 'next/server'
import { adminAuthMiddleware } from '@/src/core/auth/index'
import { geminiConfig } from '@/src/core/models/gemini'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResponse = await adminAuthMiddleware({
      authorization: request.headers.get('authorization'),
      'x-admin-password': request.headers.get('x-admin-password')
    })
    if (authResponse) {
      return authResponse
    }

    // Perform cache cleanup
    geminiConfig.clearAllCache()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleanup completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // console.error('Cache cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to perform cache cleanup' },
      { status: 500 }
    )
  }
}