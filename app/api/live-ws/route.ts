import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 })
  }

  // For now, redirect to the live server on port 3001
  // In production, this would handle the WebSocket upgrade directly
  const protocol = request.headers.get('x-forwarded-proto') === 'https' ? 'wss' : 'ws'
  const host = request.headers.get('host')
  const redirectUrl = `${protocol}://${host}:3001`
  
  return new Response(`WebSocket endpoint available at ${redirectUrl}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}