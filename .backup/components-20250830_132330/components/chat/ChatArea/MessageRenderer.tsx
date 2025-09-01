"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Bot, User, AlertTriangle, Info, Clock, Target, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/src/core/utils'
import type { Message } from '@/app/(chat)/chat/types/chat'

interface MessageRendererProps {
  message: Message
  index: number
  isVisible: boolean
  copiedMessageId: string | null
  onCopy: (text: string, messageId: string) => void
}

export function MessageRenderer({
  message,
  index,
  isVisible,
  copiedMessageId,
  onCopy
}: MessageRendererProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  if (!message?.id) return null

  const isAssistant = message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.15) }}
      className={cn(
        "flex gap-3",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
        isAssistant
          ? "bg-accent/10"
          : "bg-primary/10"
      )}>
        {isAssistant ? (
          <Bot className="w-4 h-4 text-accent" />
        ) : (
          <User className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        "flex flex-col max-w-[85%] min-w-0",
        isAssistant ? "items-start" : "items-end"
      )}>
        {/* Message bubble */}
        <div className={cn(
          "relative group/message transition-all duration-200",
          "rounded-2xl px-4 py-3",
          isAssistant
            ? "bg-surface text-foreground"
            : "bg-primary text-primary-foreground"
        )}>
          {/* Copy button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(message.content || '', message.id)}
                    className="h-6 w-6 p-0 hover:bg-background/50"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Message content */}
          <div className="prose prose-sm max-w-none leading-relaxed break-words dark:prose-invert prose-slate">
            {message.content}
          </div>

          {/* Message metadata */}
          {message.timestamp && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
              <Clock className="w-3 h-3" />
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}

          {/* Business content */}
          {message.businessContent && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">
                  {message.businessContent.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: message.businessContent.htmlContent }}
              />
            </div>
          )}

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 space-y-2">
              <Separator />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Sources</span>
              </div>
              <div className="space-y-1">
                {message.sources.map((source, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-1 h-1 bg-accent rounded-full" />
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline truncate"
                    >
                      {source.title || source.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citations */}
          {message.metadata?.citations && message.metadata.citations.length > 0 && (
            <div className="mt-3">
              <Separator />
              <div className="text-xs text-muted-foreground mt-2">
                Citations: {message.metadata.citations.map(c => `[${c.title}]`).join(', ')}
              </div>
            </div>
          )}

          {/* Error state */}
          {message.metadata?.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{message.metadata.error}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
