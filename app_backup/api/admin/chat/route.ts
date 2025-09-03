import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '@/src/core/config'
import { createServerClient } from '@/src/core/supabase/client'

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify admin token (in production, use proper JWT verification)
    if (token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    const { message, conversationId, context } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Store in database if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerClient()
      
      // Store admin conversation
      await supabase.from('admin_conversations').insert({
        conversation_id: conversationId,
        message,
        role: 'user',
        metadata: { context }
      })
    }

    let response

    if (config.ai.gemini.apiKey) {
      const genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey)
      const model = genAI.getGenerativeModel({ 
        model: config.ai.gemini.model,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.3, // Lower temperature for admin responses
        }
      })

      const systemPrompt = `You are an admin assistant with access to system information and controls.
      Provide detailed, technical responses suitable for administrators.
      Current context: ${JSON.stringify(context || {})}`

      const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`)
      response = result.response.text()
    } else {
      response = `Admin response to: "${message}"\n\nSystem status: All systems operational.`
    }

    // Store assistant response
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerClient()
      
      await supabase.from('admin_conversations').insert({
        conversation_id: conversationId,
        message: response,
        role: 'assistant'
      })
    }

    return NextResponse.json({
      success: true,
      message: response,
      conversationId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}