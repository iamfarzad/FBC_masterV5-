import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Mock AI response for demo purposes
    const responses = [
      "That's an interesting question! I can help you with various AI automation tasks.",
      "I'd be happy to assist you with that. Would you like to use any of the available tools?",
      "Great question! Let me help you explore that topic further.",
      "I can definitely help with that. Would you like to try the ROI calculator or screen sharing tools?",
      "That's a fantastic use case for AI automation. Let me provide some insights."
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      message: randomResponse,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}