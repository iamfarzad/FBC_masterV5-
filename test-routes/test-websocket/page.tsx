"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function WebSocketTestPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = () => {
    // Close existing connection if any
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close()
    }

    const wsUrl =
      process.env.NEXT_PUBLIC_LIVE_SERVER_URL ||
      'wss://fb-consulting-websocket.fly.dev'
    // Action logged

    setError(null)
    setMessages(prev => [...prev, `Connecting to ${wsUrl}...`])

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close()
          setError('Connection timeout')
          setMessages(prev => [...prev, '❌ Connection timeout'])
        }
      }, 10000) // 10 second timeout

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        // Action logged
        setIsConnected(true)
        setMessages(prev => [...prev, '✅ Connected successfully!'])
      }

      ws.onmessage = (event) => {
        // Action logged
        setMessages(prev => [...prev, `📨 Received: ${event.data}`])
      }

      ws.onerror = (error) => {
        // Error: WebSocket error
        setError('WebSocket connection error')
        setMessages(prev => [...prev, '❌ Connection error'])
      }

      ws.onclose = (event) => {
        // Action logged
        setIsConnected(false)
        setMessages(prev => [
          ...prev,
          `🔌 Disconnected (Code: ${event.code}, Reason: ${
            event.reason || 'N/A'
          })`,
        ])
      }
    } catch (error) {
    console.error('Failed to create WebSocket', error)
      setError(`Failed to create WebSocket: ${error}`)
      setMessages(prev => [...prev, `❌ Failed to create WebSocket: ${error}`])
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated close')
      wsRef.current = null
    }
  }

  const sendTestMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'test',
        payload: { message: 'Hello from test page!' }
      })
      wsRef.current.send(message)
      setMessages(prev => [...prev, `📤 Sent: ${message}`])
    } else {
      setMessages(prev => [...prev, '❌ Cannot send - not connected'])
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>WebSocket Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={connect} 
              disabled={isConnected}
              variant={isConnected ? "secondary" : "default"}
            >
              {isConnected ? "Connected" : "Connect"}
            </Button>
            <Button 
              onClick={disconnect} 
              disabled={!isConnected}
              variant="outline"
            >
              Disconnect
            </Button>
            <Button 
              onClick={sendTestMessage} 
              disabled={!isConnected}
              variant="outline"
            >
              Send Test Message
            </Button>
            <Button 
              onClick={clearMessages} 
              variant="ghost"
            >
              Clear Messages
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Status:</h3>
            <div className={`p-2 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            {error && (
              <div className="p-2 rounded bg-red-100 text-red-800">
                Error: {error}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Messages:</h3>
            <div className="bg-surfaceElevated p-4 rounded max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet...</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="mb-1 font-mono text-sm">
                    {msg}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Environment:</h3>
            <div className="bg-surfaceElevated p-4 rounded">
              <p><strong>WebSocket URL:</strong> {process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 'wss://fb-consulting-websocket.fly.dev'}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
