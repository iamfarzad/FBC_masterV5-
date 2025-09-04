"use client"

import { useState } from 'react'

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

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
        body: JSON.stringify({ messages: newMessages })
      })
      
      const data = await response.json()
      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to get response' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Chat Testing Interface</h2>
      <a href="/">← Back to Home</a>
      
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', height: '400px', overflow: 'auto' }}>
        {messages.length === 0 && <p>No messages yet. Type something below to start.</p>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        {loading && <p>AI is thinking...</p>}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>

      <h3 style={{ marginTop: '30px' }}>Test Streaming Chat</h3>
      <button onClick={() => window.location.href = '/api/chat/stream'}>
        Test SSE Streaming Endpoint
      </button>
    </div>
  )
}