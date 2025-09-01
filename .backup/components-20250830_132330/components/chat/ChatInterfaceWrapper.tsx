'use client'

import React from 'react'
import { ChatLayout } from './layouts/ChatLayout'
import { ChatHeader } from './layouts/ChatHeader'
import { ChatMessages } from './layouts/ChatMessages'
import { ChatComposer } from './layouts/ChatComposer'
import { ChatSidebar } from './layouts/ChatSidebar'

interface ChatInterfaceWrapperProps {
  messages?: unknown[]
  isLoading?: boolean
  sessionId?: string | null
  mode?: string
  onSendMessage?: (message: string) => void
  onClearMessages?: () => void
  onToolAction?: (action: unknown) => void
  className?: string
  stickyHeaderSlot?: React.ReactNode
  composerTopSlot?: React.ReactNode
  context?: unknown
  activityLog?: unknown[]
  stages?: Array<{ id: string; label: string; done?: boolean; current?: boolean }>
  currentStage?: string
  stageProgress?: number
}

export function ChatInterfaceWrapper({
  messages = [],
  isLoading = false,
  sessionId,
  onSendMessage,
  onClearMessages,
  onToolAction,
  className,
  composerTopSlot,
  context,
  activityLog = [],
  stages,
  currentStage,
  stageProgress
}: ChatInterfaceWrapperProps) {
  const [input, setInput] = React.useState('')

  const handleSendMessage = (message: string) => {
    setInput('')
    onSendMessage?.(message)
  }

  // Convert messages to proper format
  const chatMessages = messages.map(msg => ({
    id: msg.id || `msg-${Date.now()}`,
    role: msg.role,
    content: msg.content,
    timestamp: msg.metadata?.timestamp || new Date(),
    type: msg.type,
    metadata: msg.metadata
  }))

  return (
    <ChatLayout
      className={className}
      header={
        <ChatHeader
          sessionId={sessionId}
          onClearMessages={onClearMessages}
          rightSlot={composerTopSlot}
        />
      }
      sidebar={
        <ChatSidebar
          sessionId={sessionId}
          context={context}
          activityLog={activityLog}
          stages={stages}
          currentStage={currentStage}
          stageProgress={stageProgress}
        />
      }
      composer={
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={handleSendMessage}
          onToolAction={onToolAction}
          isLoading={isLoading}
          sessionId={sessionId}
        />
      }
    >
      <ChatMessages
        messages={chatMessages}
        isLoading={isLoading}
      />
    </ChatLayout>
  )
}