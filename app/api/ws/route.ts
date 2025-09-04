import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// WebSocket endpoint for real-time communication
export async function GET(request: NextRequest) {
  // WebSocket upgrade is handled at the server level
  // This is a placeholder that returns connection info
  return new Response(
    JSON.stringify({
      message: 'WebSocket endpoint',
      url: 'ws://localhost:5000/api/ws',
      status: 'ready'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}