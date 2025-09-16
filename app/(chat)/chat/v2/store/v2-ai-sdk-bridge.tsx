'use client'

import React, { useCallback, useRef, useEffect, useState } from 'react'
import { useChatMessages, useChatActions, useChatStatus } from '@ai-sdk-tools/store'
import type { MessageData } from '../components/UnifiedMessage'
import type { AppState, ConversationState } from '../hooks/useAppState'
import { artifact } from '@ai-sdk-tools/artifacts'
import { z } from 'zod'

// Add voice artifact
const VoiceArtifact = artifact('voice', z.object({
  transcript: z.string(),
  status: z.enum(['recording', 'processing', 'complete'])
}))

// Webcam artifact
const WebcamArtifact = artifact('webcam', z.object({
  frame: z.string(), // base64
  analysis: z.string().optional(),
  status: z.enum(['active', 'processing', 'complete'])
}))

// Screen artifact
const ScreenArtifact = artifact('screen', z.object({
  frame: z.string(), // base64
  analysis: z.string().optional(),
  status: z.enum(['sharing', 'processing', 'complete'])
}))

// Bridge AI SDK Tools to v2 useAppState interface
export function useAppStateAISDKBridge() {
  // AI SDK Tools hooks
  const messages = useChatMessages()
  const { sendMessage } = useChatActions()
  const status = useChatStatus()
  
  // Local UI state (not managed by AI SDK Tools)
  const [uiState, setUIState] = React.useState({
    input: '',
    voiceMode: false,
    showVoiceOverlay: false,
    isVoiceMinimized: false,
    showWebcamInterface: false,
    isWebcamMinimized: false,
    showScreenShareInterface: false,
    isScreenShareMinimized: false,
    cameraFacing: 'user' as const,
    showBookingOverlay: false,
    showSettingsOverlay: false,
    showFileUpload: false,
    activeCanvasTool: null,
    activeTools: [] as string[],
    theme: 'light' as const,
    conversationState: {
      leadScore: 65,
      stage: 'discovery',
      showActions: true
    } as ConversationState,
    isUserScrolling: false
  })

  // Refs for auto-scroll (same as original)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Convert AI SDK Tools messages to v2 MessageData format
  const v2Messages: MessageData[] = React.useMemo(() => {
    if (!messages || !Array.isArray(messages)) return []
    
    return messages.map((m) => ({
      id: m.id,
      content: m.content,
      sender: m.role === 'user' ? 'user' as const : 'ai' as const,
      role: m.role,
      timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
      type: 'text' as const,
      isComplete: true,
    }))
  }, [messages])

  // Create AppState compatible object
  const state: AppState = {
    ...uiState,
    messages: v2Messages,
    isLoading: status === 'loading'
  }

  // Update state function (same interface as original)
  const updateState = useCallback((updates: Partial<AppState>) => {
    setUIState(prev => ({ ...prev, ...updates }))
  }, [])

  // Auto-scroll functions (same as original)
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && !state.isUserScrolling) {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: 'end',
        inline: 'nearest'
      })
    }
  }, [state.isUserScrolling])

  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true
    
    const container = messagesContainerRef.current
    const threshold = 100
    
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    )
  }, [])

  const handleScroll = useCallback(() => {
    if (!isNearBottom()) {
      updateState({ isUserScrolling: true })
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        updateState({ isUserScrolling: false })
      }, 2000)
    } else {
      updateState({ isUserScrolling: false })
    }
  }, [isNearBottom, updateState])

  // Enhanced message sending using AI SDK Tools
  const handleSendMessage = useCallback(async () => {
    if (!state.input.trim() || state.isLoading) return

    const message = state.input.trim()
    
    // Clear input immediately
    updateState({ input: '', isUserScrolling: false })
    
    // Send via AI SDK Tools
    await sendMessage({
      content: message,
      role: 'user'
    })
    
    setTimeout(() => scrollToBottom(), 50)
  }, [state.input, state.isLoading, sendMessage, updateState, scrollToBottom])

  // Auto-scroll when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [v2Messages, state.isLoading, scrollToBottom])

  return {
    state,
    updateState,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    handleSendMessage
  }
}

// Bridge AI SDK Tools to v2 useAIElementsSystem interface
export function useAIElementsSystemAISDKBridge() {
  // Simple AI Elements state (could be enhanced later)
  const [systemState, setSystemState] = React.useState({
    currentStage: {
      id: 1,
      name: "Initial Contact & Rapport",
      description: "Building trust and establishing communication foundation",
      aiElements: ['message-processing', 'conversation-context'],
      completed: false,
      active: true,
      requirements: ['Greeting exchange', 'Basic information gathering']
    },
    stageProgress: { current: 1, total: 7, percentage: 14 },
    capabilityUsage: { used: 3, total: 8 },
    activeCapabilities: [
      { id: 'message-processing', name: 'Message Processing' },
      { id: 'conversation-context', name: 'Conversation Context' },
      { id: 'response-generation', name: 'Response Generation' }
    ],
    allCapabilities: [
      { id: 'message-processing', name: 'Message Processing' },
      { id: 'conversation-context', name: 'Conversation Context' },
      { id: 'response-generation', name: 'Response Generation' },
      { id: 'real-time-processing', name: 'Real-time Processing' },
      { id: 'adaptive-learning', name: 'Adaptive Learning' },
      { id: 'document-analysis', name: 'Document Analysis' },
      { id: 'source-citation', name: 'Source Citation' },
      { id: 'task-management', name: 'Task Management' }
    ],
    allStages: [], // Will be populated
    intelligenceScore: 75
  })

  const updateSystem = useCallback((messages: any[] = []) => {
    // Simple progression logic
    const messageCount = messages.length
    let newStageIndex = 0
    
    if (messageCount > 3) newStageIndex = 1
    if (messageCount > 6) newStageIndex = 2
    if (messageCount > 10) newStageIndex = 3
    
    const newPercentage = Math.round(((newStageIndex + 1) / 7) * 100)
    
    setSystemState(prev => ({
      ...prev,
      stageProgress: {
        current: newStageIndex + 1,
        total: 7,
        percentage: newPercentage
      }
    }))
  }, [])

  const activateCapability = useCallback((capabilityId: string) => {
    setSystemState(prev => ({
      ...prev,
      activeCapabilities: [
        ...prev.activeCapabilities.filter(c => c.id !== capabilityId),
        { id: capabilityId, name: capabilityId.replace('-', ' ') }
      ]
    }))
  }, [])

  const advanceStage = useCallback(() => {
    setSystemState(prev => ({
      ...prev,
      stageProgress: {
        ...prev.stageProgress,
        current: Math.min(prev.stageProgress.current + 1, 7),
        percentage: Math.round((Math.min(prev.stageProgress.current + 1, 7) / 7) * 100)
      }
    }))
  }, [])

  const emitEvent = useCallback((event: string) => {
    console.log('AI Elements Event:', event)
    // Could trigger capability activations based on events
  }, [])

  return {
    systemState,
    updateSystem,
    activateCapability,
    advanceStage,
    emitEvent,
    aiSystem: null // Legacy compatibility
  }
}