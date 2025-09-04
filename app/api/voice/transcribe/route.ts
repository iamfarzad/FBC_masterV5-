import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio')
    
    // In production, integrate with speech-to-text service
    // For now, return mock transcription
    return NextResponse.json({
      success: true,
      text: 'This is a transcribed message from the audio input',
      confidence: 0.95,
      language: 'en-US'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}