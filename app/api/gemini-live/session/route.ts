import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality, MediaResolution, TurnCoverage } from '@google/genai'

export const runtime = 'nodejs'
export const maxDuration = 60

// Create a Gemini Live session
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const { mode = 'multimodal' } = await req.json()

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const model = 'models/gemini-2.0-flash-exp' // Using available model
    
    const tools = [
      { googleSearch: {} },
    ]

    // Configure based on mode
    const responseModalities = mode === 'audio' 
      ? [Modality.AUDIO]
      : [Modality.TEXT]

    const config = {
      responseModalities,
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

    try {
      const session = await ai.live.connect({
        model,
        config
      })

      // Store session ID for client use
      const sessionId = `session-${Date.now()}`
      
      return NextResponse.json({
        success: true,
        sessionId,
        model,
        config
      })
    } catch (error) {
      console.error('Failed to create live session:', error)
      return NextResponse.json({
        error: 'Live session creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Gemini Live session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}