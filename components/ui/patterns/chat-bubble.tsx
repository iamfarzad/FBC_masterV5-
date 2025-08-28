'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/src/core/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Chat bubble variants using design system
const chatBubbleVariants = cva(
  [
    'relative max-w-[85%] rounded-2xl px-4 py-3',
    'transition-all duration-200 ease-out',
    'break-words hyphens-auto'
  ],
  {
    variants: {
      role: {
        user: [
          'bg-gradient-to-r from-accent to-accent/90 text-accent-foreground',
          'ml-auto shadow-lg hover:shadow-xl',
          'rounded-br-md' // Distinctive corner for user messages
        ],
        assistant: [
          'bg-card/60 backdrop-blur-xl border border-border/20',
          'text-foreground shadow-md hover:shadow-lg',
          'rounded-bl-md' // Distinctive corner for assistant messages
        ],
        system: [
          'bg-muted/50 text-muted-foreground border border-border/10',
          'mx-auto text-center text-sm'
        ]
      }
    },
    defaultVariants: {
      role: 'assistant'
    }
  }
)

export interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariants> {
  content: string
  timestamp?: Date
  showTimestamp?: boolean
  showAvatar?: boolean
}

export const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ 
    className, 
    role, 
    content, 
    timestamp, 
    showTimestamp = false,
    showAvatar = true,
    ...props 
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'flex gap-3 items-end',
          role === 'user' ? 'flex-row-reverse' : 'flex-row'
        )}
        {...props}
      >
        {/* Avatar */}
        {showAvatar && role !== 'system' && (
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className={cn(
              role === 'user' 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-muted text-muted-foreground'
            )}>
              {role === 'user' ? 'U' : 'AI'}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Message Bubble */}
        <div className={cn(chatBubbleVariants({ role }), className)}>
          <div className="whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
          
          {/* Timestamp */}
          {showTimestamp && timestamp && (
            <div className={cn(
              'text-xs mt-2 opacity-70',
              role === 'user' ? 'text-accent-foreground/70' : 'text-muted-foreground'
            )}>
              {timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      </motion.div>
    )
  }
)

ChatBubble.displayName = 'ChatBubble'

// Typing Indicator Component
export const TypingIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('flex gap-3 items-end', className)}
      {...props}
    >
      {/* AI Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="bg-muted text-muted-foreground">
          AI
        </AvatarFallback>
      </Avatar>
      
      {/* Typing Bubble */}
      <div className={cn(
        chatBubbleVariants({ role: 'assistant' }),
        'flex items-center gap-1 min-w-[60px]'
      )}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/50"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-2">AI is typing...</span>
      </div>
    </motion.div>
  )
})

TypingIndicator.displayName = 'TypingIndicator'

export { chatBubbleVariants }