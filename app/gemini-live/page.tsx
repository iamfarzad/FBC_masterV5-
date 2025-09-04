"use client"

import { useState, useRef, useEffect, useCallback } from 'react'

export default function GeminiLivePage() {
  const [status, setStatus] = useState('Disconnected')
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isWebcamOn, setIsWebcamOn] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [mode, setMode] = useState<'voice' | 'screen' | 'webcam'>('voice')
  
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const audioChunks = useRef<Blob[]>([])

  // Connect to Gemini Live API
  const connectToGeminiLive = async () => {
    try {
      setStatus('Connecting to Gemini Live...')
      
      const response = await fetch('/api/gemini-live/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: `live-${Date.now()}`,
          mode: 'audio'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Establish WebSocket connection
        const ws = new WebSocket(data.wsUrl)
        
        ws.onopen = () => {
          setIsConnected(true)
          setStatus('Connected to Gemini Live')
          console.log('WebSocket connected')
        }
        
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data)
          handleServerMessage(message)
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setStatus('Connection error')
        }
        
        ws.onclose = () => {
          setIsConnected(false)
          setStatus('Disconnected')
        }
        
        wsRef.current = ws
      }
    } catch (error) {
      console.error('Connection failed:', error)
      setStatus('Failed to connect')
    }
  }

  // Handle messages from Gemini Live server
  const handleServerMessage = (message: any) => {
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent.modelTurn.parts[0]
      
      if (part?.text) {
        setAiResponse(prev => prev + part.text)
      }
      
      if (part?.inlineData) {
        // Handle audio response
        playAudioResponse(part.inlineData)
      }
    }
  }

  // Play audio response from AI
  const playAudioResponse = async (audioData: any) => {
    try {
      const audioBlob = new Blob([Buffer.from(audioData.data, 'base64')], {
        type: audioData.mimeType || 'audio/wav'
      })
      
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      await audio.play()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  // Start voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunks.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
          // Send audio chunks to server in real-time
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const reader = new FileReader()
            reader.onloadend = () => {
              wsRef.current?.send(JSON.stringify({
                clientContent: {
                  turns: [{
                    role: 'user',
                    parts: [{
                      inlineData: {
                        mimeType: 'audio/webm',
                        data: reader.result?.toString().split(',')[1]
                      }
                    }]
                  }]
                }
              }))
            }
            reader.readAsDataURL(event.data)
          }
        }
      }
      
      mediaRecorder.start(1000) // Send chunks every second
      setIsRecording(true)
      setStatus('Recording voice...')
    } catch (error) {
      console.error('Error starting voice recording:', error)
      setStatus('Microphone access denied')
    }
  }

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      })
      
      mediaStreamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setIsWebcamOn(true)
      setStatus('Webcam active')
      
      // Capture frames periodically
      const captureFrame = () => {
        if (videoRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          const canvas = document.createElement('canvas')
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0)
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  wsRef.current?.send(JSON.stringify({
                    clientContent: {
                      turns: [{
                        role: 'user',
                        parts: [{
                          inlineData: {
                            mimeType: 'image/jpeg',
                            data: reader.result?.toString().split(',')[1]
                          }
                        }]
                      }]
                    }
                  }))
                }
                reader.readAsDataURL(blob)
              }
            }, 'image/jpeg', 0.8)
          }
        }
      }
      
      // Capture frame every 5 seconds
      const intervalId = setInterval(captureFrame, 5000)
      
      // Store interval ID for cleanup
      mediaStreamRef.current.intervalId = intervalId
    } catch (error) {
      console.error('Error starting webcam:', error)
      setStatus('Webcam access denied')
    }
  }

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720 },
        audio: false
      })
      
      mediaStreamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setIsScreenSharing(true)
      setStatus('Screen sharing active')
      
      // Handle screen share ending
      stream.getVideoTracks()[0].onended = () => {
        stopCapture()
      }
    } catch (error) {
      console.error('Error starting screen share:', error)
      setStatus('Screen share denied')
    }
  }

  // Stop all captures
  const stopCapture = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      
      if (mediaStreamRef.current.intervalId) {
        clearInterval(mediaStreamRef.current.intervalId)
      }
      
      mediaStreamRef.current = null
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsRecording(false)
    setIsWebcamOn(false)
    setIsScreenSharing(false)
    setStatus('Capture stopped')
  }

  // Disconnect from Gemini Live
  const disconnect = () => {
    stopCapture()
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
    setStatus('Disconnected')
    setTranscript('')
    setAiResponse('')
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Gemini Live - Multimodal AI Interface</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={{ marginRight: '10px' }}>
          ← Back to Home
        </button>
      </div>

      {/* Connection Status */}
      <div style={{ 
        background: isConnected ? '#e8f5e9' : '#ffebee', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Status: {status}</h3>
        {!isConnected ? (
          <button 
            onClick={connectToGeminiLive}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Connect to Gemini Live
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
            Disconnect
          </button>
        )}
      </div>

      {/* Mode Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Select Mode:</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setMode('voice')}
            style={{
              padding: '10px 20px',
              background: mode === 'voice' ? '#2196F3' : '#e0e0e0',
              color: mode === 'voice' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🎤 Voice
          </button>
          <button
            onClick={() => setMode('webcam')}
            style={{
              padding: '10px 20px',
              background: mode === 'webcam' ? '#2196F3' : '#e0e0e0',
              color: mode === 'webcam' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📷 Webcam
          </button>
          <button
            onClick={() => setMode('screen')}
            style={{
              padding: '10px 20px',
              background: mode === 'screen' ? '#2196F3' : '#e0e0e0',
              color: mode === 'screen' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🖥️ Screen Share
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {mode === 'voice' && (
          <button
            onClick={isRecording ? stopCapture : startVoiceRecording}
            disabled={!isConnected}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: isRecording ? '#f44336' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              opacity: isConnected ? 1 : 0.5
            }}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
          </button>
        )}
        
        {mode === 'webcam' && (
          <button
            onClick={isWebcamOn ? stopCapture : startWebcam}
            disabled={!isConnected}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: isWebcamOn ? '#f44336' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              opacity: isConnected ? 1 : 0.5
            }}
          >
            {isWebcamOn ? '⏹️ Stop Webcam' : '📷 Start Webcam'}
          </button>
        )}
        
        {mode === 'screen' && (
          <button
            onClick={isScreenSharing ? stopCapture : startScreenShare}
            disabled={!isConnected}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: isScreenSharing ? '#f44336' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              opacity: isConnected ? 1 : 0.5
            }}
          >
            {isScreenSharing ? '⏹️ Stop Sharing' : '🖥️ Share Screen'}
          </button>
        )}
      </div>

      {/* Video Preview */}
      {(mode === 'webcam' || mode === 'screen') && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Preview:</h3>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            style={{ 
              width: '100%', 
              maxWidth: '640px', 
              background: '#000',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

      {/* AI Response */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h3>AI Response:</h3>
        <div style={{
          background: 'white',
          padding: '15px',
          borderRadius: '4px',
          minHeight: '100px',
          whiteSpace: 'pre-wrap'
        }}>
          {aiResponse || 'AI responses will appear here...'}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>How to Use:</h3>
        <ol>
          <li>Click "Connect to Gemini Live" to establish connection</li>
          <li>Select your preferred mode (Voice, Webcam, or Screen Share)</li>
          <li>Click the start button to begin streaming</li>
          <li>The AI will respond in real-time to your input</li>
          <li>Click stop when you're done</li>
        </ol>
        <p><strong>Note:</strong> Make sure to allow browser permissions for microphone, camera, or screen sharing when prompted.</p>
      </div>
    </div>
  )
}