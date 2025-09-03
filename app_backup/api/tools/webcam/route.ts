import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '@/src/core/config'

const genAI = config.ai.gemini.apiKey 
  ? new GoogleGenerativeAI(config.ai.gemini.apiKey)
  : null

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    let analysis

    if (genAI) {
      // Use Gemini Vision for analysis
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' })
      
      const result = await model.generateContent([
        'Analyze this webcam image. Describe what you see, including any people, objects, environment details, and notable features.',
        {
          inlineData: {
            data: base64,
            mimeType: image.type
          }
        }
      ])

      analysis = result.response.text()
    } else {
      // Mock analysis for development
      analysis = {
        description: 'Webcam image analysis would appear here',
        detectedObjects: ['person', 'computer', 'desk'],
        environmentType: 'indoor office',
        lightingConditions: 'well-lit',
        suggestions: [
          'Good camera positioning',
          'Adequate lighting for video calls',
          'Professional background'
        ]
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        size: image.size,
        type: image.type,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Webcam API error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}