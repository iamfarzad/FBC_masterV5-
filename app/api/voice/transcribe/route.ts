import { NextRequest, NextResponse } from 'next/server'

// Keep simple and unambiguous: Live API handles voice.
// This endpoint is intentionally disabled to avoid confusion in production.
export const runtime = 'edge'

export async function POST() {
  return NextResponse.json({ error: 'Disabled: Use Gemini Live WebSocket for voice.' }, { status: 405 })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
