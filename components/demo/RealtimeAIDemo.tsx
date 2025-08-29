'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Zap, Globe, Clock } from 'lucide-react'
import { useDemoChat } from '@/hooks/useRealtimeChat'
import { cn } from '@/lib/utils'

interface DemoStats {
  responseTime: number
  messageCount: number
  avgResponseTime: number
  lastResponseTime: Date
}

export function RealtimeAIDemo() {
  const [input, setInput] = useState('')
  const [stats, setStats] = useState<DemoStats>({
    responseTime: 0,
    messageCount: 0,
    avgResponseTime: 0,
    lastResponseTime: new Date()
  })
  const responseStartTime = useRef<number>(0)

  const { messages, sendDemoMessage, isLoading, error } = useDemoChat()

  const handleSendMessage = async () => {
    if (!input.trim()) return

    responseStartTime.current = Date.now()
    setStats(prev => ({ ...prev, messageCount: prev.messageCount + 1 }))

    await sendDemoMessage(input.trim())
    setInput('')

    // Update response time stats
    const responseTime = Date.now() - responseStartTime.current
    setStats(prev => ({
      ...prev,
      responseTime,
      avgResponseTime: Math.round((prev.avgResponseTime * (prev.messageCount - 1) + responseTime) / prev.messageCount),
      lastResponseTime: new Date()
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const demoMessages = [
    "How can AI help my business grow?",
    "Show me examples of AI automation",
    "What are the latest AI trends for 2025?",
    "How do you handle AI security concerns?",
    "Can AI integrate with my existing systems?"
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold">F.B/c AI - Real-Time Demo</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Experience enterprise-grade AI with Edge Function performance
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Global Edge Network
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Real-Time Streaming
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {stats.avgResponseTime}ms Avg Response
          </Badge>
        </div>
      </div>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Demo Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.messageCount}</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.avgResponseTime}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.responseTime > 0 ? `${stats.responseTime}ms` : '--'}
              </div>
              <div className="text-sm text-muted-foreground">Last Response</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {messages.filter(m => m.role === 'assistant').length}
              </div>
              <div className="text-sm text-muted-foreground">AI Responses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Real-Time AI Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    message.role === 'user'
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about AI consulting..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Demo Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Try These Demo Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {demoMessages.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(question)}
                className="justify-start h-auto p-3 text-left"
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Capabilities Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🚀</div>
              <div className="font-medium">Edge Functions</div>
              <div className="text-sm text-muted-foreground">Global performance</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">⚡</div>
              <div className="font-medium">Real-Time Streaming</div>
              <div className="text-sm text-muted-foreground">Live responses</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🛡️</div>
              <div className="font-medium">Enterprise Security</div>
              <div className="text-sm text-muted-foreground">Production ready</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">🎯</div>
              <div className="font-medium">AI Consulting Focus</div>
              <div className="text-sm text-muted-foreground">Business optimized</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
