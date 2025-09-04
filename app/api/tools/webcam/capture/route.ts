import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null
    const prompt = formData.get('prompt') as string || 'Describe what you see in this image in detail'
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Use real Gemini Vision API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type || 'image/jpeg',
          data: base64Image
        }
      }
    ])

    const analysis = result.response.text()

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Webcam image analyzed with Gemini Vision',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Webcam capture error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze webcam image', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}