'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import * as anime from 'animejs'
import { 
  Send, 
  Loader2,
  AlertCircle,
  X,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  })
  const [showAlert, setShowAlert] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    
    // Animate new messages with vanilla JS instead of anime.js
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
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">F.B/c</h1>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6">
        <div className="mx-auto max-w-2xl py-8">
          {messages.length === 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Start a conversation
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              ref={el => messageRefs.current[index] = el}
              className={cn(
                'mb-6',
                message.role === 'user' ? 'ml-12' : 'mr-12'
              )}
            >
              <div className={cn(
                'rounded-lg px-4 py-3',
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {message.role === 'user' ? 'You' : 'F.B/c'}
              </p>
            </div>
          ))}
          
          {isLoading && (
            <div className="mr-12 mb-6">
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Alert */}
      {error && (
        <div className="px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              onClick={() => setShowAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}

      {/* Input */}
      <div className="border-t px-6 py-4">
        <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
          <div className="flex gap-2">
            <Input
              value={input || ''}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input?.trim()} size="icon">
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