'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Loader2, 
  Bot, 
  Shield,
  Database,
  Activity,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'admin' | 'system'
  content: string
  timestamp: Date
  context?: any
}

export function AdminChat({ context }: { context: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Admin chat initialized. I have access to system metrics, user interactions, and can perform administrative actions.',
      timestamp: new Date(),
      context
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const adminMessage: Message = {
      id: Date.now().toString(),
      role: 'admin',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, adminMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Admin chat API with context from client interactions
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          message: input,
          context: {
            systemMetrics: context,
            clientInteractions: await fetchClientInteractions(),
            mode: 'admin-privileged'
          }
        })
      })

      if (!response.ok) throw new Error('Admin chat request failed')

      const data = await response.json()
      
      const systemResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: data.message,
        timestamp: new Date(),
        context: data.context
      }

      setMessages(prev => [...prev, systemResponse])
    } catch (error) {
      console.error('Admin chat error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Error processing admin request. Please check system logs.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClientInteractions = async () => {
    // Fetch recent client chat interactions for context
    try {
      const response = await fetch('/api/admin/interactions')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch client interactions:', error)
    }
    return null
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Admin Console Chat</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          Context: System + Client Data
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === 'admin' ? "bg-red-500" : "bg-primary/10"
              )}>
                {message.role === 'admin' ? (
                  <Shield className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className={cn(
                  "rounded-lg px-4 py-2",
                  message.role === 'admin' 
                    ? "bg-red-500/10 border border-red-500/20" 
                    : "bg-muted"
                )}>
                  <p className="text-sm">{message.content}</p>
                  
                  {message.context && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <details>
                        <summary className="cursor-pointer hover:underline">
                          View Context
                        </summary>
                        <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                          {JSON.stringify(message.context, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Admin command or query..."
            disabled={isLoading}
            className="min-h-[40px] resize-none"
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-red-500 hover:bg-red-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}