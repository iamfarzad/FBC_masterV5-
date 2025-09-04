"use client"

import { useState, useRef, useEffect } from 'react'

export default function VoiceTestPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [status, setStatus] = useState('Disconnected')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const audioChunks = useRef<Blob[]>([])

  // Initialize Gemini Live connection
  const connectGeminiLive = async () => {
    try {
      setStatus('Connecting to Gemini Live...')
      
      // Start Gemini Live session
      const res = await fetch('/api/gemini-live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'voice-test-' + Date.now() })
      })
      
      const data = await res.json()
      console.log('Gemini Live session:', data)
      
      if (data.success) {
        setIsConnected(true)
        setStatus('Connected to Gemini Live')
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      setStatus('Failed to connect')
    }
  }

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunks.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        await sendAudioToAPI(audioBlob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setStatus('Recording...')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setStatus('Microphone access denied')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setStatus('Processing audio...')
    }
  }

  // Send audio to transcription API
  const sendAudioToAPI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      setTranscript(data.text || 'No transcription available')
      setStatus('Transcribed successfully')
      
      // Send transcribed text to chat
      if (data.text) {
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: data.text }],
            stream: false
          })
        })
        
        const reader = chatRes.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ''
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data !== '[DONE]' && data !== '{}') {
                  fullResponse += data
                }
              }
            }
          }
          setResponse(fullResponse)
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      setStatus('Error processing audio')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Voice Testing with Gemini Live API</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'} style={{ marginRight: '10px' }}>
          ← Back to Home
        </button>
        <button onClick={() => window.location.href = '/chat'}>
          Go to Chat
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Connection Status</h2>
        <p>Status: <strong>{status}</strong></p>
        <p>Connected: {isConnected ? '✓ Yes' : '✗ No'}</p>
        
        <div style={{ marginTop: '10px' }}>
          {!isConnected ? (
            <button 
              onClick={connectGeminiLive}
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
              onClick={() => { setIsConnected(false); setStatus('Disconnected') }}
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
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Voice Recording</h2>
        <p>Click the button below to start/stop recording:</p>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isConnected}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            background: isRecording ? '#f44336' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.5,
            marginTop: '10px'
          }}
        >
          {isRecording ? '🔴 Stop Recording' : '🎤 Start Recording'}
        </button>
        
        {!isConnected && (
          <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
            Connect to Gemini Live first to enable recording
          </p>
        )}
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Transcript</h2>
        <div style={{ 
          background: 'white', 
          padding: '10px', 
          borderRadius: '4px', 
          minHeight: '60px',
          fontFamily: 'sans-serif'
        }}>
          {transcript || 'Your speech will appear here...'}
        </div>
      </div>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>AI Response</h2>
        <div style={{ 
          background: 'white', 
          padding: '10px', 
          borderRadius: '4px', 
          minHeight: '60px',
          fontFamily: 'sans-serif'
        }}>
          {response || 'AI response will appear here...'}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>How to Test Voice:</h3>
        <ol>
          <li>Click "Connect to Gemini Live" to establish connection</li>
          <li>Click "Start Recording" and speak your message</li>
          <li>Click "Stop Recording" when done</li>
          <li>Your speech will be transcribed and sent to the AI</li>
          <li>The AI response will appear below</li>
        </ol>
        <p><strong>Note:</strong> Make sure to allow microphone access when prompted by your browser.</p>
      </div>
    </div>
  )
}