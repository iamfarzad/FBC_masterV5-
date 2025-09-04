import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    flags: {
      geminiLive: true,
      voiceInput: true,
      webcamCapture: true,
      screenShare: true,
      adminMode: true,
      unifiedChat: true,
      multimodal: true,
      realTimeMonitoring: true,
      advancedAnalytics: true,
      contextPersistence: true
    },
    timestamp: new Date().toISOString()
  })
}