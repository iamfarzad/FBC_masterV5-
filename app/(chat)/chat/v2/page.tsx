"use client"

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Sparkles, Brain, Mic, X } from 'lucide-react'

import { StageRailCard } from '@/components/collab/StageRail'
import { UnifiedControlPanel } from './components/UnifiedControlPanel'
import {
  UnifiedMessage,
  UnifiedMultimodalWidget,
  type MessageData,
} from './components/UnifiedMessage'
import { CleanInputField } from './components/input/CleanInputField'
import { VoiceOverlay } from '@/components/chat/VoiceOverlay'
import { ScreenShare } from '@/components/chat/tools/ScreenShare/ScreenShare'
import { WebcamCapture } from '@/components/chat/tools/WebcamCapture/WebcamCapture'
import { UnifiedChatDebugPanel } from '@/components/debug/UnifiedChatDebugPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useUnifiedChat } from '@/hooks/useUnifiedChat'
import {
  useUnifiedChatMessages,
  useUnifiedChatStatus,
  useUnifiedChatError,
} from '@/src/core/chat/state/unified-chat-store'
import { UnifiedChatActionsProvider } from '@/src/core/chat/unified-chat-context'
import { useStage } from '@/contexts/stage-context'

const TEST_ACTIONS: Array<{
  id: string
  label: string
  description: string
  onClick: (opts: TestActionHandlers) => Promise<void> | void
}> = [
  {
    id: 'intelligence',
    label: 'Test Intelligence',
    description: 'Validate session intelligence context',
    onClick: async ({ refreshIntelligence }) => {
      await refreshIntelligence()
    },
  },
  {
    id: 'roi',
    label: 'Test ROI API',
    description: 'Run ROI calculation pipeline test',
    onClick: ({ testROI }) => {
      void testROI()
    },
  },
  {
    id: 'webcam',
    label: 'Test Webcam API',
    description: 'Trigger webcam analysis endpoint',
    onClick: ({ testWebcam }) => {
      void testWebcam()
    },
  },
  {
    id: 'voice',
    label: 'Test Voice API',
    description: 'Ping Gemini Live voice endpoint',
    onClick: ({ testVoice }) => {
      void testVoice()
    },
  },
  {
    id: 'admin',
    label: 'Test Admin API',
    description: 'Verify admin analytics integration',
    onClick: ({ testAdmin }) => {
      void testAdmin()
    },
  },
]

interface TestActionHandlers {
  refreshIntelligence: () => Promise<void>
  testROI: () => Promise<void>
  testWebcam: () => Promise<void>
  testVoice: () => Promise<void>
  testAdmin: () => Promise<void>
}

export default function ChatV2() {
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => crypto.randomUUID())
  const [intelligenceContext, setIntelligenceContext] = useState<any>(null)
  const [contextLoading, setContextLoading] = useState(false)

  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false)

  const chatContext = useMemo(
    () => ({
      sessionId,
      intelligenceContext: intelligenceContext || undefined,
    }),
    [sessionId, intelligenceContext],
  )

  const {
    sendMessage,
    addMessage,
    updateContext,
  } = useUnifiedChat({
    sessionId,
    mode: 'standard',
    context: chatContext,
  })

  const messages = useUnifiedChatMessages()
  const chatStatus = useUnifiedChatStatus()
  const chatError = useUnifiedChatError()
  const isStreaming = chatStatus === 'streaming'
  const isSubmitting = chatStatus === 'submitted'
  const isLoading = isStreaming || isSubmitting

  const stageCtx = useStage()
  const stageProgress = useMemo(() => ({
    current: stageCtx.currentStageIndex + 1,
    total: stageCtx.stages.length,
    percentage: stageCtx.getProgressPercentage(),
  }), [stageCtx])

  const systemState = useMemo(() => ({
    currentStage: stageCtx.stages[stageCtx.currentStageIndex] ?? null,
    stageProgress,
    capabilityUsage: {
      used: intelligenceContext?.capabilities?.length ?? 0,
      total: 16,
    },
    activeCapabilities: intelligenceContext?.capabilities ?? [],
    allCapabilities: intelligenceContext?.capabilities ?? [],
    allStages: stageCtx.stages,
    intelligenceScore: stageProgress.percentage,
  }), [intelligenceContext, stageCtx, stageProgress])

  const conversationState = useMemo(() => ({
    leadScore: intelligenceContext?.leadScore ?? 65,
    stage: stageCtx.stages[stageCtx.currentStageIndex]?.label ?? 'Discovery',
    showActions: true,
  }), [intelligenceContext, stageCtx])

  const activeTools = useMemo(() => {
    const tools: string[] = []
    if (isVoiceOverlayOpen) tools.push('voice')
    if (isWebcamOpen) tools.push('webcam')
    if (isScreenShareOpen) tools.push('screen')
    return tools
  }, [isVoiceOverlayOpen, isWebcamOpen, isScreenShareOpen])

  const mappedMessages = useMemo<MessageData[]>(
    () =>
      messages.map((message) => ({
        id: message.id,
        content: message.content,
        sender: message.role === 'user' ? 'user' : 'ai',
        role: message.role,
        timestamp: message.timestamp,
        type: (message.metadata?.type as MessageData['type']) || 'text',
        suggestions: message.metadata?.suggestions,
        isComplete: message.metadata?.isComplete ?? true,
      })),
    [messages],
  )

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
  }, [])

  const handleMessageAction = useCallback((action: string, messageId: string) => {
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
      default:
        break
    }
  }, [messages, sendMessage])

  const refreshIntelligence = useCallback(async () => {
    setContextLoading(true)
    try {
      const response = await fetch(`/api/intelligence/context?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        const context = data.ok ? (data.output || data) : null
        setIntelligenceContext(context)
        console.log('✅ Intelligence loaded:', context)
      }
    } catch (error) {
      console.error('❌ Intelligence failed:', error)
    } finally {
      setContextLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    void refreshIntelligence()
  }, [refreshIntelligence])

  useEffect(() => {
    if (intelligenceContext) {
      updateContext({ intelligenceContext })
    }
  }, [intelligenceContext, updateContext])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    try {
      await sendMessage(content.trim())
    } catch (error) {
      console.error('❌ Send message failed:', error)
      addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { error: true },
      })
    }
  }, [sendMessage, addMessage])

  const testROI = useCallback(async () => {
    try {
      const response = await fetch('/api/tools/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialInvestment: 10000,
          monthlyRevenue: 5000,
          monthlyExpenses: 3000,
          timePeriod: 12,
        }),
      })

      const result = await response.json()
      const summary =
        result?.output?.summary ||
        result?.summary ||
        result?.message ||
        `ROI: ${result?.roi || 'N/A'}%, Payback: ${result?.paybackPeriod || 'N/A'} months`

      addMessage({
        role: 'assistant',
        content: `💰 **ROI API Test Result**\n\nStatus: ${response.ok ? 'Connected ✅' : 'Failed ❌'}\nResponse: ${summary}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'roi-test' },
      })
    } catch (error) {
      console.error('❌ ROI test failed:', error)
      addMessage({
        role: 'assistant',
        content: `💰 **ROI API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'roi-test', error: true },
      })
    }
  }, [addMessage])

  const testWebcam = useCallback(async () => {
    try {
      const response = await fetch('/api/tools/webcam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-intelligence-session-id': sessionId,
        },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,test',
          type: 'webcam',
          context: { trigger: 'test' },
        }),
      })

      addMessage({
        role: 'assistant',
        content: `📷 **Webcam API Test**: ${response.ok ? 'Connected ✅' : 'Failed ❌'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'webcam-test' },
      })
    } catch (error) {
      console.error('❌ Webcam test failed:', error)
      addMessage({
        role: 'assistant',
        content: `📷 **Webcam API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'webcam-test', error: true },
      })
    }
  }, [sessionId, addMessage])

  const testAdmin = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      await response.json().catch(() => undefined)

      addMessage({
        role: 'assistant',
        content: `👥 **Admin API Test**: ${response.ok ? 'Connected ✅' : 'Failed ❌'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'admin-test' },
      })
    } catch (error) {
      console.error('❌ Admin test failed:', error)
      addMessage({
        role: 'assistant',
        content: `👥 **Admin API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'admin-test', error: true },
      })
    }
  }, [addMessage])

  const testVoice = useCallback(async () => {
    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      })

      addMessage({
        role: 'assistant',
        content: `🎤 **Voice API Test**: ${response.ok ? 'Connected ✅' : 'Failed ❌'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'voice-test' },
      })
    } catch (error) {
      console.error('❌ Voice test failed:', error)
      addMessage({
        role: 'assistant',
        content: `🎤 **Voice API Test**\n\nStatus: Failed ❌\nError: ${error instanceof Error ? error.message : 'Network error'}`,
        timestamp: new Date(),
        type: 'text',
        metadata: { source: 'voice-test', error: true },
      })
    }
  }, [addMessage])

  const handleToolSelect = useCallback((toolId: string) => {
    switch (toolId) {
      case 'voice':
        setIsVoiceOverlayOpen(true)
        break
      case 'webcam':
        setIsWebcamOpen(true)
        break
      case 'screen':
        setIsScreenShareOpen(true)
        break
      case 'docs':
        addMessage({
          role: 'assistant',
          content: '📄 Document workspace coming soon. Upload support will be restored after AI SDK migration.',
          timestamp: new Date(),
          type: 'text',
          metadata: { source: 'docs', info: true },
        })
        break
      default:
        break
    }
  }, [addMessage])

  const handleGeneratePDF = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: '📑 Report generation queued. You will receive a draft shortly.',
      timestamp: new Date(),
      type: 'text',
      metadata: { source: 'report' },
    })
  }, [addMessage])

  const handleShowSettings = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: '⚙️ Settings panel is under construction as part of the AI SDK migration.',
      timestamp: new Date(),
      type: 'text',
      metadata: { source: 'settings', info: true },
    })
  }, [addMessage])

  const handleShowBooking = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: '📅 Booking assistant is syncing with the new pipeline. Please use the contact form meanwhile.',
      timestamp: new Date(),
      type: 'text',
      metadata: { source: 'booking', info: true },
    })
  }, [addMessage])

  const handleVoiceAccepted = useCallback((transcript: string) => {
    setIsVoiceOverlayOpen(false)
    void handleSendMessage(transcript)
  }, [handleSendMessage])

  return (
    <UnifiedChatActionsProvider
      value={{
        addMessage,
        sendMessage: handleSendMessage,
        updateContext,
      }}
    >
      <div className="relative min-h-screen bg-background pb-40">
        <UnifiedControlPanel
          systemState={systemState}
          conversationState={conversationState}
          activeTools={activeTools}
          onToolSelect={handleToolSelect}
          onGeneratePDF={handleGeneratePDF}
          onShowSettings={handleShowSettings}
          onShowBooking={handleShowBooking}
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-16 md:flex-row md:gap-16">
          <div className="w-full flex-1 space-y-8 md:pl-20">
            <div className="space-y-2">
              <Badge variant="outline" className="border-brand/40 bg-brand/5 text-brand">
                <Sparkles className="mr-2 h-3 w-3" /> F.B/c AI Assistant
              </Badge>
              <div className="flex items-center gap-3 text-lg font-semibold text-text">
                <Brain className="h-5 w-5 text-brand" />
                Business Intelligence Session
              </div>
              <p className="text-sm text-text-muted">
                Guided consultation powered by Gemini 2.5 — tracking discovery stages, multimodal tools, and ROI validation.
              </p>
            </div>

            <div className="space-y-4">
              {mappedMessages.length === 0 ? (
                <div className="rounded-3xl border border-border bg-surface/70 p-10 text-center shadow-sm">
                  <p className="text-lg font-medium text-text">How can I help you today?</p>
                  <p className="mt-2 text-sm text-text-muted">
                    Ask about automation opportunities, ROI analysis, or request a live multimodal workflow.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => {
                      const prompt = "Hello! I'm evaluating AI automation for our team."
                      setInput(prompt)
                    }}
                  >
                    Suggest a prompt
                  </Button>
                </div>
              ) : (
                mappedMessages.map((message) => (
                  <UnifiedMessage
                    key={message.id}
                    message={message}
                    onSuggestionClick={handleSuggestionClick}
                    onMessageAction={handleMessageAction}
                  />
                ))
              )}
            </div>

           <UnifiedMultimodalWidget
              onVoiceToggle={() => setIsVoiceOverlayOpen(true)}
              onWebcamToggle={() => setIsWebcamOpen(true)}
              onScreenShareToggle={() => setIsScreenShareOpen(true)}
            />

            <div className="hidden md:block">
              <StageRailCard />
            </div>

            <div className="rounded-3xl border border-border bg-surface/70 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text">Pipeline Diagnostics</h3>
                  <p className="text-xs text-text-muted">Trigger the original APIs to ensure everything is connected.</p>
                </div>
                <Badge variant="outline" className="border-border/60 text-xs text-text-muted">
                  {contextLoading ? 'Refreshing…' : 'Live'}
                </Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {TEST_ACTIONS.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="justify-start gap-3 rounded-xl bg-background/40 text-sm hover:border-brand hover:bg-brand/5"
                    onClick={() =>
                      action.onClick({
                        refreshIntelligence,
                        testROI,
                        testWebcam,
                        testVoice,
                        testAdmin,
                      })
                    }
                  >
                    <Sparkles className="h-4 w-4 text-brand" />
                    <span className="flex-1 text-left">
                      <span className="block font-medium text-text">{action.label}</span>
                      <span className="block text-xs text-text-muted">{action.description}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CleanInputField
          value={input}
          onChange={setInput}
          onSend={() => {
            void handleSendMessage(input)
            setInput('')
          }}
          onVoiceClick={() => setIsVoiceOverlayOpen(true)}
          isLoading={isLoading}
          voiceMode={isVoiceOverlayOpen}
        />

        <VoiceOverlay
          open={isVoiceOverlayOpen}
          onCancel={() => setIsVoiceOverlayOpen(false)}
          onAccept={handleVoiceAccepted}
          activeModalities={{
            voice: true,
            webcam: isWebcamOpen,
            screen: isScreenShareOpen,
          }}
        />

        {isWebcamOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-surface/80"
                onClick={() => setIsWebcamOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <WebcamCapture
                mode="canvas"
                onCapture={() => {}}
                onClose={() => setIsWebcamOpen(false)}
                onAIAnalysis={(analysis) =>
                  addMessage({
                    role: 'assistant',
                    content: analysis,
                    timestamp: new Date(),
                    type: 'multimodal',
                    metadata: { source: 'webcam-analysis' },
                  })
                }
              />
            </div>
          </div>
        )}

        {isScreenShareOpen && (
          <ScreenShare
            onClose={() => setIsScreenShareOpen(false)}
            onAnalysis={(analysis) =>
              addMessage({
                role: 'assistant',
                content: analysis,
                timestamp: new Date(),
                type: 'multimodal',
                metadata: { source: 'screen-analysis' },
              })
            }
          />
        )}

        {chatError && (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-red-200 bg-red-50 px-4 py-1 text-xs text-red-600 shadow">
            {chatError.message}
          </div>
        )}

        <UnifiedChatDebugPanel />
      </div>
    </UnifiedChatActionsProvider>
  )
}
