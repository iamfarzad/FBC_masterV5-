'use client'

import { useState, useRef, useEffect } from 'react'
import { useUnifiedChat } from '@/hooks/useUnifiedChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Loader2,
  AlertCircle,
  X,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useUnifiedChat({
    mode: 'standard'
  })
  const [showAlert, setShowAlert] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    
    // Animate new messages
    if (messageRefs.current.length > 0) {
      const lastMessage = messageRefs.current[messageRefs.current.length - 1]
      if (lastMessage) {
        lastMessage.style.opacity = '0'
        lastMessage.style.transform = 'translateY(20px)'
        
        requestAnimationFrame(() => {
          if (lastMessage) {
            lastMessage.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            lastMessage.style.opacity = '1'
            lastMessage.style.transform = 'translateY(0)'
          }
        })
      }
    }
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input?.trim()) return
    handleSubmit(e)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-foreground">F.B/c Chat</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 bg-background">
        <div className="mx-auto max-w-2xl py-8" data-testid="chat-container">
          {messages.length === 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Start a conversation with F.B/c AI
              </p>
            </div>
          )}

          {messages.map((message, i) => (
            <div
              key={i}
              ref={(el) => { messageRefs.current[i] = el }}
              className={cn(
                'mb-4 flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-3',
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error Alert */}
      {error && showAlert && (
        <Alert variant="destructive" className="mx-6 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error.message}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowAlert(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Input Form */}
      <div className="border-t border-border bg-surface p-4">
        <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input?.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}