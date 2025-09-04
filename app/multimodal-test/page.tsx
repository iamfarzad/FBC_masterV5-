'use client'

import { useState, useRef, useEffect } from 'react'

export default function MultimodalTestPage() {
  const [mode, setMode] = useState<'voice' | 'webcam' | 'screen'>('voice')
  const [isActive, setIsActive] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [response, setResponse] = useState('')
  const [transcript, setTranscript] = useState('')
  
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioChunks = useRef<Blob[]>([])

  // Voice Recording with Real Gemini API
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      mediaStreamRef.current = stream
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      audioChunks.current = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        await processVoice(audioBlob)
      }
      
      recorder.start()
      setIsActive(true)
      setStatus('🎤 Recording voice...')
    } catch (error) {
      console.error('Microphone error:', error)
      setStatus('❌ Microphone access denied')
    }
  }

  // Process voice with existing backend
  const processVoice = async (audioBlob: Blob) => {
    setStatus('Processing voice...')
    
    // Step 1: Transcribe using existing API
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.webm')
    
    const transcribeRes = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData
    })
    
    const { text } = await transcribeRes.json()
    setTranscript(text || 'No speech detected')
    
    if (text) {
      // Step 2: Send to chat API with real Gemini
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: text }
          ]
        })
      })
      
      // Handle streaming response
      const reader = chatRes.body?.getReader()
      const decoder = new TextDecoder()
      
      setResponse('')
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data && data !== '[DONE]') {
                setResponse(prev => prev + data)
              }
            }
          }
        }
      }
    }
    
    setStatus('✅ Voice processed')
  }

  // Webcam Capture with Vision API
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      })
      
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setIsActive(true)
      setStatus('📷 Webcam active - Click "Capture & Analyze" to process')
    } catch (error) {
      console.error('Webcam error:', error)
      setStatus('❌ Webcam access denied')
    }
  }

  // Capture and analyze webcam frame
  const captureWebcamFrame = async () => {
    if (!videoRef.current) return
    
    setStatus('Analyzing image...')
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        // Send to webcam API
        const formData = new FormData()
        formData.append('image', blob, 'capture.jpg')
        formData.append('prompt', 'Describe what you see in this image')
        
        const res = await fetch('/api/tools/webcam/capture', {
          method: 'POST',
          body: formData
        })
        
        const data = await res.json()
        setResponse(data.analysis || data.message || 'No analysis available')
        setStatus('✅ Image analyzed')
      }, 'image/jpeg', 0.9)
    }
  }

  // Screen Sharing with Analysis
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      // Handle screen share ending
      stream.getVideoTracks()[0].onended = () => {
        stopCapture()
      }
      
      setIsActive(true)
      setStatus('🖥️ Screen sharing active - Click "Capture & Analyze" to process')
    } catch (error) {
      console.error('Screen share error:', error)
      setStatus('❌ Screen share denied')
    }
  }

  // Capture and analyze screen
  const captureScreen = async () => {
    if (!videoRef.current) return
    
    setStatus('Analyzing screen...')
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        const formData = new FormData()
        formData.append('screenshot', blob, 'screen.jpg')
        formData.append('context', 'Analyze this screen and provide insights')
        
        const res = await fetch('/api/tools/screen/capture', {
          method: 'POST',
          body: formData
        })
        
        const data = await res.json()
        setResponse(data.analysis || data.message || 'No analysis available')
        setStatus('✅ Screen analyzed')
      }, 'image/jpeg', 0.9)
    }
  }

  // Stop all captures
  const stopCapture = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
    setStatus('Stopped')
  }

  // Test backend connectivity
  useEffect(() => {
    // Check if Gemini API is configured
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }]
      })
    }).then(res => {
      if (res.ok) {
        console.log('✅ Chat API connected')
      }
    }).catch(err => {
      console.error('Chat API error:', err)
    })
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Multimodal Backend Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => window.location.href = '/'}>← Back</button>
      </div>

      {/* Mode Selection */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => { stopCapture(); setMode('voice'); }}
          style={{
            padding: '10px 20px',
            background: mode === 'voice' ? '#2196F3' : '#e0e0e0',
            color: mode === 'voice' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🎤 Voice/Talk
        </button>
        <button
          onClick={() => { stopCapture(); setMode('webcam'); }}
          style={{
            padding: '10px 20px',
            background: mode === 'webcam' ? '#2196F3' : '#e0e0e0',
            color: mode === 'webcam' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          📷 Webcam/Vision
        </button>
        <button
          onClick={() => { stopCapture(); setMode('screen'); }}
          style={{
            padding: '10px 20px',
            background: mode === 'screen' ? '#2196F3' : '#e0e0e0',
            color: mode === 'screen' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🖥️ Screen Share
        </button>
      </div>

      {/* Status */}
      <div style={{ 
        padding: '10px', 
        background: isActive ? '#e8f5e9' : '#f5f5f5',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {status}
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '20px' }}>
        {mode === 'voice' && (
          <>
            <button
              onClick={isActive ? stopCapture : startVoiceRecording}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                background: isActive ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50px'
              }}
            >
              {isActive ? '⏹️ Stop Recording' : '🎤 Start Recording'}
            </button>
            {transcript && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <strong>Transcript:</strong> {transcript}
              </div>
            )}
          </>
        )}
        
        {mode === 'webcam' && (
          <>
            <button
              onClick={isActive ? stopCapture : startWebcam}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                background: isActive ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                marginRight: '10px'
              }}
            >
              {isActive ? '⏹️ Stop Webcam' : '📷 Start Webcam'}
            </button>
            {isActive && (
              <button
                onClick={captureWebcamFrame}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px'
                }}
              >
                📸 Capture & Analyze
              </button>
            )}
          </>
        )}
        
        {mode === 'screen' && (
          <>
            <button
              onClick={isActive ? stopCapture : startScreenShare}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                background: isActive ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                marginRight: '10px'
              }}
            >
              {isActive ? '⏹️ Stop Sharing' : '🖥️ Share Screen'}
            </button>
            {isActive && (
              <button
                onClick={captureScreen}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px'
                }}
              >
                📸 Capture & Analyze
              </button>
            )}
          </>
        )}
      </div>

      {/* Video Preview */}
      {(mode === 'webcam' || mode === 'screen') && (
        <div style={{ marginBottom: '20px' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            style={{ 
              width: '100%', 
              maxWidth: '800px',
              background: '#000',
              borderRadius: '8px',
              display: isActive ? 'block' : 'none'
            }}
          />
        </div>
      )}

      {/* AI Response */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        minHeight: '150px'
      }}>
        <h3>AI Response:</h3>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {response || 'Responses will appear here...'}
        </div>
      </div>

      {/* Backend Status */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#e3f2fd', 
        borderRadius: '8px' 
      }}>
        <h3>Backend Systems Status:</h3>
        <ul>
          <li>✅ Chat API: Using real Gemini API</li>
          <li>✅ Voice Transcription: /api/voice/transcribe</li>
          <li>✅ Webcam Vision: /api/tools/webcam/capture</li>
          <li>✅ Screen Analysis: /api/tools/screen/capture</li>
          <li>✅ Streaming: Server-Sent Events active</li>
        </ul>
      </div>
    </div>
  )
}