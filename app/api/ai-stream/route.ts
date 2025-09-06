/**
 * 🚨 DEPRECATED API ENDPOINT
 * This endpoint is deprecated and will be removed after the deprecation window.
 * Use /api/chat/unified instead.
 *
 * This proxy forwards requests to the unified chat system while logging deprecation warnings.
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // 🚨 DEPRECATION WARNING
  console.warn('⚠️ DEPRECATED API CALL: /api/ai-stream - Use /api/chat/unified instead')

  // Log deprecation telemetry
  const callerInfo = {
    endpoint: '/api/ai-stream',
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent'),
    sessionId: req.headers.get('x-intelligence-session-id'),
    referrer: req.headers.get('referer')
  }

  console.log('📊 Deprecation telemetry:', callerInfo)

  try {
    const body = await req.json()

    // Transform legacy format to unified format
    const unifiedRequest = {
      messages: [{
        id: crypto.randomUUID(),
        role: 'user',
        content: body.prompt || 'Hello',
        timestamp: new Date(),
        type: 'text'
      }],
      context: {
        sessionId: body.sessionId,
        // Add conversation history if provided
        ...(body.conversationHistory && {
          conversationHistory: body.conversationHistory
        })
      },
      mode: 'standard',
      stream: body.enableStreaming !== false
    }

    // Forward to unified chat endpoint
    const reqId = req.headers.get('x-request-id') || (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    console.log('[UNIFIED]['+reqId+'] sending');
    const response = await fetch(new URL("/api/chat/unified", req.url), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": reqId,
        "x-deprecated": "true",
        "x-deprecation-source": "/api/ai-stream"
      },
      body: JSON.stringify(unifiedRequest),
    })

    // Return response with deprecation headers
    return new NextResponse(response.body, {
      status: response.status,
      headers: new Headers({
        ...Object.fromEntries(response.headers.entries()),
        "x-deprecated": "true",
        "x-deprecation-note": "Use /api/chat/unified - this endpoint will be removed",
        "x-deprecation-deadline": new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
      }) as any,
    })

  } catch (error) {
    console.error('Error in deprecated ai-stream proxy:', error)
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

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "x-deprecated": "true",
      "x-deprecation-note": "Use /api/chat/unified - this endpoint will be removed"
    },
  })
}
