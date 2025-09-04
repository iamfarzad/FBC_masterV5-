'use client'

import React, { memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/src/core/types/chat'
import { Task, TaskTrigger, TaskContent, TaskItem } from '@/components/ai-elements/task'

interface ChatMessagesProps {
  messages: Message[]
  isLoading?: boolean
  translation?: string | null
}

const MessageComponent = memo(({ 
  message, 
  translation 
}: { 
  message: Message
  translation?: string | null 
}) => {
  const messageVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  }), [])

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group relative mb-6"
    >
      {/* Main Message Content */}
      <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
          message.role === 'user' 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        }`}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {message.content}
          </div>
        </div>
      </div>

      {/* Translation */}
      {translation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-accent/40 text-foreground/90 mt-3 border-l-2 pl-3 text-sm"
        >
          <div className="mb-1 text-xs uppercase tracking-wide opacity-70">
            Translated (ES)
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {translation}
          </div>
        </motion.div>
      )}

      {/* Task Management */}
      {message.businessContent?.type === 'consultation_planner' && (
        <div className="mt-3">
          <Task>
            <TaskTrigger title="Consultation Plan" />
            <TaskContent>
              <TaskItem>Schedule initial discovery call</TaskItem>
              <TaskItem>Prepare business analysis framework</TaskItem>
              <TaskItem>Review company documentation</TaskItem>
              <TaskItem>Create consultation proposal</TaskItem>
              <TaskItem>Set up follow-up meetings</TaskItem>
            </TaskContent>
          </Task>
        </div>
      )}
    </motion.div>
  )
})

MessageComponent.displayName = 'MessageComponent'

export const ChatMessages = memo(({ 
  messages, 
  isLoading, 
  translation 
}: ChatMessagesProps) => {
  const memoizedMessages = useMemo(() => 
    messages.map((message) => (
      <MessageComponent 
        key={message.id || `${message.role}-${message.timestamp}`}
        message={message}
        translation={translation}
      />
    )), 
    [messages, translation]
  )

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <AnimatePresence mode="popLayout">
        {memoizedMessages}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:0.2s]" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:0.4s]" />
            </div>
            <span>AI is thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

ChatMessages.displayName = 'ChatMessages'