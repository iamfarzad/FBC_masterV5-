"use client"

import { useState, useEffect, useRef } from 'react'

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; metadata?: any }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [contextEnabled, setContextEnabled] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [webcamEnabled, setWebcamEnabled] = useState(false)
  const [screenEnabled, setScreenEnabled] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const eventSourceRef = useRef<EventSource | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Generate session ID on mount
  useEffect(() => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    setSessionId(id)
  }, [])

  // Test standard chat API
  const sendMessage = async () => {
    if (!input.trim()) return
    
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          sessionId,
          stream: false, // Explicitly request non-streaming response
          context: contextEnabled ? { 
            intelligenceEnabled: true,
            multimodal: {
              voice: voiceEnabled,
              webcam: webcamEnabled,
              screen: screenEnabled
            }
          } : undefined,
          mode: adminMode ? 'admin' : 'standard'
        })
      })
      
      // Check if response is streaming (SSE)
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullMessage = ''
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    fullMessage += parsed.content
                  }
                } catch (e) {
                  fullMessage += data
                }
              }
            }
          }
          setMessages([...newMessages, { role: 'assistant', content: fullMessage }])
        }
      } else {
        // Handle JSON response
        const text = await response.text()
        try {
          const data = JSON.parse(text)
          if (data.message) {
            setMessages([...newMessages, { role: 'assistant', content: data.message, metadata: data.metadata }])
          } else if (data.error) {
            setMessages([...newMessages, { role: 'assistant', content: `Error: ${data.error}` }])
          }
        } catch (e) {
          // If not JSON, just display the text
          setMessages([...newMessages, { role: 'assistant', content: text }])
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${error}` }])
    } finally {
      setLoading(false)
    }
  }

  // Test streaming chat API
  const sendStreamingMessage = async () => {
    if (!input.trim()) return
    
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setStreamingText('')

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const params = new URLSearchParams({
        messages: JSON.stringify(newMessages),
        sessionId,
        stream: 'true'
      })

      const eventSource = new EventSource(`/api/chat/stream?${params}`)
      eventSourceRef.current = eventSource

      let accumulatedText = ''

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'text') {
          accumulatedText += data.data
          setStreamingText(accumulatedText)
        } else if (data.type === 'done') {
          setMessages([...newMessages, { role: 'assistant', content: accumulatedText }])
          setStreamingText('')
          setStreaming(false)
          eventSource.close()
        }
      }

      eventSource.onerror = () => {
        setMessages([...newMessages, { role: 'assistant', content: 'Streaming error occurred' }])
        setStreaming(false)
        eventSource.close()
      }
    } catch (error) {
      console.error('Streaming error:', error)
      setStreaming(false)
    }
  }

  // Test WebSocket connection
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
      wsRef.current = null
      return
    }

    const ws = new WebSocket(`ws://localhost:5000/api/ws/chat?sessionId=${sessionId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setMessages(prev => [...prev, { role: 'system', content: 'WebSocket connected' }])
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || data }])
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setMessages(prev => [...prev, { role: 'system', content: 'WebSocket disconnected' }])
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setMessages(prev => [...prev, { role: 'system', content: 'WebSocket error' }])
    }
  }

  // Send message via WebSocket
  const sendWebSocketMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(JSON.stringify({ 
        type: 'message',
        content: input,
        sessionId 
      }))
      setMessages(prev => [...prev, { role: 'user', content: input }])
      setInput('')
    }
  }

  // Test various API endpoints
  const testEndpoint = async (endpoint: string, body?: any) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      const data = await response.json()
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `API Response from ${endpoint}: ${JSON.stringify(data, null, 2)}`
      }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `API Error from ${endpoint}: ${error}`
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Advanced Chat Testing Interface</h2>
      <a href="/">← Back to Home</a>
      
      <div style={{ marginTop: '20px' }}>
        <strong>Session ID:</strong> {sessionId}
      </div>

      {/* Feature Toggles */}
      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ddd' }}>
        <h3>Features:</h3>
        <label>
          <input 
            type="checkbox" 
            checked={contextEnabled} 
            onChange={(e) => setContextEnabled(e.target.checked)}
          />
          Intelligence Context
        </label>
        <br />
        <label>
          <input 
            type="checkbox" 
            checked={voiceEnabled} 
            onChange={(e) => setVoiceEnabled(e.target.checked)}
          />
          Voice Input
        </label>
        <br />
        <label>
          <input 
            type="checkbox" 
            checked={webcamEnabled} 
            onChange={(e) => setWebcamEnabled(e.target.checked)}
          />
          Webcam
        </label>
        <br />
        <label>
          <input 
            type="checkbox" 
            checked={screenEnabled} 
            onChange={(e) => setScreenEnabled(e.target.checked)}
          />
          Screen Share
        </label>
        <br />
        <label>
          <input 
            type="checkbox" 
            checked={adminMode} 
            onChange={(e) => setAdminMode(e.target.checked)}
          />
          Admin Mode
        </label>
      </div>

      {/* Chat Messages */}
      <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflow: 'auto' }}>
        {messages.length === 0 && <p>No messages yet. Type something below to start.</p>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <strong>{msg.role}:</strong> {msg.content}
            {msg.metadata && (
              <details>
                <summary>Metadata</summary>
                <pre style={{ fontSize: '10px' }}>{JSON.stringify(msg.metadata, null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
        {streamingText && (
          <div style={{ marginBottom: '10px' }}>
            <strong>assistant (streaming):</strong> {streamingText}
          </div>
        )}
        {(loading || streaming) && <p>Processing...</p>}
      </div>
      
      {/* Input */}
      <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Type your message..."
          style={{ flex: 1 }}
          disabled={loading || streaming}
        />
        <button onClick={sendMessage} disabled={loading || streaming}>
          Send
        </button>
        <button onClick={sendStreamingMessage} disabled={loading || streaming}>
          Stream
        </button>
        <button onClick={sendWebSocketMessage} disabled={!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN}>
          WS Send
        </button>
      </div>

      {/* Advanced Testing */}
      <h3>Advanced Functions:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <button onClick={() => connectWebSocket()}>
          {wsRef.current?.readyState === WebSocket.OPEN ? 'Disconnect' : 'Connect'} WebSocket
        </button>
        <button onClick={() => testEndpoint('/api/intelligence/context?sessionId=' + sessionId)}>
          Get Intelligence Context
        </button>
        <button onClick={() => testEndpoint('/api/admin/chat/context?sessionId=' + sessionId)}>
          Get Admin Context
        </button>
        <button onClick={() => testEndpoint('/api/chat/unified', { 
          messages: messages, 
          context: { multimodal: true },
          mode: 'multimodal'
        })}>
          Test Unified Chat
        </button>
        <button onClick={() => testEndpoint('/api/gemini-live/start', { sessionId })}>
          Start Gemini Live
        </button>
        <button onClick={() => testEndpoint('/api/tools/webcam/capture', {})}>
          Capture Webcam
        </button>
        <button onClick={() => testEndpoint('/api/tools/screen/capture', {})}>
          Capture Screen
        </button>
        <button onClick={() => testEndpoint('/api/voice/transcribe', { audio: 'test' })}>
          Test Voice Transcribe
        </button>
        <button onClick={() => testEndpoint('/api/chat/memory', { sessionId, action: 'get' })}>
          Get Chat Memory
        </button>
      </div>

      {/* Real-time Monitoring */}
      <h3>Backend Monitoring:</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <button onClick={() => testEndpoint('/api/admin/monitoring/realtime')}>
          Real-time Stats
        </button>
        <button onClick={() => testEndpoint('/api/admin/stats')}>
          Admin Stats
        </button>
        <button onClick={() => testEndpoint('/api/feature-flags')}>
          Feature Flags
        </button>
        <button onClick={() => testEndpoint('/api/admin/cache/stats')}>
          Cache Stats
        </button>
        <button onClick={() => testEndpoint('/api/admin/performance')}>
          Performance Metrics
        </button>
        <button onClick={() => testEndpoint('/api/admin/logs?level=error')}>
          Error Logs
        </button>
      </div>
    </div>
  )
}