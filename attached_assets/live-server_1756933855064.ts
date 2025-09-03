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

async function handleStartSession(ws: any, message: any, connectionId: string) {
  try {
    console.log(`🎯 Starting session:`, { languageCode: message.languageCode })
    
    // For now, just acknowledge the session start
    // In a full implementation, you'd initialize Gemini Live API here
    ws.send(JSON.stringify({
      type: 'session_started',
      sessionId: connectionId,
      status: 'ready'
    }))
    
    console.log(`✅ Session started for ${connectionId}`)
  } catch (error) {
    console.error(`❌ Error starting session:`, error)
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to start session'
    }))
  }
}

async function handleAudioData(ws: any, message: any, connectionId: string) {
  try {
    // For now, just echo back that we received audio
    // In a full implementation, you'd process the audio with Gemini Live API
    ws.send(JSON.stringify({
      type: 'audio_received',
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error(`❌ Error processing audio:`, error)
  }
}

function handleStopSession(ws: any, connectionId: string) {
  console.log(`🛑 Stopping session: ${connectionId}`)
  ws.send(JSON.stringify({
    type: 'session_stopped'
  }))
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