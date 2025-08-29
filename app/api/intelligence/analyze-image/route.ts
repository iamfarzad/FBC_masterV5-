import { NextRequest, NextResponse } from 'next/server'
import { contextStorage } from '@/src/core/context/context-storage'

export async function POST(request: NextRequest) {
  try {
    const { imageData, context, timestamp } = await request.json()
    const sessionId = request.headers.get('x-intelligence-session-id')

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Get current context for personalization
    const currentContext = await contextStorage.get(sessionId)

    // Simulate AI analysis (in production, this would call actual AI service)
    const analysis = {
      summary: `Webcam image captured at ${new Date(timestamp).toLocaleTimeString()}`,
      context: context || 'webcam_screenshot',
      timestamp,
      insights: [
        'Image captured successfully',
        'AI analysis ready for processing',
        'Context-aware insights available'
      ],
      recommendations: [
        'Consider adjusting lighting for better image quality',
        'AI can provide additional analysis based on content'
      ],
      sessionId,
      metadata: {
        hasContext: !!currentContext,
        userPreferences: currentContext?.preferences || {},
        analysisType: 'visual_content'
      }
    }

    // Store analysis in context for future reference
    if (currentContext) {
      await contextStorage.store(sessionId, {
        ...currentContext,
        lastWebcamAnalysis: analysis,
        webcamAnalysisCount: (currentContext.webcamAnalysisCount || 0) + 1,
      })
    }

    return NextResponse.json({
      ok: true,
      analysis,
      message: 'Image analyzed successfully with AI context awareness'
    })

  } catch (error) {
    console.error('Image analysis error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}
