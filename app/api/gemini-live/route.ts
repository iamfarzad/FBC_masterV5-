import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality } from '@google/genai'
import { createOptimizedConfig } from '@/src/core/gemini-config-enhanced'
import { getSafetySettings, filterContent, sanitizeInput } from '@/src/core/config/safety'
import { multimodalContextManager } from '@/src/core/context/multimodal-context'

interface LiveSessionRequest {
  action: 'start' | 'send' | 'end' | 'probe'
  sessionId?: string
  leadContext?: {
    name?: string
    email?: string
    company?: string
    role?: string
  }
  message?: string
  audioData?: string
  imageData?: string
  mimeType?: string
}

// Session management for Live API
interface LiveSession {
  session: unknown // Google GenAI LiveSession type
  leadContext?: LiveSessionRequest['leadContext']
}
const liveSessions = new Map<string, LiveSession>()

export async function POST(req: NextRequest) {
  try {
    const body: LiveSessionRequest = await req.json()
    const { action, sessionId, leadContext, message, audioData, imageData, mimeType } = body

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenAI({ apiKey })
    const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-live-2.5-flash-preview-native-audio'

    switch (action) {
      case 'probe': {
        // Check if Live API is available
        const apiKey = process.env.GEMINI_API_KEY
        const liveEnabled = process.env.LIVE_ENABLED === 'true'

        if (!apiKey) {
          return NextResponse.json({
            available: false,
            reason: 'GEMINI_API_KEY not configured'
          })
        }

        if (!liveEnabled) {
          return NextResponse.json({
            available: false,
            reason: 'Live API not enabled (set LIVE_ENABLED=true)'
          })
        }

        return NextResponse.json({
          available: true,
          reason: 'Live API is enabled and configured'
        })
      }

      case 'start': {
        // Check if Live API is enabled (like FB-c_labV2 approach)
        const liveEnabled = process.env.LIVE_ENABLED === 'true'

        if (!liveEnabled) {
          return NextResponse.json({
            error: 'Live API not enabled. Use regular chat endpoints.',
            suggestion: 'Set LIVE_ENABLED=true to enable Live API features'
          }, { status: 503 })
        }

        // Start new Live session with proper Live API
        // Starting Gemini Live API session

        try {
          // Initialize multimodal context for this session
          await multimodalContextManager.initializeSession(sessionId || 'anonymous', leadContext)

          const session = await genAI.live.connect({
            model: modelName,
            config: {
              responseModalities: [Modality.AUDIO, Modality.TEXT],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Puck'
                  }
                }
              },
              inputAudioTranscription: {},
              safetySettings: getSafetySettings(),
            },
            callbacks: {
              onopen: () => {
                // Live API session opened successfully
              },
              onmessage: async (event: unknown) => {
                // Action logged

                // Add AI response to multimodal context
                if (event?.text && sessionId) {
                  await multimodalContextManager.addTextMessage(
                    sessionId,
                    event.text,
                    { confidence: 0.9 }
                  )
                }
              },
              onerror: (error: unknown) => {
                // Error: ❌ Live API error
              },
              onclose: () => {
                // Action logged
                if (sessionId) {
                  liveSessions.delete(sessionId)
                  // Don't clear context on close - preserve for future sessions
                }
              }
            }
          })

          // Store session
          if (sessionId) {
            liveSessions.set(sessionId, session)
          }

          return NextResponse.json({
            success: true,
            sessionId,
            status: 'started',
            message: 'Real Gemini Live API session started successfully',
            model: modelName,
            modalities: ['AUDIO', 'TEXT']
          })

        } catch (error) {
    console.error('Failed to start Live API session', error)
          return NextResponse.json({
            error: 'Failed to start Live API session',
            details: error instanceof Error ? error.message : 'Unknown error',
            note: 'This may be due to Google Cloud entitlement issues for Live API'
          }, { status: 500 })
        }
      }

      case 'send': {
        // Send data to existing Live session
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required for send action' }, { status: 400 })
        }

        const session = liveSessions.get(sessionId)
        if (!session) {
          return NextResponse.json({ error: 'Live session not found' }, { status: 404 })
        }

        try {
          // Send text message with safety filtering and context management
          if (message) {
            const sanitizedMessage = sanitizeInput(message)
            const filterResult = filterContent(sanitizedMessage)

            if (!filterResult.isSafe) {
              return NextResponse.json({
                error: 'Content violates safety policy',
                details: filterResult.reason,
                severity: filterResult.severity
              }, { status: 400 })
            }

            if (filterResult.severity === 'medium') {
              // Warning log removed - could add proper error handling here
            }

            // Add user message to multimodal context
            await multimodalContextManager.addTextMessage(sessionId, sanitizedMessage)

            await session.sendRealtimeInput({ text: sanitizedMessage })
            // Action logged
          }

          // Send audio data with transcription context
          if (audioData && sessionId) {
            // In a real implementation, you'd transcribe the audio first
            const mockTranscription = `[Audio message received - ${audioData.length} bytes]`

            // Add voice message to multimodal context
            await multimodalContextManager.addVoiceMessage(
              sessionId,
              mockTranscription,
              2.0, // mock duration
              { sampleRate: 16000, format: mimeType || 'audio/pcm', confidence: 0.9 }
            )

            await session.sendRealtimeInput({
              audio: { data: audioData, mimeType: mimeType || 'audio/pcm;rate=16000' }
            })
            // Action logged
          }

          // Send image data with analysis context
          if (imageData && sessionId) {
            const base64 = imageData.startsWith('data:') ? imageData.split(',')[1] : imageData
            const mime = imageData.startsWith('data:') ? imageData.substring(5, imageData.indexOf(';')) : 'image/jpeg'

            // In a real implementation, you'd analyze the image first
            const mockAnalysis = `[Image received - ${base64.length} bytes, ${mime}]`

            // Add visual analysis to multimodal context
            await multimodalContextManager.addVisualAnalysis(
              sessionId,
              mockAnalysis,
              'upload',
              base64.length,
              imageData
            )

            await session.sendRealtimeInput({
              inlineData: { mimeType: mime, data: base64 }
            })
            // Action logged
          }

          return NextResponse.json({
            success: true,
            status: 'sent',
            message: 'Data sent to Live API session successfully'
          })

        } catch (error) {
    console.error('Failed to send to Live API session', error)
          return NextResponse.json({
            error: 'Failed to send data to Live API session',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }

      case 'end': {
        // End Live session
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required for end action' }, { status: 400 })
        }

        const session = liveSessions.get(sessionId)
        if (session) {
          try {
            session.close()
            liveSessions.delete(sessionId)
            // Action logged
          } catch (error) {
            // Warning log removed - could add proper error handling here
          }
        }

        return NextResponse.json({
          success: true,
          status: 'ended',
          message: 'Live API session ended successfully'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Gemini Live API error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
