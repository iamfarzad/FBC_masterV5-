import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const screenshot = formData.get('screenshot') as File | null
    const context = formData.get('context') as string || 'Analyze this screen and provide insights'
    
    if (!screenshot) {
      return NextResponse.json(
        { error: 'No screenshot provided' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Convert screenshot to base64
    const bytes = await screenshot.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Use real Gemini Vision API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      context,
      {
        inlineData: {
          mimeType: screenshot.type || 'image/jpeg',
          data: base64Image
        }
      }
    ])

    const analysis = result.response.text()

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Screen analyzed with Gemini Vision',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Screen capture error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze screen', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}