"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/src/core/utils'
import { Button } from '@/components/ui/button'
import { Send, Mic, BookOpen, Download, Plus, X, Camera, Monitor, Calculator, FileText, Video, Code, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
// Removed ActivityDisplay - using ai-elements and StageRail instead
import type { UnifiedMessage, StructuredChatMessage } from '@/src/core/types/chat'
import { StatusBar } from './StatusBar'
import { ChatHeader } from './ChatHeader'
// Temporary fallback imports - using simple components instead of complex ones
// import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
// import { PromptInputTextarea } from '@/components/ai-elements/prompt-input'
// import { MessageComponent } from '@/components/chat/layouts/ChatMessages/MessageComponent'
// import { ROICalculator } from '@/components/chat/tools/ROICalculator'



// Top Slot Actions Component
export const TopSlotActions = memo<{
  onSuggestedAction: () => void
  onBookCall: () => void
  onDownloadSummary: () => void
}>(({ onSuggestedAction, onBookCall, onDownloadSummary }) => {
  return (
    <div className="bg-muted/20 flex items-center justify-center gap-3 border-b border-border p-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onSuggestedAction}
        className="border-accent/30 hover:bg-accent/10 hover:border-accent"
      >
        <BookOpen className="mr-2 size-4" />
        Suggested Action
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onBookCall}
        className="border-accent/30 hover:bg-accent/10 hover:border-accent"
      >
        <Phone className="mr-2 size-4" />
        Book Call
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownloadSummary}
        className="border-accent/30 hover:bg-accent/10 hover:border-accent"
      >
        <Download className="mr-2 size-4" />
        Summary
      </Button>
    </div>
  )
})

// Enhanced Tool Menu Overlay (Canvas)
export const ToolCanvasOverlay = memo<{
  isOpen: boolean
  onClose: () => void
  onToolSelect: (tool: string) => void
}>(({ isOpen, onClose, onToolSelect }) => {
  if (!isOpen) return null

  const tools = [
    {
      id: 'webcam',
      name: 'Webcam Tool',
      icon: Camera,
      description: 'Live webcam capture and AI analysis',
      category: 'input'
    },
    {
      id: 'screen',
      name: 'Screen Share',
      icon: Monitor,
      description: 'Share and analyze screen content',
      category: 'input'
    },
    {
      id: 'document',
      name: 'Document Viewer',
      icon: FileText,
      description: 'Upload and analyze documents',
      category: 'input'
    },
    {
      id: 'video',
      name: 'Video to App',
      icon: Video,
      description: 'Convert videos to interactive apps',
      category: 'conversion'
    },
    {
      id: 'roi',
      name: 'ROI Calculator',
      icon: Calculator,
      description: 'Financial calculations and analysis',
      category: 'analysis'
    },
    {
      id: 'code',
      name: 'Code Editor',
      icon: Code,
      description: 'Interactive code editing and execution',
      category: 'development'
    }
  ]

  return (
    <div className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm">
      <div className="absolute inset-4 overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">Tool Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Tool Grid */}
        <div className="max-h-full overflow-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card
                    className="hover:border-accent/50 cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => {
                      onToolSelect(tool.id)
                      onClose()
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-accent/10 group-hover:bg-accent/20 rounded-lg p-2 transition-colors">
                          <IconComponent className="size-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 text-sm font-medium">{tool.name}</h3>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})

// Enhanced Composer with Tool Menu
export const EnhancedComposer = memo<{
  input: string
  setInput: (value: string) => void
  onSend: () => void
  onToolAction: (tool: string) => void
  disabled?: boolean
  placeholder?: string
}>(({ input, setInput, onSend, onToolAction, disabled, placeholder = "Type message or /command" }) => {
  const [contextBadge, setContextBadge] = useState<string | null>(null)
  const [showToolCanvas, setShowToolCanvas] = useState(false)

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }, [onSend])

  const handleToolAction = useCallback((tool: string) => {
    if (tool === 'menu') {
      setShowToolCanvas(true)
    } else {
      onToolAction(tool)
    }
  }, [onToolAction])

  return (
    <>
      <div className="border-t border-border bg-background">
        <TopSlotActions
          onSuggestedAction={() => onToolAction('suggested')}
          onBookCall={() => onToolAction('book-call')}
          onDownloadSummary={() => onToolAction('summary')}
        />

        <div className="flex items-end gap-2 p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="border-border/30 bg-muted/40 hover:bg-accent/10 size-8 rounded-full border"
            onClick={() => handleToolAction('menu')}
          >
            <Plus className="size-3.5" />
          </Button>

          {contextBadge && (
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              {contextBadge}
            </Badge>
          )}

          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="max-h-[120px] min-h-[40px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleToolAction('voice')}
            className="hover:bg-accent/10 size-8"
          >
            <Mic className="size-4" />
          </Button>

          <Button
            type="button"
            onClick={onSend}
            disabled={disabled || !input.trim()}
            className="hover:bg-accent/90 h-8 bg-accent px-4 text-accent-foreground"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>

      <ToolCanvasOverlay
        isOpen={showToolCanvas}
        onClose={() => setShowToolCanvas(false)}
        onToolSelect={onToolAction}
      />
    </>
  )
})

// Types moved to @/src/core/types/chat.ts

export interface UnifiedChatInterfaceProps {
  messages: UnifiedMessage[]
  isLoading?: boolean
  sessionId?: string | null
  mode?: 'full' | 'dock'
  onSendMessage?: (message: string) => void
  onClearMessages?: () => void
  onToolAction?: (tool: string, data?: unknown) => void
  onAssistantInject?: (message: UnifiedMessage) => void
  className?: string
  // Optional slot rendered as a sticky header inside the scrollable message list
  stickyHeaderSlot?: React.ReactNode
  // Optional slot rendered directly above the composer, pinned with it
  composerTopSlot?: React.ReactNode
}


// Optimized Message List with performance considerations
const MessageList: React.FC<{
  messages: UnifiedMessage[];
  isLoading: boolean;
  stickyHeader?: React.ReactNode;
}> = ({ messages, isLoading, stickyHeader }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  // Non-virtual rendering for visual stability; we'll re-introduce virtualization behind a flag later

  // Track whether user is near the bottom to decide stick-to-bottom behavior
  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const handleScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      isNearBottomRef.current = distance < 120
    }
    handleScroll()
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll to bottom on new messages (only if user is near bottom)
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!isNearBottomRef.current) return
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 80)
    return () => window.clearTimeout(id)
  }, [messages.length])

  const handleKeyScroll = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = parentRef.current
    if (!el) return
    if (e.key === 'PageDown') {
      e.preventDefault()
      el.scrollBy({ top: el.clientHeight - 80, behavior: 'smooth' })
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      el.scrollBy({ top: -(el.clientHeight - 80), behavior: 'smooth' })
    } else if (e.key === 'End') {
      e.preventDefault()
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    } else if (e.key === 'Home') {
      e.preventDefault()
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  return (
    <div
      ref={parentRef}
      className="h-full overflow-y-auto"
      role="region"
      aria-label="Message list"
      tabIndex={0}
      onKeyDown={handleKeyScroll}
    >
      {stickyHeader && (
        <div className="bg-background/90 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 border-b border-border backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 pb-3 pt-2">
            {stickyHeader}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-3xl space-y-4 p-4 pb-32">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.15) }}
              layout
            >
              <MessageComponent message={message} isLast={index === messages.length - 1} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="size-2 animate-pulse rounded-full bg-current" />
            <div
              className="size-2 animate-pulse rounded-full bg-current"
              style={{ animationDelay: '75ms' }}
            />
            <div
              className="size-2 animate-pulse rounded-full bg-current"
              style={{ animationDelay: '150ms' }}
            />
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  )
}

// Main Unified Chat Interface
export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({
  messages,
  isLoading = false,
  sessionId,
  mode = 'full',
  onSendMessage,
  onClearMessages,
  onToolAction,
  className,
  stickyHeaderSlot,
  composerTopSlot,
  onAssistantInject
}) => {
  const [input, setInput] = useState('')
  const isDock = mode === 'dock'
  const [isRoiOpen, setIsRoiOpen] = useState(false)
  const [localMessages, setLocalMessages] = useState<UnifiedMessage[]>(messages)

  // Keep local copy in sync when prop changes
  useEffect(() => { setLocalMessages(messages) }, [messages])

  // Listen for tool analysis events to append assistant messages
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ content: string; sources?: unknown; type?: string }>
      const payload = ce.detail || { content: '' }
      const msg: UnifiedMessage = {
        id: `msg-${Date.now()}-tool`,
        role: 'assistant',
        content: payload.content,
        type: payload.type === 'analysis' ? 'analysis' : 'tool',
        metadata: { timestamp: new Date(), sources: payload.sources as any }
      }
      if (typeof onAssistantInject === 'function') onAssistantInject(msg)
      else setLocalMessages(prev => [...prev, msg])
    }
    window.addEventListener('chat:assistant', handler as EventListener)
    return () => window.removeEventListener('chat:assistant', handler as EventListener)
  }, [])
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim())
      setInput('')
    }
  }, [input, onSendMessage])
  
  return (
    <TooltipProvider>
      <div className={cn(
        isDock ? 'h-full flex flex-col overflow-hidden bg-background' : 
        'fixed inset-0 z-40 flex h-[100dvh] flex-col overflow-hidden bg-background',
        className
      )}>
        {/* Enhanced Header */}
        {!isDock && (
          <ChatHeader
            onReset={onClearMessages || (() => {})}
            onSettings={() => onToolAction?.('settings')}
            sessionId={sessionId}
          />
        )}
        
        {/* Conversation Area - Simplified Fallback */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto" aria-live="polite" aria-busy={isLoading}>
            <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6" aria-label="Chat messages">
              {messages.length === 0 && !isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid min-h-[40vh] flex-1 place-items-center"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold">
                      Ready to assist you
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Ask anything or share what you're working on
                    </p>
                    <div className="mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => onSendMessage?.('Start with a website analysis for www.farzadbayat.com')}
                        className="bg-accent/10 hover:bg-accent/20 border-accent/30 hover:border-accent/50"
                      >
                        Start with Website Analysis
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {localMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="flex-1">
                        <div className="mb-1 text-sm text-muted-foreground">
                          {message.role === 'user' ? 'You' : 'Assistant'}
                        </div>
                        <div className="text-sm">
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {/* Scroll button removed for simplicity */}
          </div>
        </div>
        
        {/* Enhanced Composer */}
        {!isDock && (
          <EnhancedComposer
            input={input}
            setInput={setInput}
            onSend={() => {
              if (input.trim()) {
                onSendMessage?.(input.trim())
                setInput('')
              }
            }}
            onToolAction={(tool) => {
              switch (tool) {
                case 'menu':
                  onToolAction?.('menu')
                  break
                case 'voice':
                  onToolAction?.('voice')
                  break
                case 'suggested':
                  onToolAction?.('suggested')
                  break
                case 'book-call':
                  onToolAction?.('book-call')
                  break
                case 'summary':
                  onToolAction?.('summary')
                  break
                default:
                  onToolAction?.(tool)
              }
            }}
            disabled={isLoading}
            placeholder="Type message or /command"
          />
        )}

        {/* Status Bar */}
        {!isDock && (
          <StatusBar
            isLoading={isLoading}
            currentStage={3}
            totalStages={7}
          />
        )}

        {/* Clean AI Process Status - Using ai-elements */}
        {!isDock && isLoading && (
          <div className="fixed bottom-20 right-4 z-50">
            <div className="bg-card/90 border-border/20 rounded-xl border p-3 shadow-lg backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-2 animate-pulse rounded-full bg-accent" />
                AI is thinking...
              </div>
            </div>
          </div>
        )}
        {/* ROI inline tool host (disabled for simplified fallback) */}
        {false && (
          <div>ROI Calculator placeholder</div>
        )}
      </div>
    </TooltipProvider>
  )
}

export default UnifiedChatInterface
