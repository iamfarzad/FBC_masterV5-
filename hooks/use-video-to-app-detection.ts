'use client'

import { useEffect, useCallback } from 'react'
import { detectYouTubeUrls, createVideoToAppCard, isValidYouTubeUrl } from '@/src/core/youtube-url-detection'
import type { Message } from '@/app/(chat)/chat/types/chat'

interface UseVideoToAppDetectionProps {
  messages: Message[]
  onVideoDetected: (messageId: string, videoUrl: string, videoToAppCard: any) => void
  onVideoToAppStart: (messageId: string, videoUrl: string) => void
  sessionId?: string
}

export function useVideoToAppDetection({
  messages,
  onVideoDetected,
  onVideoToAppStart,
  sessionId
}: UseVideoToAppDetectionProps) {

  const processMessageForYouTubeUrls = useCallback((message: Message) => {
    // Skip if message already has a videoToAppCard
    if (message.videoToAppCard) return

    // Only process user messages
    if (message.role !== 'user') return

    // Detect YouTube URLs in message content
    const youtubeUrls = detectYouTubeUrls(message.content)

    if (youtubeUrls.length > 0) {
      // Use the first valid YouTube URL found
      const videoUrl = youtubeUrls.find(url => isValidYouTubeUrl(url))

      if (videoUrl) {
        const videoToAppCard = createVideoToAppCard(videoUrl, sessionId)

        if (videoToAppCard) {
          onVideoDetected(message.id, videoUrl, videoToAppCard)
        }
      }
    }
  }, [onVideoDetected, sessionId])

  const startVideoToAppGeneration = useCallback(async (messageId: string, videoUrl: string) => {
    try {
      onVideoToAppStart(messageId, videoUrl)

      // Start the video-to-app generation process
      const response = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateSpec',
          videoUrl,
          userPrompt: '',
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start video analysis')
      }

      const result = await response.json()

      // The progress will be updated through WebSocket or polling
      // For now, we'll simulate progress updates
      return result

    } catch (error) {
      console.error('Error starting video-to-app generation:', error)
      throw error
    }
  }, [onVideoToAppStart, sessionId])

  // Process messages when they change
  useEffect(() => {
    messages.forEach(message => {
      processMessageForYouTubeUrls(message)
    })
  }, [messages, processMessageForYouTubeUrls])

  return {
    processMessageForYouTubeUrls,
    startVideoToAppGeneration
  }
}
