import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const EventSchema = z.object({
  sessionId: z.string().optional(),
  eventType: z.enum(['session_start', 'tool_used', 'intent_detected', 'suggestion_clicked', 'conversation_end']),
  eventData: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
  userId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedEvent = EventSchema.parse(body)
    
    // Add timestamp if not provided
    const _event = {
      ...validatedEvent,
      timestamp: validatedEvent.timestamp || Date.now()
    }

    // TODO: Send to analytics service (Mixpanel, PostHog, etc.)
    // await analytics.track(_event.eventType, {
    //   sessionId: _event.sessionId,
    //   userId: _event.userId,
    //   ..._event.eventData
    // })

    return NextResponse.json({
      success: true,
      message: "Event logged successfully",
      eventId: `evt_${Date.now()}`
    })
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.error('❌ Event tracking failed', _error)
    return NextResponse.json(
      { ok: false, error: 'Invalid event data' },
      { status: 400 }
    )
  }
}

export function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Intelligence Events API - POST events to this endpoint'
  })
}


