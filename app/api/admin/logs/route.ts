import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const level = searchParams.get('level') || 'all'
  
  return NextResponse.json({
    success: true,
    logs: [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'System initialized successfully',
        context: { module: 'core' }
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: 'High memory usage detected',
        context: { usage: '85%' }
      }
    ].filter(log => level === 'all' || log.level === level),
    total: 2
  })
}