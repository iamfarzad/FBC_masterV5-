"use client"

import React, { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/src/core/utils'
import { useToast } from '@/hooks/use-toast'
import { useVideoToAppDetection } from '@/hooks/use-video-to-app-detection'
import type { Message } from '@/app/(chat)/chat/types/chat'
import type { ROICalculationResult } from '@/components/chat/tools/ROICalculator/ROICalculator.types'
import type { BusinessInteractionData, UserBusinessContext } from '@/types/business-content'
import type { VoiceTranscriptResult, WebcamCaptureResult, VideoAppResult, ScreenShareResult } from '@/src/core/services/tool-service'

// Extracted components
import { EmptyState } from './EmptyState'
import { MessageRenderer } from './MessageRenderer'
import { VideoToAppCard } from './VideoToAppCard'
import { ToolDetector, detectMessageType, detectToolType } from './ToolDetector'
import { ChatScrollManager } from './ChatScrollManager'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onVoiceTranscript: (transcript: string) => void
  onWebcamCapture: (imageData: string) => void
  onROICalculation: (result: ROICalculationResult) => void
  onVideoAppResult: (result: VideoAppResult) => void
  onScreenAnalysis: (analysis: string) => void
  onBusinessInteraction?: (data: BusinessInteractionData) => void
  userContext?: UserBusinessContext
}

export function ChatArea({
  messages,
  isLoading,
  onVoiceTranscript,
  onWebcamCapture,
  onROICalculation,
  onVideoAppResult,
  onScreenAnalysis,
  onBusinessInteraction,
  userContext
}: ChatAreaProps) {
  const { toast } = useToast()
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [videoToAppCards, setVideoToAppCards] = useState<Record<string, any>>({})
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())

  // Video-to-App detection and handling
  const handleVideoDetected = useCallback((messageId: string, videoUrl: string, videoToAppCard: any) => {
    setVideoToAppCards(prev => ({
      ...prev,
      [messageId]: videoToAppCard
    }))
  }, [])

  const handleVideoToAppStart = useCallback(async (messageId: string, videoUrl: string) => {
    // Update the card status to analyzing
    setVideoToAppCards(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        status: 'analyzing',
        progress: 25
      }
    }))

    try {
      // Start the video analysis
      const response = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateSpec',
          videoUrl,
          userPrompt: '',
          sessionId: messageId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze video')
      }

      const result = await response.json()

      // Update card with results
      setVideoToAppCards(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          status: 'completed',
          progress: 100,
          spec: result.spec,
          code: result.code
        }
      }))

    } catch (error) {
      console.error('Video analysis error:', error)
      setVideoToAppCards(prev => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          status: 'error',
          error: 'Failed to analyze video'
        }
      }))
    }
  }, [])

  // Initialize video detection
  useVideoToAppDetection({
    messages,
    onVideoDetected: handleVideoDetected
  })

  // Copy to clipboard
  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard"
      })
    } catch (error) {
      console.error('Failed to copy text:', error)
      toast({
        title: "Copy failed",
        description: "Could not copy message to clipboard",
        variant: "destructive"
      })
    }
  }

  const handleVisibleMessagesChange = useCallback((visibleMessages: Set<string>) => {
    setVisibleMessages(visibleMessages)
  }, [])

  return (
    <ChatScrollManager
      messages={messages}
      onVisibleMessagesChange={handleVisibleMessagesChange}
    >
      {messages.length === 0 && !isLoading ? (
        <EmptyState />
      ) : (
        <AnimatePresence>
          {messages.map((message, index) => {
            if (!message?.id) return null

            const messageType = message.role === "assistant" ? detectMessageType(message.content || '') : { type: 'default' }
            const toolType = detectToolType(message.content || '')
            const isVisible = visibleMessages.has(message.id)

            return (
              <div key={message.id} data-message-id={message.id}>
                {/* Video-to-App card */}
                {message.videoToAppCard && (
                  <VideoToAppCard
                    videoToAppCard={videoToAppCards[message.id] || message.videoToAppCard}
                    messageId={message.id}
                    onStartAnalysis={handleVideoToAppStart}
                  />
                )}

                {/* Regular message */}
                <MessageRenderer
                  message={message}
                  index={index}
                  isVisible={isVisible}
                  copiedMessageId={copiedMessageId}
                  onCopy={copyToClipboard}
                />

                {/* Tool components */}
                <ToolDetector
                  content={message.content || ''}
                  messageId={message.id}
                  onVoiceTranscript={onVoiceTranscript}
                  onWebcamCapture={onWebcamCapture}
                  onROICalculation={onROICalculation}
                  onScreenAnalysis={onScreenAnalysis}
                />
              </div>
            )
          })}
        </AnimatePresence>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '75ms' }} />
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="text-sm">AI is thinking...</span>
          </div>
        </div>
      )}
    </ChatScrollManager>
  )
}
