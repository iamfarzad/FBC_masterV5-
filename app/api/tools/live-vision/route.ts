import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '@/src/core/config'

const genAI = config.ai.gemini.apiKey 
  ? new GoogleGenerativeAI(config.ai.gemini.apiKey)
  : null

// Store active streams
const activeStreams = new Map<string, {
  source: string
  startTime: Date
  frameCount: number
  lastAnalysis?: string
}>()

export async function POST(req: NextRequest) {
  try {
    const { source, frame, conversationId } = await req.json()
    
    if (!frame) {
      return NextResponse.json(
        { error: 'Frame data required' },
        { status: 400 }
      )
    }

    // Update stream info
    const streamKey = `${conversationId}-${source}`
    const streamInfo = activeStreams.get(streamKey) || {
      source,
      startTime: new Date(),
      frameCount: 0
    }
    streamInfo.frameCount++
    activeStreams.set(streamKey, streamInfo)

    let analysis = null

    // Analyze every 10th frame to avoid overwhelming the API
    if (streamInfo.frameCount % 10 === 0 && genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' })
      
      // Extract base64 data
      const base64Data = frame.replace(/^data:image\/\w+;base64,/, '')
      
      const prompt = source === 'webcam' 
        ? 'You are watching a live webcam feed. Describe what you see, including the person, their actions, environment, and any notable changes from previous frames. Be conversational and helpful.'
        : 'You are watching a live screen share. Describe what\'s on the screen, what the user is working on, applications visible, and provide helpful observations about their workflow.'
      
      try {
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ])
        
        analysis = result.response.text()
        streamInfo.lastAnalysis = analysis
      } catch (error) {
        console.error('Vision API error:', error)
      }
    }

    return NextResponse.json({
      success: true,
      source,
      frameNumber: streamInfo.frameCount,
      analysis: analysis || streamInfo.lastAnalysis,
      streamDuration: Date.now() - streamInfo.startTime.getTime(),
      message: `Frame ${streamInfo.frameCount} processed`
    })

  } catch (error) {
    console.error('Live vision API error:', error)
    return NextResponse.json(
      { error: 'Failed to process frame' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    tool: 'Live Vision Streaming',
    status: 'ready',
    activeStreams: Array.from(activeStreams.entries()).map(([key, info]) => ({
      key,
      source: info.source,
      frameCount: info.frameCount,
      duration: Date.now() - info.startTime.getTime()
    })),
    capabilities: [
      'Real-time webcam analysis',
      'Live screen share monitoring',
      'Continuous AI vision',
      'Frame-by-frame processing'
    ]
  })
}

// Cleanup old streams
export async function DELETE(req: NextRequest) {
  const { conversationId } = await req.json()
  
  const keysToDelete = Array.from(activeStreams.keys())
    .filter(key => key.startsWith(conversationId))
  
  keysToDelete.forEach(key => activeStreams.delete(key))
  
  return NextResponse.json({
    success: true,
    message: `Cleaned up ${keysToDelete.length} streams`
  })
}