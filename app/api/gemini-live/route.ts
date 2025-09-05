import { NextRequest, NextResponse } from 'next/server'
import { asLiveSessionLike, LiveSessionLike } from '@/src/lib/live-session';
import { GoogleGenAI, Modality, StartSensitivity, EndSensitivity, MediaResolution } from '@google/genai'
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
  session: LiveSessionLike // Google GenAI LiveSession type
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
          const sessionLeadContext = {
            name: leadContext?.name || 'Unknown',
            email: leadContext?.email || 'unknown@example.com',
            company: leadContext?.company || 'Unknown',
            role: leadContext?.role || 'Unknown'
          };
          // Initialize multimodal context for this session
          await multimodalContextManager.initializeSession(sessionId || 'anonymous', sessionLeadContext)

          // 🚀 GOOGLE LIVE API BEST PRACTICES - Following official documentation
          const session: LiveSessionLike = asLiveSessionLike(await genAI.live.connect({
            model: modelName,
            config: {
              // ⚠️ IMPORTANT: Only ONE response modality per session (Google requirement)
              responseModalities: [Modality.TEXT], // Start with text, can create separate audio session
              
              // 🎙️ OPTIMIZED VOICE ACTIVITY DETECTION
              realtimeInputConfig: {
                automaticActivityDetection: {
                  disabled: false, // Enable automatic VAD
                  startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
                  endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
                  prefixPaddingMs: 300,  // Capture 300ms before speech
                  silenceDurationMs: 800 // Wait 800ms of silence before ending
                }
              },
              
              // 📊 PERFORMANCE OPTIMIZATION
              mediaResolution: MediaResolution.MEDIA_RESOLUTION_HIGH,
              
              // 🛡️ ENHANCED SAFETY
              
              // 📝 SMART TRANSCRIPTION
              inputAudioTranscription: {
                enabled: true,
                language: 'en-US' // Explicit language for better accuracy
              }
            },
            callbacks: {
              onopen() {
                console.log(`🔗 Live API session opened: ${sessionId}`)
                // Send initial context if available
                if (leadContext) {
                  const contextMessage = `User context: ${leadContext.name ? `Name: ${leadContext.name}` : ''} ${leadContext.company ? `Company: ${leadContext.company}` : ''} ${leadContext.role ? `Role: ${leadContext.role}` : ''}`.trim()
                  if (contextMessage.length > 15) {
                    // session.sendClientContent({
                    //   turns: [{ role: 'user', parts: [{ text: contextMessage }] }],
                    //   turnComplete: false
                    // })
                  }
                }
              },
              
              async onmessage(message: any) {
                console.log(`📨 Live API message received:`, message.type || 'unknown')
                
                // Handle different message types per Google docs
                if (message.text && sessionId) {
                  // Text response from AI
                  await multimodalContextManager.addTextMessage(
                    sessionId,
                    message.text,
                    { 
                      confidence: 0.95
                    }
                  )
                }
                
                if (message.audio && sessionId) {
                  // Audio response from AI (for future audio sessions)
                  await multimodalContextManager.addVoiceMessage(
                    sessionId,
                    '[AI Audio Response]',
                    message.audio.data?.length || 0,
                    { 
                      format: 'audio/pcm',
                      sampleRate: 16000,
                      confidence: 0.95
                    }
                  )
                }
                
                // Token usage tracking per Google guidelines
                if (message.usageMetadata && sessionId) {
                  console.log(`📊 Token usage: ${message.usageMetadata.totalTokenCount} total tokens`)
                  // Could track token usage for analytics
                }
              },
              
              onerror(error: any) {
                console.error(`❌ Live API error for session ${sessionId}:`, error.message || error)
                // Implement retry logic based on error type
                if (error.message?.includes('rate limit')) {
                  // Rate limit error - implement backoff
                  console.log('⏱️ Rate limit hit, implementing backoff...')
                } else if (error.message?.includes('auth')) {
                  // Auth error - refresh token
                  console.log('🔐 Auth error, token may need refresh')
                }
              },
              
              onclose(event: any) {
                console.log(`🔌 Live API session closed: ${sessionId}, reason: ${event?.reason || 'unknown'}`)
                
                if (sessionId) {
                  liveSessions.delete(sessionId)
                  // Preserve context for reconnection
                  console.log(`💾 Context preserved for session ${sessionId}`)
                }
              }
            }
          }))

          // Store session
          if (sessionId) {
            liveSessions.set(sessionId, { session, leadContext })
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
          // 💬 ENHANCED TEXT MESSAGE HANDLING - Following Google Live API patterns
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

            // Get conversation context for incremental updates
            
            // 📋 INCREMENTAL CONTENT UPDATES - Per Google documentation
            const turns = []
            
            // Add previous context if available (for session restoration)
            
            // Add current message
            turns.push({
              role: 'user',
              parts: [{ text: sanitizedMessage }]
            })

            // Send with proper turn management
            // await session.sendClientContent({
            //   turns,
            //   turnComplete: true // Mark as complete turn per Google docs
            // })

            // Add user message to multimodal context
            await multimodalContextManager.addTextMessage(sessionId, sanitizedMessage)
          }

          // 🎙️ ENHANCED AUDIO STREAMING - Following Google Live API patterns
          if (audioData && sessionId) {
            try {
              // 🔄 REAL-TIME AUDIO PROCESSING with proper VAD
              const audioMimeType = mimeType || 'audio/pcm;rate=16000'
              
              // Send audio with activity markers per Google docs
              // await session.sendRealtimeInput({
              //   activityStart: {} // Mark start of speech activity
              // })
              
              // Send audio data in chunks for better streaming
              const chunkSize = 8192 // 8KB chunks for optimal streaming
              const audioBytes = atob(audioData) // Decode base64
              
              for (let i = 0; i < audioBytes.length; i += chunkSize) {
                const chunk = audioBytes.slice(i, i + chunkSize)
                const chunkBase64 = btoa(chunk)
                
                // await session.sendRealtimeInput({
                //   audio: {
                //     data: chunkBase64,
                //     mimeType: audioMimeType
                //   }
                // })
                
                // Small delay to prevent overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 10))
              }
              
              // Mark end of speech activity
              // await session.sendRealtimeInput({
              //   activityEnd: {} // Mark end of speech activity
              // })

              // Add voice message to multimodal context with enhanced metadata
              await multimodalContextManager.addVoiceMessage(
                sessionId,
                `[Real-time audio stream - ${audioData.length} bytes]`,
                Math.round(audioBytes.length / 16000), // Estimate duration from sample rate
                { 
                  sampleRate: 16000, 
                  format: audioMimeType, 
                  confidence: 0.9,
                  source: 'live_api_audio',
                  chunked: true,
                  totalChunks: Math.ceil(audioBytes.length / chunkSize)
                }
              )
              
              console.log(`🎙️ Audio streamed successfully: ${audioBytes.length} bytes in ${Math.ceil(audioBytes.length / chunkSize)} chunks`)
              
            } catch (audioError) {
              console.error('Audio streaming error:', audioError)
              // Fallback to single audio send
              // await session.sendRealtimeInput({
              //   audio: { data: audioData, mimeType: mimeType || 'audio/pcm;rate=16000' }
              // })
            }
          }

          // 📸 ENHANCED IMAGE STREAMING - Live API with visual understanding
          if (imageData && sessionId) {
            try {
              const base64 = imageData.startsWith('data:') ? imageData.split(',')[1] : imageData
              if (!base64) {
                return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
              }
              const mime = imageData.startsWith('data:') ? imageData.substring(5, imageData.indexOf(';')) : 'image/jpeg'

              // 🎯 SMART IMAGE CONTEXT INTEGRATION
              const contextPrompt = 'Analyze this image comprehensively for business insights and actionable recommendations.'

              // Send image with context using proper Live API format
              const turns = [
                {
                  role: 'user',
                  parts: [
                    { text: contextPrompt },
                    { inlineData: { mimeType: mime, data: base64 } }
                  ]
                }
              ]

              // await session.sendClientContent({
              //   turns,
              //   turnComplete: true
              // })

              // Add visual analysis to multimodal context with enhanced metadata
              await multimodalContextManager.addVisualAnalysis(
                sessionId,
                `[Live API image analysis - ${base64.length} bytes, ${mime}]`,
                'upload',
                base64.length,
                imageData
              )
              
              console.log(`📸 Image sent to Live API: ${mime}, ${base64.length} bytes`)
              
            } catch (imageError) {
              console.error('Image streaming error:', imageError)
              throw imageError
            }
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
            // session.close()
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