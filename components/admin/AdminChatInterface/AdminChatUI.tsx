"use client"

import React, { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Bot, Send, Copy, Check, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/src/core/utils'

interface AdminMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  name: string | null
  email: string | null
  summary: string | null
  leadScore: number | null
  researchJson: any
  pdfUrl: string | null
  emailStatus: string | null
  createdAt: string | null
}

interface AdminChatUIProps {
  messages: AdminMessage[]
  isLoading: boolean
  error: string | null
  input: string
  setInput: (value: string) => void
  onSendMessage: (message: string) => void
  onClearMessages: () => void
  selectedConversation: Conversation | null
  conversationSelector: React.ReactNode
  quickActions: React.ReactNode
  copiedMessageId: string | null
  onCopyMessage: (text: string, messageId: string) => void
}

export function AdminChatUI({
  messages,
  isLoading,
  error,
  input,
  setInput,
  onSendMessage,
  onClearMessages,
  selectedConversation,
  conversationSelector,
  quickActions,
  copiedMessageId,
  onCopyMessage
}: AdminChatUIProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      onCopyMessage(text, messageId)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Admin AI Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Business intelligence and system management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
                Connected
              </Badge>
              {conversationSelector}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      {quickActions}

      {/* Messages Area */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] w-full">
            <div className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Welcome to Admin AI</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask questions about system health, lead performance, or business insights.
                  </p>
                  {selectedConversation && (
                    <Badge variant="outline" className="bg-info/10 text-info">
                      Context: {selectedConversation.name || selectedConversation.email}
                    </Badge>
                  )}
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={`${message.timestamp.getTime()}-${index}`}
                    className={cn(
                      "flex gap-3",
                      message.role === 'assistant' ? "justify-start" : "justify-end"
                    )}
                  >
                    <Avatar className="w-6 h-6 mt-1">
                      <AvatarFallback className={cn(
                        "text-xs",
                        message.role === 'assistant'
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {message.role === 'assistant' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn(
                      "flex flex-col max-w-[80%]",
                      message.role === 'assistant' ? "items-start" : "items-end"
                    )}>
                      <div className={cn(
                        "rounded-lg px-3 py-2 text-sm relative group",
                        message.role === 'assistant'
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      )}>
                        {/* Copy button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content, `msg-${index}`)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          {copiedMessageId === `msg-${index}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>

                        <div className="pr-6 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is analyzing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedConversation
                ? `Ask about ${selectedConversation.name || 'this lead'}...`
                : "Ask about system health, leads, or business insights..."
              }
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {messages.length > 0 && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                {messages.length} messages • Session active
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearMessages}
                className="text-xs"
              >
                Clear Chat
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
