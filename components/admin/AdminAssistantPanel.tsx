"use client"

import React, { useMemo, useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CleanInputField } from '@/app/(chat)/chat/v2/components/input/CleanInputField'
import { AiElementsConversation } from '@/components/chat/AiElementsConversation'
import { useUnifiedChat } from '@/hooks/useUnifiedChat'
import {
  useUnifiedChatMessages,
  useUnifiedChatStatus,
  useUnifiedChatError,
} from '@/src/core/chat/state/unified-chat-store'
// Removed mapper import - using native AI SDK types directly
import type { AiChatMessage } from '@/src/core/chat/ai-elements'

const ADMIN_EMPTY_STATE = (
  <div className="rounded-3xl border border-border bg-surface/70 p-10 text-center shadow-sm">
    <p className="text-lg font-medium text-text">Need executive insights?</p>
    <p className="mt-2 text-sm text-text-muted">
      Ask about pipeline health, campaign performance, or request a consolidated lead report.
    </p>
  </div>
)

export function AdminAssistantPanel() {
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => `admin-${crypto.randomUUID()}`)

  const {
    sendMessage,
    addMessage,
  } = useUnifiedChat({
    sessionId,
    mode: 'admin',
    context: {
      sessionId,
      admin: true,
    },
  })

  const messages = useUnifiedChatMessages()
  const chatStatus = useUnifiedChatStatus()
  const chatError = useUnifiedChatError()
  const isStreaming = chatStatus === 'streaming'
  const isSubmitting = chatStatus === 'submitted'
  const isLoading = isStreaming || isSubmitting

  const aiMessages = useMemo<AiChatMessage[]>(
    () => messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      displayRole: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.timestamp,
      isComplete: msg.metadata?.isComplete ?? true,
      suggestions: msg.metadata?.suggestions || [],
      sources: msg.metadata?.sources || [],
      reasoning: msg.metadata?.reasoning,
      tools: msg.metadata?.tools || [],
      tasks: msg.metadata?.tasks || [],
      citations: msg.metadata?.citations || [],
      metadata: msg.metadata || {}
    })),
    [messages],
  )

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
  }, [])

  const handleMessageAction = useCallback((action: 'copy' | 'regenerate', messageId: string) => {
    const target = messages.find((message) => message.id === messageId)
    if (!target) return

    switch (action) {
      case 'copy':
        if (target.content) {
          void navigator.clipboard.writeText(target.content)
        }
        break
      case 'regenerate':
        if (target.role === 'user' && target.content) {
          void sendMessage(target.content)
        }
        break
    }
  }, [messages, sendMessage])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    try {
      await sendMessage(content.trim())
      setInput('')
    } catch (error) {
      console.error('Admin chat send failed:', error)
      addMessage({
        role: 'assistant',
        content: `Admin assistant error: ${error instanceof Error ? error.message : 'Unknown issue'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { error: true },
      })
    }
  }, [sendMessage, addMessage])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="outline" className="border-brand/40 bg-brand/5 text-brand">
          <Sparkles className="mr-2 h-3 w-3" /> F.B/c Admin Assistant
        </Badge>
        <h2 className="text-xl font-semibold text-text">Executive Intelligence Workspace</h2>
        <p className="text-sm text-text-muted">
          Ask for pipeline summaries, lead deep-dives, or operational guidance. Responses are optimized for executive review.
        </p>
      </div>

      <AiElementsConversation
        messages={aiMessages}
        onSuggestionClick={handleSuggestionClick}
        onMessageAction={handleMessageAction}
        emptyState={ADMIN_EMPTY_STATE}
      />

      <CleanInputField
        value={input}
        onChange={setInput}
        onSend={() => {
          void handleSendMessage(input)
        }}
        onDocumentUpload={() => {
          addMessage({
            role: 'assistant',
            content: '📄 Uploads will be connected to the admin knowledge base soon.',
            timestamp: new Date(),
            type: 'text',
            metadata: { info: true },
          })
        }}
        onImageUpload={() => {
          addMessage({
            role: 'assistant',
            content: '🖼️ Visual analysis is coming to the admin console shortly.',
            timestamp: new Date(),
            type: 'text',
            metadata: { info: true },
          })
        }}
        onROI={() => {
          addMessage({
            role: 'assistant',
            content: '💰 ROI calculators will integrate with finance dashboards soon.',
            timestamp: new Date(),
            type: 'text',
            metadata: { info: true },
          })
        }}
        isLoading={isLoading}
      />

      {chatError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {chatError.message}
        </div>
      )}
    </div>
  )
}
