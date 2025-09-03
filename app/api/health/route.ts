import { NextResponse } from 'next/server'
import { getSupabaseStorage } from '@/src/services/storage/supabase'

export async function GET() {
  try {
    // Test database connectivity
    let dbStatus = 'down'
    try {
      const supabase = getSupabaseStorage()
      // Quick health check - just test if we can create a client
      if (supabase) {
        dbStatus = 'ok'
      }
    } catch (error) {
      dbStatus = 'error'
    }

    return NextResponse.json({
      ok: true,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
      liveEnabled: process.env.LIVE_ENABLED === 'true',
      db: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      ai: {
        geminiConfigured: !!process.env.GEMINI_API_KEY,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        hasViteKey: !!process.env.VITE_GEMINI_API_KEY,
        viteKeyLength: process.env.VITE_GEMINI_API_KEY?.length || 0,
        hasServerKey: !!process.env.GEMINI_API_KEY_SERVER,
        serverKeyLength: process.env.GEMINI_API_KEY_SERVER?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
