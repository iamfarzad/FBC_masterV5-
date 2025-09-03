import { NextRequest, NextResponse } from 'next/server'
import { translationService } from '@/src/core/services/translation-service'

export async function POST(req: NextRequest) {
  try {
    const { text, source, target, format } = await req.json()

    if (!text || !target) {
      return NextResponse.json(
        { error: 'Text and target language required' },
        { status: 400 }
      )
    }

    const translation = await translationService.translate(text, {
      source,
      target,
      format
    })

    return NextResponse.json({
      success: true,
      original: text,
      translation,
      source: source || 'auto',
      target,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    supportedLanguages: translationService.getSupportedLanguages()
  })
}