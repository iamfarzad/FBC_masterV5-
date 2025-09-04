import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Handle WebSocket upgrade
export async function GET(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response('API key not configured', { status: 500 })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // For now, return a simple response since Next.js doesn't support WebSocket upgrades in API routes
    // We need to use a separate WebSocket server or Server-Sent Events instead
    return new Response('WebSocket endpoint - use SSE for streaming instead', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  } catch (error) {
    console.error('WebSocket error:', error)
    return new Response('WebSocket connection failed', { status: 500 })
  }
}

// Handle POST for Server-Sent Events streaming
export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response('API key not configured', { status: 500 })
  }

  try {
    const { message, mode } = await req.json()
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Use the standard Gemini model with streaming
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })

    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start async streaming
    (async () => {
      try {
        const result = await model.generateContentStream(message)
        
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            )
          }
        }
        
        await writer.write(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        console.error('Streaming error:', error)
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
        )
      } finally {
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('SSE error:', error)
    return new Response('Streaming failed', { status: 500 })
  }
}