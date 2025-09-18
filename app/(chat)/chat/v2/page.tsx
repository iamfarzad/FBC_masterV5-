"use client"

import React, { useState, useCallback, useEffect, useMemo, useContext, createContext } from 'react'
import { Sparkles, Brain, X, Zap } from 'lucide-react'

import { StageRailCard } from '@/components/collab/StageRail'
import { UnifiedControlPanel } from './components/UnifiedControlPanel'
import { UnifiedMultimodalWidget } from './components/UnifiedMultimodalWidget'
import { CleanInputField } from './components/input/CleanInputField'
import { VoiceOverlay } from '@/components/chat/VoiceOverlay'
import { ScreenShare } from '@/components/chat/tools/ScreenShare/ScreenShare'
import { WebcamCapture } from '@/components/chat/tools/WebcamCapture/WebcamCapture'
import { UnifiedChatDebugPanel } from '@/components/debug/UnifiedChatDebugPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { AiElementsConversation } from '@/components/chat/AiElementsConversation'

import { useUnifiedChat } from '@/hooks/useUnifiedChat'
import { useSimpleAISDK } from '@/hooks/useSimpleAISDK'
import type { UnifiedChatReturn } from '@/src/core/chat/unified-types'
import type { UnifiedContext } from '@/src/core/chat/unified-types'
import type { ChatStatus } from '@/src/core/chat/state/unified-chat-store'
import { UnifiedChatActionsProvider } from '@/src/core/chat/unified-chat-context'
import { useStage, getStageIdForNumber, getStageNumberForId, syncStageFromIntelligence } from '@/contexts/stage-context'
// Removed mapper import - using native AI SDK types directly
import type { AiChatMessage } from '@/src/core/chat/ai-elements'

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

const TOTAL_CAPABILITIES = 16

type ChatImplementation = 'unified' | 'simple'

const IMPLEMENTATION_STORAGE_KEY = 'chat-implementation'

interface ChatPipelineContextValue {
  controller: UnifiedChatReturn
  status: ChatStatus
}

const ChatPipelineContext = createContext<ChatPipelineContextValue | null>(null)

const deriveStageNumber = (context: any): number => {
  if (!context) return 1
  if (typeof context.stage === 'number') {
    return Math.max(1, Math.min(7, Number(context.stage)))
  }
  if (typeof context.stage === 'string') {
    return getStageNumberForId(context.stage)
  }

  let stage = 1
  if (context.lead?.email) {
    stage = Math.max(stage, 3)
  }
  if (context.company || context.person || context.role) {
    stage = Math.max(stage, 4)
  }
  if (Array.isArray(context.capabilities) && context.capabilities.length > 5) {
    stage = Math.max(stage, 5)
  }
  return stage
}

const deriveExplorationCount = (context: any): number => {
  if (!context) return 0
  if (typeof context.exploredCount === 'number') {
    return context.exploredCount
  }
  if (Array.isArray(context.capabilities)) {
    return context.capabilities.length
  }
  return 0
}

function getControllerStatus(controller: UnifiedChatReturn): ChatStatus {
  if (controller.error) return 'error'
  if (controller.isStreaming) return 'streaming'
  if (controller.isLoading) return 'submitted'
  return 'ready'
}

interface ChatPipelineProviderProps {
  implementation: ChatImplementation
  options: {
    sessionId: string
    mode: 'standard' | 'admin' | string
    context: UnifiedContext
  }
  children: React.ReactNode
}

function UnifiedPipelineProvider({ options, children }: Omit<ChatPipelineProviderProps, 'implementation'>) {
  const controller = useUnifiedChat(options)
  const status = getControllerStatus(controller)
  const value = useMemo<ChatPipelineContextValue>(() => ({ controller, status }), [controller, status])
  return <ChatPipelineContext.Provider value={value}>{children}</ChatPipelineContext.Provider>
}

function SimplePipelineProvider({ options, children }: Omit<ChatPipelineProviderProps, 'implementation'>) {
  const controller = useSimpleAISDK(options)
  const status = getControllerStatus(controller)
  const value = useMemo<ChatPipelineContextValue>(() => ({ controller, status }), [controller, status])
  return <ChatPipelineContext.Provider value={value}>{children}</ChatPipelineContext.Provider>
}

function ChatPipelineProvider({ implementation, options, children }: ChatPipelineProviderProps) {
  if (implementation === 'simple') {
    return <SimplePipelineProvider options={options}>{children}</SimplePipelineProvider>
  }
  return <UnifiedPipelineProvider options={options}>{children}</UnifiedPipelineProvider>
}

function useChatPipeline(): ChatPipelineContextValue {
  const ctx = useContext(ChatPipelineContext)
  if (!ctx) {
    throw new Error('useChatPipeline must be used inside ChatPipelineProvider')
  }
  return ctx
}

export default function ChatV2() {
  const [input, setInput] = useState('')
  const [sessionId] = useState(() => crypto.randomUUID())
  const [intelligenceContext, setIntelligenceContext] = useState<any>(null)
  const [contextLoading, setContextLoading] = useState(false)

  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false)
  const [isWebcamOpen, setIsWebcamOpen] = useState(false)
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false)

  const [implementation, setImplementation] = useState<ChatImplementation>('unified')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(IMPLEMENTATION_STORAGE_KEY)
    if (stored === 'simple' || stored === 'unified') {
      setImplementation(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(IMPLEMENTATION_STORAGE_KEY, implementation)
  }, [implementation])

  const chatContext = useMemo<UnifiedContext>(() => ({
    sessionId,
    intelligenceContext: intelligenceContext || undefined,
  }), [sessionId, intelligenceContext])

  const stageCtx = useStage()
  const stageProgress = useMemo(() => ({
    current: stageCtx.currentStageIndex + 1,
    total: stageCtx.stages.length,
    percentage: stageCtx.getProgressPercentage(),
  }), [stageCtx])

  return (
    <ChatPipelineProvider
      implementation={implementation}
      options={{
        sessionId,
        mode: 'standard' as const,
        context: chatContext,
      }}
    >
      <ChatPageContent
        input={input}
        setInput={setInput}
        implementation={implementation}
        onImplementationChange={setImplementation}
        intelligenceContext={intelligenceContext}
        setIntelligenceContext={setIntelligenceContext}
        contextLoading={contextLoading}
        setContextLoading={setContextLoading}
        sessionId={sessionId}
        stageCtx={stageCtx}
        stageProgress={stageProgress}
        totalCapabilities={TOTAL_CAPABILITIES}
        isVoiceOverlayOpen={isVoiceOverlayOpen}
        setIsVoiceOverlayOpen={setIsVoiceOverlayOpen}
        isWebcamOpen={isWebcamOpen}
        setIsWebcamOpen={setIsWebcamOpen}
        isScreenShareOpen={isScreenShareOpen}
        setIsScreenShareOpen={setIsScreenShareOpen}
      />
    </ChatPipelineProvider>
  )
}

interface ChatPageContentProps {
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  implementation: ChatImplementation
  onImplementationChange: (impl: ChatImplementation) => void
  intelligenceContext: any
  setIntelligenceContext: React.Dispatch<React.SetStateAction<any>>
  contextLoading: boolean
  setContextLoading: React.Dispatch<React.SetStateAction<boolean>>
  sessionId: string
  stageCtx: ReturnType<typeof useStage>
  stageProgress: {
    current: number
    total: number
    percentage: number
  }
  totalCapabilities: number
  isVoiceOverlayOpen: boolean
  setIsVoiceOverlayOpen: React.Dispatch<React.SetStateAction<boolean>>
  isWebcamOpen: boolean
  setIsWebcamOpen: React.Dispatch<React.SetStateAction<boolean>>
  isScreenShareOpen: boolean
  setIsScreenShareOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function ChatPageContent({
  input,
  setInput,
  implementation,
  onImplementationChange,
  intelligenceContext,
  setIntelligenceContext,
  contextLoading,
  setContextLoading,
  sessionId,
  stageCtx,
  stageProgress,
  totalCapabilities,
  isVoiceOverlayOpen,
  setIsVoiceOverlayOpen,
  isWebcamOpen,
  setIsWebcamOpen,
  isScreenShareOpen,
  setIsScreenShareOpen,
}: ChatPageContentProps) {
  const { controller, status } = useChatPipeline()
  const {
    messages,
    isStreaming: controllerStreaming,
    isLoading: controllerLoading,
    error: controllerError,
    sendMessage,
    addMessage,
    updateContext,
  } = controller

  const chatError = controllerError
  const isStreaming = status === 'streaming' || controllerStreaming
  const isSubmitting = status === 'submitted'
  const isLoading = isStreaming || isSubmitting || controllerLoading

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

  const systemState = useMemo(() => ({
    currentStage: stageCtx.stages[stageCtx.currentStageIndex] ?? null,
    stageProgress,
    capabilityUsage: {
      used: intelligenceContext?.capabilities?.length ?? 0,
      total: totalCapabilities,
    },
    activeCapabilities: intelligenceContext?.capabilities ?? [],
    allCapabilities: intelligenceContext?.capabilities ?? [],
    allStages: stageCtx.stages,
    intelligenceScore: stageProgress.percentage,
  }), [
    intelligenceContext,
    stageCtx.stages,
    stageCtx.currentStageIndex,
    stageProgress,
    totalCapabilities,
  ])

  const conversationState = useMemo(() => ({
    leadScore: intelligenceContext?.leadScore ?? 65,
    stage: stageCtx.stages[stageCtx.currentStageIndex]?.label ?? 'Discovery',
    showActions: true,
  }), [intelligenceContext, stageCtx.stages, stageCtx.currentStageIndex])

  const activeTools = useMemo(() => {
    const tools: string[] = []
    if (isVoiceOverlayOpen) tools.push('voice')
    if (isWebcamOpen) tools.push('webcam')
    if (isScreenShareOpen) tools.push('screen')
    return tools
  }, [isVoiceOverlayOpen, isWebcamOpen, isScreenShareOpen])

  const conversationEmptyState = (
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
  )

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
  }, [setInput])

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
  }, [sessionId, setContextLoading, setIntelligenceContext])

  useEffect(() => {
    void refreshIntelligence()
  }, [refreshIntelligence])

  useEffect(() => {
    if (intelligenceContext) {
      updateContext({ intelligenceContext })
      const nextStageNumber = deriveStageNumber(intelligenceContext)
      const explored = deriveExplorationCount(intelligenceContext)
      syncStageFromIntelligence({
        stageId: getStageIdForNumber(nextStageNumber),
        exploredCount: explored,
        total: totalCapabilities,
        completedStageIds: Array.from({ length: Math.max(0, nextStageNumber - 1) }, (_, index) => getStageIdForNumber(index + 1)),
      })
    }
  }, [intelligenceContext, updateContext, totalCapabilities])

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
  }, [addMessage, setIsScreenShareOpen, setIsVoiceOverlayOpen, setIsWebcamOpen])

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

  const handleDocumentUpload = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: '📄 Document uploads will return after the AI SDK rollout. Please send files to contact@farzadbayat.com for now.',
      timestamp: new Date(),
      type: 'text',
      metadata: { source: 'document', info: true },
    })
  }, [addMessage])

  const handleImageUpload = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: '🖼️ Image analysis is being reconnected to the new store. Hang tight while we finish the migration.',
      timestamp: new Date(),
      type: 'text',
      metadata: { source: 'image', info: true },
    })
  }, [addMessage])

  const handleVoiceAccepted = useCallback((transcript: string) => {
    setIsVoiceOverlayOpen(false)
    void handleSendMessage(transcript)
  }, [handleSendMessage, setIsVoiceOverlayOpen])

  return (
    <UnifiedChatActionsProvider
      value={{
        addMessage,
        sendMessage: handleSendMessage,
        updateContext,
      }}
    >
      <div className="relative h-screen bg-background flex flex-col">
        <UnifiedControlPanel
          systemState={systemState}
          conversationState={conversationState}
          activeTools={activeTools}
          onToolSelect={handleToolSelect}
          onGeneratePDF={handleGeneratePDF}
          onShowSettings={handleShowSettings}
          onShowBooking={handleShowBooking}
        />

        <div className="flex-1 overflow-hidden">
          <div className="mx-auto flex w-full max-w-6xl h-full flex-col gap-10 px-6 pt-16 md:flex-row md:gap-16">
            <div className="w-full flex-1 flex flex-col md:pl-20">
              <div className="space-y-3 mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-brand/40 bg-brand/5 text-brand">
                    <Sparkles className="mr-2 h-3 w-3" /> F.B/c AI Assistant
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      className={`h-8 rounded-full border border-border/60 px-3 text-xs ${implementation === 'unified' ? 'bg-brand/10 text-brand' : 'bg-background/80 text-text-muted'}`}
                      onClick={() => onImplementationChange('unified')}
                    >
                      <Zap className="mr-1 h-3.5 w-3.5" /> Tools Mode
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      className={`h-8 rounded-full border border-border/60 px-3 text-xs ${implementation === 'simple' ? 'bg-brand/10 text-brand' : 'bg-background/80 text-text-muted'}`}
                      onClick={() => onImplementationChange('simple')}
                    >
                      <Sparkles className="mr-1 h-3.5 w-3.5" /> Simple Mode
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-lg font-semibold text-text">
                  <Brain className="h-5 w-5 text-brand" />
                  Business Intelligence Session
                </div>
                <p className="text-sm text-text-muted">
                  Guided consultation powered by Gemini 2.5 — tracking discovery stages, multimodal tools, and ROI validation.
                </p>
              </div>

            {/* Scrollable conversation area */}
            <div className="flex-1 min-h-0 mb-8">
              <AiElementsConversation
                messages={aiMessages}
                onSuggestionClick={handleSuggestionClick}
                onMessageAction={(action, id) => handleMessageAction(action, id)}
                emptyState={conversationEmptyState}
              />
            </div>
            <div className="space-y-8">
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
          onWebcamClick={() => setIsWebcamOpen(true)}
          onScreenShareClick={() => setIsScreenShareOpen(true)}
          onDocumentUpload={handleDocumentUpload}
          onImageUpload={handleImageUpload}
          onROI={testROI}
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
