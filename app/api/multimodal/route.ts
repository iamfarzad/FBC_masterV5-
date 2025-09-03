import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '@/src/core/config'

const genAI = config.ai.gemini.apiKey 
  ? new GoogleGenerativeAI(config.ai.gemini.apiKey)
  : null

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const type = formData.get('type') as string
    const conversationId = formData.get('conversationId') as string

    let response: any

    switch (type) {
      case 'image':
        const imageFile = formData.get('image') as File
        if (!imageFile) {
          return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }
        response = await processImage(imageFile)
        break

      case 'audio':
        const audioFile = formData.get('audio') as File
        if (!audioFile) {
          return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
        }
        response = await processAudio(audioFile)
        break

      case 'text':
        const text = formData.get('content') as string
        if (!text) {
          return NextResponse.json({ error: 'No text provided' }, { status: 400 })
        }
        response = await processText(text)
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type,
      conversationId,
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Multimodal API error:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}

async function processImage(file: File) {
  if (!genAI) {
    return {
      analysis: 'Image received. Analysis would be performed here.',
      mockData: true
    }
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' })
  
  const imageData = await file.arrayBuffer()
  const base64 = Buffer.from(imageData).toString('base64')
  
  const result = await model.generateContent([
    'Analyze this image and describe what you see.',
    {
      inlineData: {
        data: base64,
        mimeType: file.type
      }
    }
  ])

  return {
    analysis: result.response.text(),
    metadata: {
      size: file.size,
      type: file.type,
      name: file.name
    }
  }
}

async function processAudio(file: File) {
  // Audio processing would go here
  return {
    transcription: 'Audio transcription would appear here',
    duration: '00:00',
    mockData: true
  }
}

async function processText(text: string) {
  if (!genAI) {
    return {
      response: `Processing: "${text}"`,
      mockData: true
    }
  }

  const model = genAI.getGenerativeModel({ model: config.ai.gemini.model })
  const result = await model.generateContent(text)
  
  return {
    response: result.response.text()
  }
}