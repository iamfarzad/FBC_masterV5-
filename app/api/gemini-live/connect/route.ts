import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality, MediaResolution, TurnCoverage } from '@google/genai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, mode } = await req.json()
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const model = 'models/gemini-2.0-flash-exp'

    const tools = [
      { googleSearch: {} },
    ]

    const config = {
      responseModalities: [
        mode === 'audio' ? Modality.AUDIO : Modality.TEXT,
      ],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: mode === 'audio' ? {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Puck',
          }
        }
      } : undefined,
      realtimeInputConfig: {
        turnCoverage: TurnCoverage.TURN_INCLUDES_ALL_INPUT,
      },
      contextWindowCompression: {
        triggerTokens: '25600',
        slidingWindow: { targetTokens: '12800' },
      },
      tools,
    }

    // Return connection details for client to establish WebSocket
    return NextResponse.json({
      success: true,
      sessionId,
      config,
      wsUrl: `wss://generativelanguage.googleapis.com/v1alpha/models/${model}:streamGenerateContent`,
      apiKey: process.env.GEMINI_API_KEY, // Client needs this for auth
      model,
    })
  } catch (error) {
    console.error('Gemini Live connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize Gemini Live connection' },
      { status: 500 }
    )
  }
}