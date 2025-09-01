"use client"

import React, { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/src/core/utils'

// Extracted components and hooks
import { QuickActions } from './AdminChatInterface/QuickActions'
import { AdminChatUI } from './AdminChatInterface/AdminChatUI'
import { ConversationSelector } from './AdminChatInterface/ConversationSelector'
import { useConversationContext } from './AdminChatInterface/ConversationContextManager'
import { useAdminMessageHandler, type AdminMessage } from './AdminChatInterface/AdminMessageHandler'

interface AdminChatInterfaceProps {
  className?: string
}

export function AdminChatInterface({ className }: AdminChatInterfaceProps) {
  const { toast } = useToast()
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  // Session management
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [adminId] = useState<string>('admin') // In production, get from auth context

  // Message state
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [input, setInput] = useState('')

  // Conversation context management
  const {
    conversations,
    selectedConversation,
    showConversationSelector,
    setShowConversationSelector,
    loadConversations,
    handleConversationSelect
  } = useConversationContext()

  // Message handling
  const {
    sendMessage,
    clearMessages,
    isLoading,
    error
  } = useAdminMessageHandler(
    currentSessionId,
    adminId,
    selectedConversation,
    setMessages
  )

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const sessionId = `admin-session-${Date.now()}`
      setCurrentSessionId(sessionId)

      try {
        await fetch('/api/admin/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            adminId,
            sessionName: `Admin Session ${new Date().toLocaleDateString()}`
          })
        })
      } catch (error) {
        console.error('Failed to initialize session:', error)
      }
    }

    initializeSession()
    loadConversations()
  }, [adminId, loadConversations])

  // Handle quick action clicks
  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  // Handle message sending
  const handleSendMessage = async (message: string) => {
    await sendMessage(message)
    setInput('')
  }

  // Handle message copying
  const handleCopyMessage = (text: string, messageId: string) => {
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  return (
    <div className={cn("max-w-6xl mx-auto p-6 space-y-6", className)}>
      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />

      {/* Main Chat Interface */}
      <AdminChatUI
        messages={messages}
        isLoading={isLoading}
        error={error}
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        onClearMessages={clearMessages}
        selectedConversation={selectedConversation}
        conversationSelector={
          <ConversationSelector
            conversations={conversations}
            selectedConversation={selectedConversation}
            showConversationSelector={showConversationSelector}
            onToggleSelector={() => setShowConversationSelector(!showConversationSelector)}
            onSelectConversation={handleConversationSelect}
          />
        }
        quickActions={<QuickActions onActionClick={handleQuickAction} />}
        copiedMessageId={copiedMessageId}
        onCopyMessage={handleCopyMessage}
      />
    </div>
  )
}
