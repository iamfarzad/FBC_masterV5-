import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    success: true,
    metrics: {
      activeUsers: Math.floor(Math.random() * 100),
      requestsPerSecond: Math.floor(Math.random() * 50),
      averageResponseTime: Math.random() * 100,
      errorRate: Math.random() * 5,
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      activeConnections: Math.floor(Math.random() * 200)
    },
    timestamp: new Date().toISOString()
  })
}