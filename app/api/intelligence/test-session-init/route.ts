import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Test session init received body:', body)

    return NextResponse.json({
      success: true,
      message: 'Test session init working',
      receivedBody: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test session init error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
