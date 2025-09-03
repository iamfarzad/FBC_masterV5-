import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality } from '@google/genai'
import { getSafetySettings } from '@/src/core/config/safety'
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
  session: any // Google GenAI LiveSession type
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
    
    // Use available model (native audio models not available in your region)
    const modelName = 'gemini-2.5-flash'

    switch (action) {
      case 'probe': {
        // Check if Live API is available
        const apiKey = process.env.GEMINI_API_KEY
        const liveEnabled = process.env.LIVE_ENABLED !== 'false' // Default to enabled
        
        if (!apiKey) {
          return NextResponse.json({
            available: false,
            reason: 'GEMINI_API_KEY not configured'
          })
        }
        
        return NextResponse.json({
          available: true,
          reason: 'Live API is enabled and configured',
          model: modelName
        })
      }

      case 'start': {
        try {
          // Initialize multimodal context for this session
          const sid = sessionId || `session_${Date.now()}`
          await multimodalContextManager.initializeSession(sid, leadContext)
          
          // Variable to hold session reference for callbacks
          let sessionRef: any = null
          
          // Create Live API session with native audio output
          const session = await genAI.live.connect({
            model: modelName,
            config: {
              // Use AUDIO response for native voice output
              responseModalities: [Modality.AUDIO],
              
              // System instruction for F.B/c personality
              systemInstruction: `You are F.B/c (Farzad Bayat consultant), an AI business consultant for farzadbayat.com.
              
PERSONALITY: Professional yet approachable, curious about business challenges, solution-oriented.

CORE CAPABILITIES:
- Voice conversations with natural speech
- Business strategy recommendations  
- ROI calculations for AI investments
- Lead qualification and capture

LEAD CAPTURE: Always gather: name, company, role, specific business challenges, and interest in consulting.

Keep responses conversational and focused on business value.`,
              
              // Enhanced safety settings
              safetySettings: getSafetySettings()
            },
            callbacks: {
              onopen() {
                console.log(`🔗 Live API session opened: ${sid}`)
                // Send initial context after session is connected
                if (sessionRef && leadContext) {
                  const contextMessage = `User context: ${leadContext.name ? `Name: ${leadContext.name}` : ''} ${leadContext.company ? `Company: ${leadContext.company}` : ''} ${leadContext.role ? `Role: ${leadContext.role}` : ''}`.trim()
                  if (contextMessage.length > 15) {
                    try {
                      sessionRef.sendClientContent({
                        turns: [{ role: 'user', parts: [{ text: contextMessage }] }],
                        turnComplete: true
                      })
                    } catch (e) {
                      console.warn('Could not send initial context:', e)
                    }
                  }
                }
              },
              
              async onmessage(message: any) {
                console.log(`📨 Live API message:`, message.type || 'unknown')
                
                // Handle text responses
                if (message.text && sid) {
                  await multimodalContextManager.addTextMessage(
                    sid,
                    message.text,
                    { 
                      confidence: 0.95,
                      source: 'live_api',
                      timestamp: new Date().toISOString()
                    }
                  )
                }
                
                // Handle audio responses  
                if (message.audio && sid) {
                  console.log(`🎵 Audio response received: ${message.audio.data?.length || 0} bytes`)
                }
                
                // Track token usage
                if (message.usageMetadata) {
                  console.log(`📊 Tokens: ${message.usageMetadata.totalTokenCount}`)
                }
              },
              
              onerror(error: any) {
                console.error(`❌ Live API error:`, error.message || error)
              },
              
              onclose(e: any) {
                console.log(`🔌 Live API session closed:`, e.reason || 'unknown')
                liveSessions.delete(sid)
              }
            }
          })
          
          // Store session reference for callbacks
          sessionRef = session
          
          // Store the session for future use
          liveSessions.set(sid, { session, leadContext })
          console.log(`✅ Live session created: ${sid}`)
          
          return NextResponse.json({
            success: true,
            sessionId: sid,
            message: 'Live session started successfully',
            model: modelName
          })
          
        } catch (error: any) {
          console.error('❌ Failed to start Live session:', error)
          return NextResponse.json({
            error: 'Failed to start Live session',
            details: error.message || 'Unknown error',
            model: modelName
          }, { status: 500 })
        }
      }

      case 'send': {
        // Send audio/text to existing session
        const sid = sessionId || 'default'
        const liveSession = liveSessions.get(sid)
        
        if (!liveSession) {
          return NextResponse.json({
            error: 'Session not found. Please start a session first.'
          }, { status: 404 })
        }
        
        try {
          if (audioData) {
            // Send audio data to Live API
            await liveSession.session.sendRealtimeInput({
              audio: {
                data: audioData,
                mimeType: mimeType || 'audio/pcm;rate=16000'
              }
            })
            console.log(`🎤 Sent audio: ${audioData.length} chars`)
          }
          
          if (message) {
            // Send text message
            await liveSession.session.sendClientContent({
              turns: [{ role: 'user', parts: [{ text: message }] }],
              turnComplete: true
            })
            console.log(`💬 Sent message: ${message}`)
          }
          
          if (imageData) {
            // Send image for analysis
            await liveSession.session.sendRealtimeInput({
              media: {
                data: imageData,
                mimeType: mimeType || 'image/jpeg'
              }
            })
            console.log(`📷 Sent image: ${imageData.length} chars`)
          }
          
          return NextResponse.json({
            success: true,
            message: 'Data sent successfully'
          })
          
        } catch (error: any) {
          console.error('❌ Failed to send data:', error)
          return NextResponse.json({
            error: 'Failed to send data to Live session',
            details: error.message || 'Unknown error'
          }, { status: 500 })
        }
      }

      case 'end': {
        // End the session
        const sid = sessionId || 'default'
        const liveSession = liveSessions.get(sid)
        
        if (liveSession) {
          try {
            await liveSession.session.close()
            liveSessions.delete(sid)
            console.log(`🔚 Session ended: ${sid}`)
            
            return NextResponse.json({
              success: true,
              message: 'Session ended successfully'
            })
          } catch (error: any) {
            console.error('❌ Failed to end session:', error)
            return NextResponse.json({
              error: 'Failed to end session',
              details: error.message || 'Unknown error'
            }, { status: 500 })
          }
        }
        
        return NextResponse.json({
          success: true,
          message: 'Session already ended or not found'
        })
      }

      default:
        return NextResponse.json({
          error: `Unknown action: ${action}`
        }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ API route error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}