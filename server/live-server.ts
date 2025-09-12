import { WebSocketServer } from 'ws'
import { GoogleGenAI } from '@google/genai'

const PORT = parseInt(process.env.LIVE_SERVER_PORT || '3001')

console.log(`🔌 Live WebSocket server starting on port ${PORT}...`)

const wss = new WebSocketServer({ port: PORT })

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
})

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
          await handleAudioData(ws, message, connectionId)
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

  ws.on('close', () => {
    console.log(`🔌 WebSocket connection closed: ${connectionId}`)
  })

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${connectionId}:`, error)
  })
})

async function handleStartSession(ws: unknown, message: unknown, connectionId: string) {
  try {
    console.log(`🎯 Starting REAL Gemini Live session:`, { languageCode: message.languageCode })

    // Initialize actual Gemini Live API session
    const response = await fetch('http://localhost:3000/api/gemini-live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'start',
        sessionId: connectionId,
        leadContext: {
          name: 'Live User',
          email: `live-${connectionId}@temp.com`
        }
      })
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Gemini Live session started for ${connectionId}`)
      ws.send(JSON.stringify({
        type: 'session_started',
        sessionId: connectionId,
        status: 'ready',
        session: result
      }))
    } else {
      console.error(`❌ Failed to start Gemini Live session:`, result)
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to start Gemini Live session',
        details: result
      }))
    }
  } catch (error) {
    console.error(`❌ Error starting session:`, error)
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to start session',
      details: error.message
    }))
  }
}

async function handleAudioData(ws: unknown, message: unknown, connectionId: string) {
  try {
    // REAL LIVE AUDIO PROCESSING - Forward to Gemini Live API
    const audioMessage = message as { audioData: string, mimeType?: string }

    if (!audioMessage.audioData) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'No audio data provided'
      }))
      return
    }

    console.log(`🎵 Processing ${audioMessage.audioData.length} bytes of audio for ${connectionId}`)

    // Forward audio to Gemini Live API via HTTP request
    const response = await fetch('http://localhost:3000/api/gemini-live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send',
        sessionId: connectionId, // Use connectionId as sessionId
        audioData: audioMessage.audioData,
        mimeType: audioMessage.mimeType || 'audio/pcm;rate=16000'
      })
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Audio processed successfully for ${connectionId}`)
      ws.send(JSON.stringify({
        type: 'audio_processed',
        sessionId: connectionId,
        timestamp: Date.now(),
        response: result
      }))
    } else {
      console.error(`❌ Audio processing failed:`, result)
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Audio processing failed',
        details: result
      }))
    }
  } catch (error) {
    console.error(`❌ Error processing audio:`, error)
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Internal audio processing error',
      details: error.message
    }))
  }
}

async function handleStopSession(ws: unknown, connectionId: string) {
  try {
    console.log(`🛑 Stopping Gemini Live session: ${connectionId}`)

    // End the Gemini Live session
    const response = await fetch('http://localhost:3000/api/gemini-live', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'end',
        sessionId: connectionId
      })
    })

    const result = await response.json()
    console.log(`✅ Session ended for ${connectionId}:`, result)

    ws.send(JSON.stringify({
      type: 'session_stopped',
      sessionId: connectionId,
      result: result
    }))
  } catch (error) {
    console.error(`❌ Error stopping session ${connectionId}:`, error)
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to stop session',
      details: error.message
    }))
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