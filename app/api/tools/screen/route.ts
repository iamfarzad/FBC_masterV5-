import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '@/src/core/config'

const genAI = config.ai.gemini.apiKey 
  ? new GoogleGenerativeAI(config.ai.gemini.apiKey)
  : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { screenshot, action } = body

    if (action === 'start') {
      return NextResponse.json({
        success: true,
        message: 'Screen sharing session started',
        sessionId: `session_${Date.now()}`,
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'stop') {
      return NextResponse.json({
        success: true,
        message: 'Screen sharing session ended',
        timestamp: new Date().toISOString()
      })
    }

    if (!screenshot) {
      return NextResponse.json(
        { error: 'Screenshot data required' },
        { status: 400 }
      )
    }

    let analysis

    if (genAI) {
      // Use Gemini Vision for screen analysis
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' })
      
      const result = await model.generateContent([
        'Analyze this screenshot. Identify applications, UI elements, content, and provide insights about what the user is working on.',
        {
          inlineData: {
            data: screenshot,
            mimeType: 'image/png'
          }
        }
      ])

      analysis = result.response.text()
    } else {
      // Mock analysis
      analysis = {
        applications: ['VS Code', 'Chrome', 'Terminal'],
        activeWindow: 'Code Editor',
        content: 'Appears to be working on a web development project',
        insights: [
          'Multiple tabs open suggesting research activity',
          'Code editor shows JavaScript/TypeScript file',
          'Terminal indicates active development server'
        ],
        productivity_score: 85
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Screen share API error:', error)
    return NextResponse.json(
      { error: 'Failed to process screen data' },
      { status: 500 }
    )
  }
}