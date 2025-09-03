// 🤖 ADMIN SYSTEM STATUS API - Intelligent Query Processing
// WHY: Let admins ask natural language questions about system health
// BUSINESS IMPACT: Quick insights without navigating complex dashboards

import { NextRequest, NextResponse } from 'next/server'
import { adminChatContext, AdminQuery } from '@/src/core/admin/AdminChatContext'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, context = 'admin', priority = 'normal' }: AdminQuery = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        {
          error: 'Question is required and must be a string',
          example: 'How is the system performing?',
          supportedQueries: [
            'How is the system doing?',
            'What is the memory usage?',
            'How is performance?',
            'Any errors?',
            'Quick status',
            'Comprehensive overview'
          ]
        },
        { status: 400 }
      )
    }

    // Process the query using our intelligent admin context
    const response = await adminChatContext.processQuery({
      question: question.trim(),
      context,
      priority
    })

    return NextResponse.json({
      success: true,
      ...response
    })

  } catch (error) {
    console.error('Admin system status error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process system status query',
      timestamp: Date.now(),
      fallback: {
        answer: "I apologize, but I'm having trouble accessing system status right now. Please try the System Health dashboard for detailed information.",
        recommendations: [
          'Check the System Health dashboard',
          'Refresh the page and try again',
          'Contact technical support if issues persist'
        ],
        severity: 'warning'
      }
    }, { status: 500 })
  }
}

// GET endpoint for quick status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'quick'

    let question = 'Quick status overview'
    if (type === 'comprehensive') {
      question = 'Comprehensive system status'
    } else if (type === 'performance') {
      question = 'How is system performance?'
    } else if (type === 'health') {
      question = 'What is the overall system health?'
    }

    const response = await adminChatContext.processQuery({
      question,
      context: 'admin',
      priority: 'high'
    })

    return NextResponse.json({
      success: true,
      type,
      ...response
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Quick status check failed',
      type: 'error'
    }, { status: 500 })
  }
}

