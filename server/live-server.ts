import { WebSocketServer } from 'ws'
import { GoogleGenAI, LiveServerMessage, MediaResolution, Modality, Session, TurnCoverage } from '@google/genai'
import mime from 'mime'

const PORT = parseInt(process.env.LIVE_SERVER_PORT || '3001')

console.log(`🔌 Live WebSocket server starting on port ${PORT}...`)

const wss = new WebSocketServer({ 
  port: PORT,
  host: '0.0.0.0'  // Allow connections from any host in Replit
})

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
})

// Response queue and session tracking - exactly like Google AI Studio Live
const responseQueue: LiveServerMessage[] = []
const activeSessions = new Map<string, Session>()

wss.on('connection', (ws) => {
  const connectionId = Math.random().toString(36).substring(7)
  console.log(`✅ New WebSocket connection: ${connectionId}`)

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log(`📨 Received message type: ${message.type}`, { connectionId })

      switch (message.type) {
        case 'start':
          await handleStartSession(ws, message, connectionId)
          break
        case 'audio':
        case 'user_audio':
          await handleAudioData(ws, message, connectionId)
          break
        case 'video':
          await handleVideoData(ws, message, connectionId)
          break
        case 'screen':
          await handleScreenData(ws, message, connectionId)
          break
        case 'stop':
          handleStopSession(ws, connectionId)
          break
        default:
          console.warn(`❓ Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error(`❌ Error processing message:`, error)
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'Failed to process message' 
      }))
    }
  })

  ws.on('close', (code, reason) => {
    console.log(`🔌 WebSocket connection closed: ${connectionId}`, { code, reason: reason.toString() })
  })

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${connectionId}:`, error)
  })

  // Send immediate connected message
  ws.send(JSON.stringify({
    type: 'connected',
    connectionId: connectionId,
    status: 'ready'
  }))
})

async function handleStartSession(ws: any, message: any, connectionId: string) {
  try {
    console.log(`🎯 Starting Gemini Live session:`, { 
      connectionId, 
      modalities: message.modalities || ['AUDIO'] 
    })
    
    // Use the latest Live API model for better streaming reliability
    const model = 'gemini-live-2.5-flash-preview'
    
    const config = {
      responseModalities: [Modality.AUDIO],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Puck', // Same as Google AI Studio Live
          }
        }
      },
      realtimeInputConfig: {
        turnCoverage: TurnCoverage.TURN_INCLUDES_ALL_INPUT,
      },
      contextWindowCompression: {
        triggerTokens: '25600',
        slidingWindow: { targetTokens: '12800' },
      },
      systemInstruction: `You are F.B/c (Farzad Bayat consultant), an AI business consultant for farzadbayat.com.

BUSINESS CONTEXT: You work for Farzad Bayat, helping prospects understand how AI can transform their business while capturing leads for consulting services.

PERSONALITY: Professional yet approachable, curious about business challenges, solution-oriented.

CORE CAPABILITIES:
- Voice conversations (talk modality)
- Webcam analysis for workspace optimization  
- Screen sharing for workflow analysis
- ROI calculations for AI investments
- Business strategy recommendations

LEAD CAPTURE: Always gather: name, company, role, specific business challenges, and interest in consulting.

Keep responses conversational and focused on business value.`
    }

    // Initialize Gemini Live session
    const session = await genAI.live.connect({
      model,
      callbacks: {
        onopen: () => {
          console.log(`✅ Gemini Live session opened: ${connectionId}`)
          ws.send(JSON.stringify({
            type: 'session_started',
            payload: {
              connectionId: connectionId,
              sessionId: connectionId,
              languageCode: message.languageCode || 'en-US',
              voiceName: 'Puck'
            },
            status: 'ready',
            modalities: ['AUDIO', 'VIDEO'] // Support for talk, webcam, screenshare
          }))
        },
        onmessage: (liveMessage: LiveServerMessage) => {
          handleGeminiMessage(ws, liveMessage, connectionId)
        },
        onerror: (e: ErrorEvent) => {
          console.error(`❌ Gemini Live error for ${connectionId}:`, e.message)
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Gemini Live session error'
          }))
        },
        onclose: (e: CloseEvent) => {
          console.log(`🔌 Gemini Live session closed: ${connectionId}`, e.reason)
          activeSessions.delete(connectionId)
        }
      },
      config
    })

    // Store session for this connection
    activeSessions.set(connectionId, session)
    
    console.log(`✅ Gemini Live session started for ${connectionId}`)
  } catch (error) {
    console.error(`❌ Error starting Gemini Live session:`, error)
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to start Gemini Live session'
    }))
  }
}

// Handle Gemini Live messages - exactly like Google AI Studio Live
function handleGeminiMessage(ws: any, message: LiveServerMessage, connectionId: string) {
  try {
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent.modelTurn.parts[0]

      // Handle audio response from Gemini
      if (part?.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
        ws.send(JSON.stringify({
          type: 'audio_response',
          audioData: part.inlineData.data,
          mimeType: part.inlineData.mimeType
        }))
      }

      // Handle text response from Gemini
      if (part?.text) {
        ws.send(JSON.stringify({
          type: 'text_response',
          text: part.text
        }))
      }
    }

    // Handle turn completion
    if (message.serverContent?.turnComplete) {
      ws.send(JSON.stringify({
        type: 'turn_complete'
      }))
    }
  } catch (error) {
    console.error(`❌ Error handling Gemini message:`, error)
  }
}

async function handleAudioData(ws: any, message: any, connectionId: string) {
  try {
    const session = activeSessions.get(connectionId)
    if (!session) {
      console.warn(`❓ No active session for ${connectionId}`)
      return
    }

    console.log(`🎵 Audio data received for ${connectionId}`)
    
    // Send audio to Gemini Live - exactly like Google AI Studio Live
    session.sendClientContent({
      turns: [{
        clientContent: {
          input: {
            mimeType: message.mimeType || 'audio/pcm',
            data: message.audioData
          }
        }
      }]
    })
  } catch (error) {
    console.error(`❌ Error processing audio:`, error)
  }
}

async function handleVideoData(ws: any, message: any, connectionId: string) {
  try {
    const session = activeSessions.get(connectionId)
    if (!session) {
      console.warn(`❓ No active session for ${connectionId}`)
      return
    }

    console.log(`📹 Video data received for ${connectionId}`)
    
    // Send video frame to Gemini Live for webcam analysis
    session.sendClientContent({
      turns: [{
        clientContent: {
          input: {
            mimeType: message.mimeType || 'image/jpeg',
            data: message.videoData
          }
        }
      }]
    })
  } catch (error) {
    console.error(`❌ Error processing video:`, error)
  }
}

async function handleScreenData(ws: any, message: any, connectionId: string) {
  try {
    const session = activeSessions.get(connectionId)
    if (!session) {
      console.warn(`❓ No active session for ${connectionId}`)
      return
    }

    console.log(`🖥️ Screen data received for ${connectionId}`)
    
    // Send screen capture to Gemini Live for workflow analysis
    session.sendClientContent({
      turns: [{
        clientContent: {
          input: {
            mimeType: message.mimeType || 'image/png',
            data: message.screenData
          }
        }
      }]
    })
  } catch (error) {
    console.error(`❌ Error processing screen data:`, error)
  }
}

function handleStopSession(ws: any, connectionId: string) {
  try {
    console.log(`🛑 Stopping session for ${connectionId}`)
    
    const session = activeSessions.get(connectionId)
    if (session) {
      session.close()
      activeSessions.delete(connectionId)
    }
    
    ws.send(JSON.stringify({
      type: 'session_stopped',
      status: 'stopped'
    }))
  } catch (error) {
    console.error(`❌ Error stopping session:`, error)
  }
}

console.log(`🚀 Live WebSocket server running on port ${PORT}`)

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, closing WebSocket server...')
  wss.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, closing WebSocket server...')
  wss.close()
  process.exit(0)
})