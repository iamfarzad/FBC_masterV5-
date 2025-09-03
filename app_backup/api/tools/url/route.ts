import { NextRequest, NextResponse } from 'next/server'
import { urlContextService } from '@/src/core/services/url-context-service'

export async function POST(req: NextRequest) {
  try {
    const { url, query } = await req.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const analysis = await urlContextService.analyzeURL(url, query)

    return NextResponse.json({
      success: true,
      url,
      analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('URL analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze URL' },
      { status: 500 }
    )
  }
}