/**
 * 🚨 DEPRECATED API ENDPOINT
 * This endpoint is deprecated and will be removed after the deprecation window.
 * Use /api/chat/unified with mode: 'realtime' instead.
 *
 * This proxy forwards requests to the unified chat system while logging deprecation warnings.
 */

import { NextRequest, NextResponse } from 'next/server'

interface LiveSessionRequest {
  action: 'start' | 'send' | 'end' | 'probe'
  sessionId?: string
  leadContext?: {
    name?: string
    email?: string
    company?: string
    role?: string
  }
  message?: string
  audioData?: string
  imageData?: string
  mimeType?: string
}

// Session management for Live API
interface LiveSession {
  session: LiveSessionLike // Google GenAI LiveSession type
  leadContext?: LiveSessionRequest['leadContext']
}
const liveSessions = new Map<string, LiveSession>()

export async function POST(req: NextRequest) {
  // 🚨 DEPRECATION WARNING
  console.warn('⚠️ DEPRECATED API CALL: /api/gemini-live - Use /api/chat/unified with mode: "realtime" instead')

  // Log deprecation telemetry
  const callerInfo = {
    endpoint: '/api/gemini-live',
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
    sessionId: req.headers.get('x-intelligence-session-id'),
    referrer: req.headers.get('referer')
  }

  console.log('📊 Deprecation telemetry:', callerInfo)

  try {
    const body = await req.json()
    const { action, sessionId, leadContext, message, audioData, imageData, mimeType } = body

    // Transform legacy format to unified format based on action
    let unifiedRequest: any

    switch (action) {
      case 'probe':
        // For probe, just forward to unified status
        const response = await fetch(new URL("/api/chat/unified?action=status", req.url))
        return new NextResponse(response.body, {
          status: response.status,
          headers: new Headers({
            ...Object.fromEntries(response.headers.entries()),
            "x-deprecated": "true",
            "x-deprecation-note": "Use /api/chat/unified?action=status"
          }) as any,
        })

      case 'start':
        unifiedRequest = {
          messages: [{
            id: crypto.randomUUID(),
            role: 'user',
            content: 'Initialize real-time voice session',
            timestamp: new Date(),
            type: 'text'
          }],
          context: {
            sessionId,
            leadContext
          },
          mode: 'realtime'
        }
        break

      case 'send':
        unifiedRequest = {
          messages: [{
            id: crypto.randomUUID(),
            role: 'user',
            content: message || 'Voice input received',
            timestamp: new Date(),
            type: 'text'
          }],
          context: {
            sessionId,
            multimodalData: {
              ...(audioData && { audioData, mimeType: mimeType || 'audio/pcm;rate=16000' }),
              ...(imageData && { imageData })
            }
          },
          mode: 'realtime'
        }
        break

      case 'end':
        unifiedRequest = {
          messages: [{
            id: crypto.randomUUID(),
            role: 'user',
            content: 'End real-time session',
            timestamp: new Date(),
            type: 'text'
          }],
          context: { sessionId },
          mode: 'realtime'
        }
        break

      default:
        return NextResponse.json({
          error: 'Invalid action',
          deprecation: {
            message: 'This endpoint is deprecated',
            replacement: '/api/chat/unified',
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        }, { status: 400 })
    }

    // Forward to unified chat endpoint
    const response = await fetch(new URL("/api/chat/unified", req.url), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-deprecated": "true",
        "x-deprecation-source": "/api/gemini-live"
      },
      body: JSON.stringify(unifiedRequest),
    })

    // Return response with deprecation headers
    return new NextResponse(response.body, {
      status: response.status,
      headers: new Headers({
        ...Object.fromEntries(response.headers.entries()),
        "x-deprecated": "true",
        "x-deprecation-note": "Use /api/chat/unified with mode: 'realtime'",
        "x-deprecation-deadline": new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }) as any,
    })

  } catch (error) {
    console.error('Error in deprecated gemini-live proxy:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error in deprecated endpoint',
      deprecation: {
        message: 'This endpoint is deprecated',
        replacement: '/api/chat/unified',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    }, { status: 500 })
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'