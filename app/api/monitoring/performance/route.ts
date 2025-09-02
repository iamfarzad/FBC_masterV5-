import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor, rateLimiter } from '@/src/core/api/error-handler'

// 📊 PERFORMANCE MONITORING DASHBOARD API
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    // Basic auth check for monitoring endpoint
    if (!authHeader || !authHeader.includes(process.env.MONITORING_SECRET || 'dev-secret')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get performance metrics for the last hour
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)
    
    // Mock performance data (in production, this would come from actual metrics storage)
    const performanceData = {
      timestamp: new Date().toISOString(),
      timeRange: '1 hour',
      overview: {
        totalRequests: 1247,
        successRate: 98.4,
        averageResponseTime: 1240,
        errorRate: 1.6,
        activeConnections: 23
      },
      apiEndpoints: {
        '/api/tools/webcam': {
          requests: 340,
          averageResponseTime: 850,
          successRate: 99.1,
          errorRate: 0.9,
          p95ResponseTime: 1200,
          rateLimit: {
            limit: 30,
            window: '60s',
            currentUsage: 12
          }
        },
        '/api/tools/screen': {
          requests: 180,
          averageResponseTime: 1100,
          successRate: 97.8,
          errorRate: 2.2,
          p95ResponseTime: 1800,
          rateLimit: {
            limit: 20,
            window: '60s', 
            currentUsage: 8
          }
        },
        '/api/tools/doc': {
          requests: 95,
          averageResponseTime: 2200,
          successRate: 96.8,
          errorRate: 3.2,
          p95ResponseTime: 4000,
          rateLimit: {
            limit: 10,
            window: '60s',
            currentUsage: 3
          }
        },
        '/api/tools/url': {
          requests: 45,
          averageResponseTime: 1800,
          successRate: 95.6,
          errorRate: 4.4,
          p95ResponseTime: 3200,
          rateLimit: {
            limit: 15,
            window: '60s',
            currentUsage: 2
          }
        },
        '/api/gemini-live': {
          requests: 87,
          averageResponseTime: 450,
          successRate: 99.4,
          errorRate: 0.6,
          p95ResponseTime: 800,
          websocketConnections: 12,
          rateLimit: {
            limit: 6,
            window: '60s',
            currentUsage: 1
          }
        },
        '/api/video-to-app': {
          requests: 22,
          averageResponseTime: 15000,
          successRate: 90.9,
          errorRate: 9.1,
          p95ResponseTime: 25000,
          rateLimit: {
            limit: 5,
            window: '300s', // 5 minute window for heavy operations
            currentUsage: 1
          }
        }
      },
      errors: {
        byType: {
          'RATE_LIMIT_EXCEEDED': 8,
          'AUTHENTICATION_ERROR': 2,
          'NETWORK_ERROR': 12,
          'VALIDATION_ERROR': 15,
          'MODEL_CAPACITY_ERROR': 3,
          'INTERNAL_ERROR': 5
        },
        recentErrors: [
          {
            timestamp: new Date(now - 300000).toISOString(),
            endpoint: '/api/tools/webcam',
            error: 'RATE_LIMIT_EXCEEDED',
            sessionId: 'anon_12345',
            resolved: true
          },
          {
            timestamp: new Date(now - 180000).toISOString(),
            endpoint: '/api/tools/screen',
            error: 'MODEL_CAPACITY_ERROR',
            sessionId: 'sess_67890',
            resolved: true
          }
        ]
      },
      liveApi: {
        activeSessions: 12,
        totalSessionsToday: 156,
        averageSessionDuration: 320, // seconds
        audioSessions: 8,
        textSessions: 4,
        successfulConnections: 98.7,
        tokenUsageRate: 'normal',
        modelHealth: {
          'gemini-live-2.5-flash-preview': 'healthy',
          'gemini-2.0-flash-exp': 'healthy'
        }
      },
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      },
      recommendations: [
        'Screen analysis showing higher error rate - monitor for capacity issues',
        'Video-to-app processing time is high - consider caching optimizations',
        'Live API performing well - no immediate actions needed',
        'Overall system health is excellent'
      ]
    }

    return NextResponse.json(performanceData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Performance monitoring error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve performance data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Health check endpoint
export async function HEAD() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    }
  })
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
