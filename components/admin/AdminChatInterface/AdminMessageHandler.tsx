"use client"

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAdminChat } from '@/hooks/useAdminChat'
import { isSystemStatusQuery, formatSystemStatusResponse } from './SystemStatusHandler'

export interface AdminMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
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

export function useAdminMessageHandler(
  currentSessionId: string,
  adminId: string,
  selectedConversation: Conversation | null,
  setMessages: React.Dispatch<React.SetStateAction<AdminMessage[]>>
) {
  const { toast } = useToast()

  // Use the unified admin chat system
  const adminChat = useAdminChat({
    sessionId: currentSessionId,
    adminId,
    conversationIds: selectedConversation ? [selectedConversation.id] : undefined,
    onFinish: (message) => {
      // Update local state when message completes
      setMessages(prev => [...prev, message as AdminMessage])
    },
    onError: (error) => {
      console.error('Admin chat error:', error)
      toast({
        title: "Message Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message to local state
    const userMessage: AdminMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Check if this is a system status query
      if (isSystemStatusQuery(message)) {
        // Call system status endpoint
        const response = await fetch('/api/admin/system-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: message,
            sessionId: currentSessionId,
            adminId
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get system status')
        }

        const data = await response.json()

        // Format system status response
        const formattedResponse = formatSystemStatusResponse(data)

        const assistantMessage: AdminMessage = {
          role: 'assistant',
          content: formattedResponse,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])

        toast({
          title: "System Status Retrieved",
          description: "System health information has been analyzed and displayed",
        })

      } else {
        // Use the unified admin chat system
        await adminChat.sendMessage(message)

        // The response will be added via the onFinish callback in useAdminChat
        toast({
          title: "AI Analysis Complete",
          description: "Admin chat response generated using unified system",
        })
      }

    } catch (error: any) {
      console.error('Failed to send message:', error)

      // Add error message to chat
      const errorMessage: AdminMessage = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])

      toast({
        title: "Message Error",
        description: error.message || 'Failed to send message',
        variant: "destructive"
      })
    }
  }

  const clearMessages = () => {
    adminChat.clearMessages()
    setMessages([])
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared",
    })
  }

  return {
    sendMessage,
    clearMessages,
    isLoading: adminChat.isLoading,
    error: adminChat.error?.message || null
  }
}
