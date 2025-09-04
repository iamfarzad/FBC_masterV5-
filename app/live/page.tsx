'use client'

import { useState, useRef, useEffect } from 'react'
import { GeminiLiveClient } from '@/lib/gemini-live-client'

export default function GeminiLiveRealTime() {
  const [isConnected, setIsConnected] = useState(false)
  const [isAudioActive, setIsAudioActive] = useState(false)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [videoMode, setVideoMode] = useState<'webcam' | 'screen'>('webcam')
  const [transcript, setTranscript] = useState<string[]>([])
  const [responses, setResponses] = useState<string[]>([])
  const [status, setStatus] = useState('Disconnected')
  
  const clientRef = useRef<GeminiLiveClient | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const apiKeyRef = useRef<HTMLInputElement>(null)

  // Initialize Gemini Live client
  const connect = async () => {
    const apiKey = apiKeyRef.current?.value || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey) {
      setStatus('❌ Please enter your Gemini API key')
      return
    }

    try {
      setStatus('Connecting...')
      
      const client = new GeminiLiveClient({
        model: 'gemini-2.0-flash-exp',
        responseModalities: ['TEXT', 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Aoede'
            }
          }
        },
        systemInstruction: `You are a helpful AI assistant with real-time vision and audio capabilities. 
        You can see what the user shows you through their webcam or screen share, and hear what they say. 
        Provide natural, conversational responses about what you observe and hear.
        Keep responses concise and relevant to the real-time context.`,
        temperature: 0.7
      })

      // Set up event listeners
      client.addEventListener('open', () => {
        setIsConnected(true)
        setStatus('✅ Connected - Ready for real-time interaction')
      })

      client.addEventListener('text', ((event: CustomEvent) => {
        setResponses(prev => [...prev, event.detail.text])
      }) as EventListener)

      client.addEventListener('audio', ((event: CustomEvent) => {
        // Audio is played automatically by the client
        console.log('Received audio response')
      }) as EventListener)

      client.addEventListener('error', ((event: CustomEvent) => {
        console.error('Live API error:', event.detail)
        setStatus('❌ Connection error')
      }) as EventListener)

      client.addEventListener('close', () => {
        setIsConnected(false)
        setStatus('Disconnected')
        setIsAudioActive(false)
        setIsVideoActive(false)
      })

      // Connect to Gemini Live
      await client.connect(apiKey)
      clientRef.current = client
      
      // Send initial greeting
      client.sendText("Hello! I'm ready to help. I can see and hear in real-time. What would you like to explore?")
      
    } catch (error) {
      console.error('Connection failed:', error)
      setStatus('❌ Failed to connect')
    }
  }

  // Toggle audio streaming
  const toggleAudio = async () => {
    if (!clientRef.current || !isConnected) return

    try {
      if (isAudioActive) {
        clientRef.current.stopAudioStream()
        setIsAudioActive(false)
        setStatus('🎤 Audio stopped')
      } else {
        await clientRef.current.startAudioStream()
        setIsAudioActive(true)
        setStatus('🎤 Listening... (speak naturally)')
      }
    } catch (error) {
      console.error('Audio toggle failed:', error)
      setStatus('❌ Audio access denied')
    }
  }

  // Toggle video streaming
  const toggleVideo = async () => {
    if (!clientRef.current || !isConnected) return

    try {
      if (isVideoActive) {
        clientRef.current.stopVideoStream()
        setIsVideoActive(false)
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        setStatus('📹 Video stopped')
      } else {
        const stream = await clientRef.current.startVideoStream(videoMode)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsVideoActive(true)
        setStatus(`📹 ${videoMode === 'webcam' ? 'Webcam' : 'Screen'} active - AI can see in real-time`)
      }
    } catch (error) {
      console.error('Video toggle failed:', error)
      setStatus(`❌ ${videoMode === 'webcam' ? 'Camera' : 'Screen share'} access denied`)
    }
  }

  // Switch video mode
  const switchVideoMode = async () => {
    if (isVideoActive) {
      // Stop current stream
      clientRef.current?.stopVideoStream()
      setIsVideoActive(false)
    }
    
    // Toggle mode
    setVideoMode(prev => prev === 'webcam' ? 'screen' : 'webcam')
  }

  // Disconnect
  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.disconnect()
      clientRef.current = null
    }
    setIsConnected(false)
    setIsAudioActive(false)
    setIsVideoActive(false)
    setStatus('Disconnected')
    setTranscript([])
    setResponses([])
  }

  // Send text message
  const sendMessage = (text: string) => {
    if (clientRef.current && isConnected) {
      clientRef.current.sendText(text)
      setTranscript(prev => [...prev, `You: ${text}`])
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🚀 Gemini Live - Real-Time Multimodal AI</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={{ marginRight: '10px' }}>
          ← Back
        </button>
      </div>

      {/* Connection Section */}
      <div style={{ 
        background: isConnected ? '#e8f5e9' : '#fff3e0', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Connection</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            ref={apiKeyRef}
            type="password"
            placeholder="Enter Gemini API key (optional if in .env)"
            style={{ 
              width: '300px', 
              padding: '8px',
              marginRight: '10px',
              display: isConnected ? 'none' : 'inline'
            }}
          />
          {!isConnected ? (
            <button 
              onClick={connect}
              style={{
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔌 Connect to Gemini Live
            </button>
          ) : (
            <button 
              onClick={disconnect}
              style={{
                padding: '10px 20px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔌 Disconnect
            </button>
          )}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Status: {status}
        </div>
      </div>

      {/* Real-Time Controls */}
      {isConnected && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {/* Audio Control */}
          <div style={{ 
            flex: 1,
            background: isAudioActive ? '#e8f5e9' : '#f5f5f5',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h4>🎤 Voice (Continuous)</h4>
            <button
              onClick={toggleAudio}
              style={{
                width: '100%',
                padding: '12px',
                background: isAudioActive ? '#f44336' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {isAudioActive ? '⏹️ Stop Listening' : '🎤 Start Listening'}
            </button>
            <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
              Real-time voice conversation with AI
            </p>
          </div>

          {/* Video Control */}
          <div style={{ 
            flex: 1,
            background: isVideoActive ? '#e8f5e9' : '#f5f5f5',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h4>📹 Vision (Live Stream)</h4>
            <div style={{ marginBottom: '8px' }}>
              <button
                onClick={switchVideoMode}
                disabled={isVideoActive}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isVideoActive ? 'not-allowed' : 'pointer',
                  opacity: isVideoActive ? 0.5 : 1,
                  marginBottom: '8px'
                }}
              >
                Mode: {videoMode === 'webcam' ? '📷 Webcam' : '🖥️ Screen'}
              </button>
              <button
                onClick={toggleVideo}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isVideoActive ? '#f44336' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {isVideoActive ? '⏹️ Stop Streaming' : 
                 videoMode === 'webcam' ? '📷 Start Webcam' : '🖥️ Share Screen'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#666' }}>
              AI sees everything in real-time
            </p>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {isVideoActive && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Live Preview (AI is watching this)</h3>
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{
              width: '100%',
              maxWidth: '800px',
              background: '#000',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

      {/* Quick Actions */}
      {isConnected && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => sendMessage("What do you see?")}
              style={{ padding: '8px 16px', background: '#673AB7', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              👁️ What do you see?
            </button>
            <button 
              onClick={() => sendMessage("Describe what's happening")}
              style={{ padding: '8px 16px', background: '#673AB7', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              📝 Describe scene
            </button>
            <button 
              onClick={() => sendMessage("Can you help me with what's on screen?")}
              style={{ padding: '8px 16px', background: '#673AB7', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              💡 Help with screen
            </button>
            <button 
              onClick={() => sendMessage("What am I looking at?")}
              style={{ padding: '8px 16px', background: '#673AB7', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              ❓ What is this?
            </button>
          </div>
        </div>
      )}

      {/* Conversation Display */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Transcript */}
        <div style={{ 
          flex: 1,
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h3>Your Input</h3>
          <div style={{ fontSize: '14px' }}>
            {transcript.length > 0 ? (
              transcript.map((text, i) => (
                <div key={i} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                  {text}
                </div>
              ))
            ) : (
              <div style={{ color: '#999' }}>Your voice and actions will appear here...</div>
            )}
          </div>
        </div>

        {/* AI Responses */}
        <div style={{ 
          flex: 1,
          background: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <h3>AI Response</h3>
          <div style={{ fontSize: '14px' }}>
            {responses.length > 0 ? (
              responses.map((text, i) => (
                <div key={i} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                  {text}
                </div>
              ))
            ) : (
              <div style={{ color: '#999' }}>AI responses will appear here...</div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
        <h3>📖 How Real-Time Streaming Works</h3>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>Voice:</strong> Continuous audio streaming - just speak naturally, AI responds in real-time</li>
          <li><strong>Vision:</strong> Live video feed - AI sees everything continuously, not just snapshots</li>
          <li><strong>Context:</strong> AI maintains awareness of the entire conversation including what it sees and hears</li>
          <li><strong>Interruption:</strong> You can interrupt the AI at any time during voice conversation</li>
          <li><strong>Multimodal:</strong> Combine voice and vision - talk about what you're showing</li>
        </ul>
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          <strong>Note:</strong> This uses the Gemini Live API with WebSocket streaming for true real-time interaction.
        </p>
      </div>
    </div>
  )
}