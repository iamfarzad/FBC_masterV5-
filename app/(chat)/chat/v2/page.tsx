"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Sparkles, 
  Brain, 
  Send, 
  Mic, 
  Camera,
  Monitor,
  Settings,
  Calculator,
  FileText,
  User,
  RefreshCw
} from 'lucide-react'
import { UnifiedChatDebugPanel } from '@/components/debug/UnifiedChatDebugPanel'

// Chat V2 - Working Implementation Connected to Original Pipeline
export default function ChatV2() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [intelligenceContext, setIntelligenceContext] = useState<any>(null)
  const [contextLoading, setContextLoading] = useState(false)

  // Connect to your original intelligence system
  const refreshIntelligence = useCallback(async () => {
    setContextLoading(true)
    try {
      const response = await fetch(`/api/intelligence/context?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        const context = data.ok ? (data.output || data) : null
        setIntelligenceContext(context)
        console.log('✅ Intelligence loaded:', context)
      }
    } catch (error) {
      console.error('❌ Intelligence failed:', error)
    } finally {
      setContextLoading(false)
    }
  }, [sessionId])

  // Connect to your original chat API
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Use your original unified API (now with AI SDK backend)
      const response = await fetch('/api/chat/unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            sessionId,
            intelligenceContext
          },
          mode: 'standard',
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Parse SSE response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let assistantContent = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.role === 'assistant') {
                assistantContent = data.content
                
                // Update or add assistant message
                setMessages(prev => {
                  const existing = prev.find(m => m.role === 'assistant' && m.id.startsWith('assistant-'))
                  if (existing) {
                    return prev.map(m => 
                      m.id === existing.id 
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  } else {
                    return [...prev, {
                      id: 'assistant-' + Date.now(),
                      role: 'assistant',
                      content: assistantContent,
                      timestamp: new Date()
                    }]
                  }
                })

                if (data.metadata?.isComplete) {
                  break
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Send message failed:', error)
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, sessionId, intelligenceContext])

  // Test your original tools
  const testROI = useCallback(async () => {
    try {
      const response = await fetch('/api/tools/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInvestment: 10000,
          monthlyRevenue: 5000,
          monthlyExpenses: 3000,
          timePeriod: 12
        })
      })
      
      const result = await response.json()
      console.log('✅ ROI Test Result:', result)
      
      // Handle different response formats
      const summary = result?.output?.summary || 
                     result?.summary || 
                     result?.message || 
                     `ROI: ${result?.roi || 'N/A'}%, Payback: ${result?.paybackPeriod || 'N/A'} months`
      
      setMessages(prev => [...prev, {
        id: 'roi-' + Date.now(),
        role: 'assistant',
        content: `💰 **ROI API Test Result**\n\nStatus: ${response.ok ? 'Connected ✅' : 'Failed ❌'}\nResponse: ${summary}`,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('❌ ROI test failed:', error)
      setMessages(prev => [...prev, {
        id: 'roi-error-' + Date.now(),
        role: 'assistant',
        content: `💰 **ROI API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date()
      }])
    }
  }, [])

  const testWebcam = useCallback(async () => {
    try {
      const response = await fetch('/api/tools/webcam', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-intelligence-session-id': sessionId
        },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,test',
          type: 'webcam',
          context: { trigger: 'test' }
        })
      })
      
      const result = await response.json()
      console.log('✅ Webcam Test Result:', result)
      
      setMessages(prev => [...prev, {
        id: 'webcam-' + Date.now(),
        role: 'assistant',
        content: `📷 **Webcam API Test**: ${response.ok ? 'Connected ✅' : 'Failed ❌'}`,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('❌ Webcam test failed:', error)
      setMessages(prev => [...prev, {
        id: 'webcam-error-' + Date.now(),
        role: 'assistant',
        content: `📷 **Webcam API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date()
      }])
    }
  }, [sessionId])

  const testAdmin = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      const result = await response.json()
      console.log('✅ Admin Test Result:', result)
      
      setMessages(prev => [...prev, {
        id: 'admin-' + Date.now(),
        role: 'assistant',
        content: `👥 **Admin API Test**: ${response.ok ? 'Connected ✅' : 'Failed ❌'}`,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('❌ Admin test failed:', error)
      setMessages(prev => [...prev, {
        id: 'admin-error-' + Date.now(),
        role: 'assistant',
        content: `👥 **Admin API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date()
      }])
    }
  }, [])

  const testVoice = useCallback(async () => {
    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' })
      })
      
      console.log('✅ Voice Test Result:', response.status)
      
      setMessages(prev => [...prev, {
        id: 'voice-' + Date.now(),
        role: 'assistant',
        content: `🎤 **Voice API Test**: ${response.ok ? 'Connected ✅' : 'Failed ❌'}`,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('❌ Voice test failed:', error)
      setMessages(prev => [...prev, {
        id: 'voice-error-' + Date.now(),
        role: 'assistant',
        content: `🎤 **Voice API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date()
      }])
    }
  }, [])

  // Initialize intelligence on mount
  useEffect(() => {
    refreshIntelligence()
  }, [refreshIntelligence])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) {
        sendMessage(input)
        setInput('')
      }
    }
  }, [input, sendMessage])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Original Pipeline Status */}
      <div className="w-80 border-r border-border bg-surface-elevated p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center">
              <Brain className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="font-semibold text-text">Chat V2 - Fixed</h1>
              <p className="text-sm text-text-muted">Original Pipeline Connected</p>
            </div>
          </div>

          {/* Pipeline Status */}
          <div className="bg-surface rounded-lg p-4">
            <h3 className="font-medium text-text mb-3">Original Pipeline Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Chat API:</span>
                <Badge variant="default" className="text-xs bg-green-500/10 text-green-600">
                  /api/chat/unified
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Intelligence:</span>
                <Badge variant={intelligenceContext ? "default" : "secondary"} className="text-xs">
                  {intelligenceContext ? "Loaded ✅" : "Loading..."}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Backend:</span>
                <Badge variant="default" className="text-xs bg-blue-500/10 text-blue-600">
                  AI SDK
                </Badge>
              </div>
            </div>
          </div>

          {/* Intelligence Context */}
          {intelligenceContext && (
            <div className="bg-surface rounded-lg p-4">
              <h3 className="font-medium text-text mb-3">Intelligence Context</h3>
              <div className="space-y-2 text-sm text-text-muted">
                {intelligenceContext.lead && (
                  <div>👤 {intelligenceContext.lead.name}</div>
                )}
                {intelligenceContext.company && (
                  <div>🏢 {intelligenceContext.company.name}</div>
                )}
                {intelligenceContext.role && (
                  <div>💼 {intelligenceContext.role}</div>
                )}
              </div>
            </div>
          )}

          {/* Test Original APIs */}
          <div className="space-y-2">
            <h3 className="font-medium text-text mb-3">Test Original Pipeline</h3>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={refreshIntelligence}
              disabled={contextLoading}
            >
              <Brain className="w-4 h-4 mr-2" />
              {contextLoading ? 'Loading...' : 'Test Intelligence'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={testROI}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Test ROI API
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={testWebcam}
            >
              <Camera className="w-4 h-4 mr-2" />
              Test Webcam API
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={testVoice}
            >
              <Mic className="w-4 h-4 mr-2" />
              Test Voice API
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={testAdmin}
            >
              <Settings className="w-4 h-4 mr-2" />
              Test Admin API
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-surface/95 backdrop-blur p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand" />
              <div>
                <h2 className="font-semibold text-text">Chat V2 - WORKING</h2>
                <p className="text-sm text-text-muted">Original pipeline + AI SDK backend</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-brand text-surface">
                V2 Fixed
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                {messages.length} msgs
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center shadow-lg mb-6">
                  <Brain className="w-10 h-10 text-surface" />
                </div>
                <h3 className="text-2xl font-semibold text-text mb-2">Chat V2 - WORKING</h3>
                <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                  Your original pipeline is connected! Test the buttons in the sidebar to verify 
                  your intelligence, multimodal, voice, and admin features are working.
                </p>
                  <div className="mt-4">
                    <Button
                      onClick={() => sendMessage("Hello! Test the chat functionality.")}
                      className="bg-brand hover:bg-brand-hover text-surface"
                    >
                      Test Chat Now
                    </Button>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="bg-surface border-border">
                    <Brain className="w-3 h-3 mr-1" />
                    Intelligence Connected
                  </Badge>
                  <Badge variant="outline" className="bg-surface border-border">
                    <Camera className="w-3 h-3 mr-1" />
                    Multimodal Ready
                  </Badge>
                  <Badge variant="outline" className="bg-surface border-border">
                    <Mic className="w-3 h-3 mr-1" />
                    Voice Ready
                  </Badge>
                  <Badge variant="outline" className="bg-surface border-border">
                    <Settings className="w-3 h-3 mr-1" />
                    Admin Connected
                  </Badge>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3 mt-1">
                      <Sparkles className="w-4 h-4 text-brand" />
                    </div>
                  )}
                  
                  <div className={`max-w-2xl rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-brand text-surface' 
                      : 'bg-surface-elevated border border-border'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-surface/70' : 'text-text-muted'
                    }`}>
                      {message.timestamp ? message.timestamp.toLocaleTimeString() : 'Now'}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center ml-3 mt-1">
                      <User className="w-4 h-4 text-text" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                </div>
                <div className="bg-surface-elevated border border-border rounded-lg p-4">
                  <div className="text-sm text-text-muted">AI is thinking...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-surface/95 backdrop-blur p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-surface border border-border rounded-3xl shadow-lg">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Test your original pipeline... (Intelligence, Voice, Multimodal, Admin all connected)"
                className="w-full resize-none border-0 bg-transparent py-4 pl-6 pr-20 focus:outline-none focus:ring-0 placeholder:text-text-muted"
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '56px' }}
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {input.trim() && (
                  <Button
                    onClick={() => {
                      sendMessage(input)
                      setInput('')
                    }}
                    disabled={isLoading || !input.trim()}
                    size="sm"
                    className="w-8 h-8 p-0 rounded-full bg-brand hover:bg-brand-hover text-surface"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-text-muted">
                Chat V2 - Original pipeline connected to AI SDK backend
              </p>
            </div>
          </div>
        </div>
      </div>
      <UnifiedChatDebugPanel />
    </div>
  )
}
