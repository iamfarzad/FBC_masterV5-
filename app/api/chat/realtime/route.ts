/**
 * AI SDK Real-time Chat Route
 * WebSocket-compatible streaming with AI SDK
 */

import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { z } from 'zod'

const model = google('gemini-1.5-flash-latest') // Use flash for real-time performance

// Real-time request schema
const realtimeRequestSchema = z.object({
  message: z.string(),
  sessionId: z.string(),
  connectionId: z.string().optional(),
  context: z.object({
    isVoice: z.boolean().default(false),
    audioData: z.string().optional(),
    videoData: z.string().optional(),
    screenData: z.string().optional()
  }).optional()
})

export async function POST(req: Request) {
  try {
    const { message, sessionId, connectionId, context } = realtimeRequestSchema.parse(await req.json())
    
    console.log('[AI_SDK_REALTIME] Request:', { 
      sessionId, 
      connectionId,
      messageLength: message.length,
      isVoice: context?.isVoice || false
    })

    // Build system prompt for real-time interaction
    let systemPrompt = `You are F.B/c AI in real-time mode. Provide quick, concise, and helpful responses.
    
Key guidelines for real-time:
- Keep responses under 100 words unless specifically asked for detail
- Be conversational and natural
- Provide immediate value
- Ask clarifying questions when needed
- Suggest relevant tools and actions`

    // Add multimodal context
    if (context?.isVoice) {
      systemPrompt += '\n\nThis is a voice conversation. Respond naturally as if speaking.'
    }
    
    if (context?.audioData) {
      systemPrompt += '\n\nUser provided audio input. Acknowledge and respond appropriately.'
    }
    
    if (context?.videoData || context?.screenData) {
      systemPrompt += '\n\nUser shared visual content. Provide relevant analysis and feedback.'
    }

    // Stream response optimized for real-time
    const result = await streamText({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      temperature: 0.8, // Slightly higher for more natural real-time responses
      maxTokens: 500, // Limit for real-time performance
      onFinish: (result) => {
        console.log('[AI_SDK_REALTIME] Completed:', {
          sessionId,
          connectionId,
          tokensUsed: result.usage?.totalTokens || 0,
          responseTime: Date.now()
        })
      }
    })

    // Return real-time streaming response
    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Chat-Mode': 'realtime',
        'X-Session-Id': sessionId,
        'X-Connection-Id': connectionId || 'unknown',
        'X-Response-Type': 'stream'
      }
    })

  } catch (error) {
    console.error('[AI_SDK_REALTIME] Error:', error)
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Real-time chat error',
        timestamp: new Date().toISOString(),
        sessionId: req.url.includes('sessionId') ? new URL(req.url).searchParams.get('sessionId') : undefined
      },
      { status: 500 }
    )
  }
}

// WebSocket upgrade handler for real-time connections
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return Response.json({ error: 'sessionId required for real-time connection' }, { status: 400 })
  }

  // In a full implementation, this would handle WebSocket upgrade
  // For now, return connection info
  return Response.json({
    message: 'AI SDK Real-time Chat API',
    sessionId,
    connectionType: 'HTTP streaming', // Would be 'WebSocket' in full implementation
    capabilities: ['text', 'voice', 'multimodal'],
    status: 'ready',
    timestamp: new Date().toISOString()
  })
}