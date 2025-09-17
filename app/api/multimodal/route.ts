/**
 * Multimodal API - Fixed for V2
 * Simple working implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const model = google('gemini-1.5-pro-latest')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { modality, content, metadata } = body

    console.log('[MULTIMODAL] Request:', { modality, hasContent: !!content })

    // Simple AI SDK processing
    const result = await generateText({
      model,
      system: `You are F.B/c AI processing ${modality} input. Provide helpful analysis.`,
      prompt: content || `Process ${modality} input`
    })

    return NextResponse.json({
      success: true,
      output: {
        analysis: result.text,
        modality,
        sessionId: metadata?.sessionId || 'multimodal-session',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[MULTIMODAL] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Multimodal processing failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Multimodal API - AI SDK Backend',
    supportedModalities: ['text', 'voice', 'vision', 'upload'],
    status: 'operational',
    backend: 'AI SDK',
    timestamp: new Date().toISOString()
  })
}