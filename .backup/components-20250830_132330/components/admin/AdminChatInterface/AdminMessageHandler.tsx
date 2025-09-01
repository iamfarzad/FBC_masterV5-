"use client"

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    setIsLoading(true)
    setError(null)

    // Add user message to local state
    const userMessage: AdminMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      let response
      let conversationIds = selectedConversation ? [selectedConversation.id] : []

      // Check if this is a system status query
      if (isSystemStatusQuery(message)) {
        // Call system status endpoint
        response = await fetch('/api/admin/system-status', {
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
        // Regular admin chat with business intelligence
        response = await fetch('/api/admin/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId: currentSessionId,
            conversationIds,
            adminId
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        const data = await response.json()

        // Add AI response to local state
        const assistantMessage: AdminMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])

        // Show business intelligence toast
        toast({
          title: "AI Analysis Complete",
          description: `Business insights generated${data.leadsReferenced > 0 ? ` with ${data.leadsReferenced} lead(s) referenced` : ''}`,
        })
      }

    } catch (error: any) {
      console.error('Failed to send message:', error)
      setError(error.message || 'Failed to send message')

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
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setError(null)
    toast({
      title: "Chat Cleared",
      description: "All messages have been cleared",
    })
  }

  return {
    sendMessage,
    clearMessages,
    isLoading,
    error
  }
}
