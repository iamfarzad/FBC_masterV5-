import { NextRequest, NextResponse } from 'next/server'
import { multimodalContextManager } from '@/src/core/context/multimodal-context'
import { unifiedChatProvider } from '@/src/core/chat/unified-provider'
import { z } from 'zod'

// Unified multimodal request schema
const MultimodalRequestSchema = z.object({
  modality: z.enum(['text', 'voice', 'vision', 'upload', 'realtime-voice']),
  content: z.string().optional(),
  metadata: z.object({
    sessionId: z.string().optional(),
    userId: z.string().optional(),
    fileData: z.string().optional(), // base64 for images/videos
    fileType: z.string().optional(),
    fileName: z.string().optional(),
    duration: z.number().optional(), // for audio
    transcription: z.string().optional(), // for voice
    imageSize: z.number().optional(), // for vision
    streamId: z.string().optional(), // for real-time voice streams
    isStreaming: z.boolean().optional(), // for real-time voice
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = MultimodalRequestSchema.parse(body)

    const { modality, content, metadata } = validatedData
    const sessionId = metadata?.sessionId || request.headers.get('x-intelligence-session-id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Initialize or get multimodal context
    let context = await multimodalContextManager.getContext(sessionId)
    if (!context) {
      context = await multimodalContextManager.initializeSession(sessionId)
    }

    // INTEGRATE INTELLIGENCE: Get intelligence context for this session
    let intelligenceContext = null
    try {
      const intelligenceResponse = await fetch(`${request.nextUrl.origin}/api/admin/server-handler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init_admin_session',
          sessionId,
          email: metadata?.userId ? `${metadata.userId}@session.local` : `session-${sessionId}@local`,
          name: metadata?.userId || `Session ${sessionId}`
        })
      })

      if (intelligenceResponse.ok) {
        const intelligenceData = await intelligenceResponse.json()
        intelligenceContext = intelligenceData.session
      }
    } catch (intelligenceError) {
      console.warn('Intelligence integration failed for multimodal:', intelligenceError)
    }

    const response = { ok: true, modality, sessionId, processedAt: new Date().toISOString() }

    // Route to appropriate handler based on modality
    switch (modality) {
      case 'text':
        if (!content) {
          return NextResponse.json({ error: 'Content required for text modality' }, { status: 400 })
        }
        await multimodalContextManager.addTextMessage(sessionId, content)
        response.processed = 'text'
        break

      case 'voice':
        if (!metadata?.transcription || !metadata?.duration) {
          return NextResponse.json({
            error: 'Transcription and duration required for voice modality'
          }, { status: 400 })
        }

        // Add to multimodal context
        await multimodalContextManager.addVoiceMessage(
          sessionId,
          metadata.transcription,
          metadata.duration
        )

        // Process through unified chat system
        const voiceMessage = {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: metadata.transcription,
          timestamp: new Date(),
          type: 'text' as const
        }

        const voiceContext = {
          sessionId,
          multimodalData: {
            audioData: metadata.transcription,
            mimeType: 'text/plain'
          },
          intelligenceContext: intelligenceContext
        }

        // Generate response using unified provider
        const voiceStream = unifiedChatProvider.generate({
          messages: [voiceMessage],
          context: voiceContext,
          mode: 'multimodal'
        })

        // Collect response (similar to other endpoints)
        const voiceResponses: any[] = []
        for await (const msg of voiceStream) {
          voiceResponses.push(msg)
        }

        response.processed = 'voice'
        response.aiResponse = voiceResponses.map(m => m.content).join('') || 'Voice message processed successfully'
        break

      case 'realtime-voice':
        // Route real-time voice to existing Gemini Live API
        if (!metadata?.transcription || !metadata?.duration) {
          return NextResponse.json({
            error: 'Transcription and duration required for real-time voice modality'
          }, { status: 400 })
        }

        try {
          // Add voice message to unified context
          await multimodalContextManager.addVoiceMessage(
            sessionId,
            metadata.transcription,
            metadata.duration,
            {
              sampleRate: 16000,
              format: 'audio/pcm',
              confidence: 0.9,
              isRealtime: true,
              streamId: metadata.streamId
            }
          )

          // Send to Gemini Live API for real-time processing
          const liveResponse = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/gemini-live`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-intelligence-session-id': sessionId
            },
            body: JSON.stringify({
              action: 'send',
              sessionId: sessionId,
              audioData: metadata.fileData, // base64 audio data
              mimeType: 'audio/pcm;rate=16000'
            })
          })

          if (!liveResponse.ok) {
            console.warn('Live API send failed, but voice stored in context')
          }

          response.processed = 'realtime-voice'
          response.liveApiSent = liveResponse.ok

        } catch (error) {
          console.error('Real-time voice processing error:', error)
          // Still store in context even if Live API fails
          response.processed = 'realtime-voice'
          response.liveApiError = true
        }
        break

      case 'vision':
        if (!content || !metadata?.imageSize) {
          return NextResponse.json({
            error: 'Analysis content and image size required for vision modality'
          }, { status: 400 })
        }

        const visionType = metadata.fileType?.startsWith('image/') ? 'webcam' : 'screen'

        // Add to multimodal context
        await multimodalContextManager.addVisualAnalysis(
          sessionId,
          content,
          visionType as 'webcam' | 'screen',
          metadata.imageSize,
          metadata.fileData
        )

        // Process through unified chat system
        const visionMessage = {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: `Visual analysis: ${content}`,
          timestamp: new Date(),
          type: 'text' as const
        }

        const visionContext = {
          sessionId,
          multimodalData: {
            imageData: metadata.fileData,
            mimeType: metadata.fileType || 'image/jpeg'
          },
          intelligenceContext: intelligenceContext
        }

        // Generate response using unified provider
        const visionStream = unifiedChatProvider.generate({
          messages: [visionMessage],
          context: visionContext,
          mode: 'multimodal'
        })

        // Collect response
        const visionResponses: any[] = []
        for await (const msg of visionStream) {
          visionResponses.push(msg)
        }

        response.processed = 'vision'
        response.aiResponse = visionResponses.map(m => m.content).join('') || 'Visual analysis processed successfully'
        break

      case 'upload':
        if (!metadata?.fileData || !metadata?.fileType || !metadata?.fileName) {
          return NextResponse.json({
            error: 'File data, type, and name required for upload modality'
          }, { status: 400 })
        }

        // Handle file upload through existing upload endpoint
        const uploadFormData = new FormData()
        const fileBuffer = Buffer.from(metadata.fileData.split(',')[1], 'base64')
        const file = new File([fileBuffer], metadata.fileName, { type: metadata.fileType })
        uploadFormData.append('file', file)

        const uploadResponse = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/upload`, {
          method: 'POST',
          headers: {
            'x-intelligence-session-id': sessionId,
            'x-user-id': metadata.userId || '',
            'x-modality-type': 'upload'
          },
          body: uploadFormData
        })

        if (!uploadResponse.ok) {
          return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
        }

        const uploadResult = await uploadResponse.json()
        response.processed = 'upload'
        response.upload = uploadResult
        break

      default:
        return NextResponse.json({ error: 'Invalid modality' }, { status: 400 })
    }

    // Get updated context summary
    const summary = await multimodalContextManager.getContextSummary(sessionId)
    response.context = summary

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Multimodal API error', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || request.headers.get('x-intelligence-session-id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const context = await multimodalContextManager.getContext(sessionId)
    if (!context) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get recent context data
    const [recentHistory, recentVisual, recentAudio, summary] = await Promise.all([
      multimodalContextManager.getConversationHistory(sessionId, 5),
      multimodalContextManager.getRecentVisualContext(sessionId, 3),
      multimodalContextManager.getRecentAudioContext(sessionId, 3),
      multimodalContextManager.getContextSummary(sessionId)
    ])

    return NextResponse.json({
      ok: true,
      sessionId,
      summary,
      recent: {
        history: recentHistory,
        visual: recentVisual,
        audio: recentAudio
      },
      fullContext: context
    })

  } catch (error) {
    console.error('Multimodal GET error', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
