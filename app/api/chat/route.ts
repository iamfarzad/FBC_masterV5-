import { NextRequest, NextResponse } from 'next/server'
import { handleChat } from '@/src/api/chat/handler'
import { validateRequest, chatRequestSchema } from '@/src/core/validation'

// Edge Function Configuration for Real-Time Performance
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request using the same pattern as FB-c_labV3-main
    const validation = validateRequest(chatRequestSchema, body)

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

    // Pass validated data to handler and preserve useful extras from the original body
    const extras: Record<string, unknown> = {}
    if (body && typeof body === 'object') {
      const { sessionId, leadContext, conversationStage, hasGreeted } = body as any
      if (sessionId) extras.sessionId = sessionId
      if (leadContext) extras.leadContext = leadContext
      if (conversationStage) extras.conversationStage = conversationStage
      if (typeof hasGreeted !== 'undefined') extras.hasGreeted = hasGreeted
    }

    // Edge Function will handle streaming
    return await handleChat({
      ...validation.data,
      ...extras,
      version: 'v1'
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
