"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Send, BookOpen, Layers, Zap, User, MessageCircle, Camera, Monitor, FileText, GraduationCap, Sun, Moon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUnifiedChat } from "@/hooks/useUnifiedChat"
import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence"
import { generateSecureSessionId } from "@/src/core/security/session"
import { useCanvas } from "@/components/providers/canvas-provider"
import { useTheme } from "next-themes"
import { CanvasOrchestrator } from "@/components/chat/CanvasOrchestrator"
import { SuggestedActions } from "@/components/intelligence/SuggestedActions"
import { VoiceOverlay } from "@/components/chat/VoiceOverlay"
import { StageRail } from "@/components/collab/StageRail"
import { ConsentOverlay } from "@/components/ui/consent-overlay"

import { UnifiedChatInterface } from "@/components/chat/unified/UnifiedChatInterface"

export default function ChatPage() {
  // Session Management
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const existingId = window.localStorage.getItem('intelligence-session-id')
      if (existingId) {
        return existingId
      }
      // 🔒 Generate cryptographically secure session ID (256-bit random)
      const newId = generateSecureSessionId()
      window.localStorage.setItem('intelligence-session-id', newId)
      return newId
    }
    return null
  })

  // Component State - Following Blueprint Pattern
  const [feature, setFeature] = useState<'chat' | 'webcam' | 'screen' | 'document' | 'video' | 'workshop'>('chat')

  const [showCanvasOverlay, setShowCanvasOverlay] = useState(false)
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false)
  const [showConsentOverlay, setShowConsentOverlay] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)

  const [showProgressRail, setShowProgressRail] = useState(false)
  const { theme, setTheme } = useTheme()
  const [activities, setActivities] = useState<any[]>([])
  const [currentStage, setCurrentStage] = useState(1)

  // Messages are now managed by useChat hook

  // Persist session ID
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionId) {
      window.localStorage.setItem('intelligence-session-id', sessionId)
    }
  }, [sessionId])

  // Check for existing consent on mount
  useEffect(() => {
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/consent')
        const data = await response.json()
        if (data.allow) {
          setHasConsent(true)
        } else {
          setShowConsentOverlay(true)
        }
      } catch (error) {
        console.error('Failed to check consent:', error)
        setShowConsentOverlay(true)
      }
    }

    if (typeof window !== 'undefined') {
      checkConsent()
    }
  }, [])

  // Handle consent submission
  const handleConsentSubmit = async (data: { name: string; email: string; companyUrl: string }) => {
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          companyUrl: data.companyUrl,
          name: data.name,
        }),
      })

      if (response.ok) {
        setHasConsent(true)
        setShowConsentOverlay(false)
      } else {
        console.error('Failed to submit consent')
      }
    } catch (error) {
      console.error('Error submitting consent:', error)
    }
  }

  // Tool Items - Following Blueprint Pattern
  const toolItems = [
    {
      id: 'demo' as const,
      icon: Zap,
      label: 'Real-Time Demo',
      shortcut: 'D',
      description: 'Experience enterprise-grade AI with Edge Function performance',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'webcam' as const,
      icon: Camera,
      label: 'Webcam Capture',
      shortcut: 'W',
      description: 'Record videos and capture high-quality photos',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'screen' as const,
      icon: Monitor,
      label: 'Screen Share',
      shortcut: 'S',
      description: 'Share your screen with AI-powered analysis',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'document' as const,
      icon: FileText,
      label: 'ROI Calculator',
      shortcut: 'P',
      description: 'Calculate detailed investment returns',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'video' as const,
      icon: BookOpen,
      label: 'Video to App',
      shortcut: 'V',
      description: 'Convert videos to applications',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'workshop' as const,
      icon: GraduationCap,
      label: 'Workshop',
      shortcut: 'L',
      description: 'Educational resources and learning paths',
      gradient: 'from-pink-500 to-pink-600'
    }
  ]

  // Activity Management - Following Blueprint Pattern
  const addActivity = (activity: Omit<any, 'id' | 'timestamp'>) => {
    const newActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }
    setActivities(prev => [...prev, newActivity])
    return newActivity.id
  }

  const updateActivity = (id: string, updates: Partial<any>) => {
    setActivities(prev => prev.map(activity =>
      activity.id === id ? { ...activity, ...updates } : activity
    ))
  }

  // Tool Selection Handler - Following Blueprint Pattern
  const handleToolSelect = (toolId: typeof feature) => {
    const tool = toolItems.find(t => t.id === toolId)
    if (!tool) return

    // Add tool activation activity
    const toolActivityId = addActivity({
      type: 'tool_used',
      title: `Activating ${tool.label}`,
      description: tool.description,
      status: 'in_progress',
      progress: 0
    })

    // Simulate tool loading
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 25
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
        updateActivity(toolActivityId, { status: 'completed', progress: 100 })
      } else {
        updateActivity(toolActivityId, { progress })
      }
    }, 150)

    setFeature(toolId)
    if (toolId !== 'chat') {
      setShowProgressRail(true)

      // Trigger the appropriate tool action to open canvas/modal
      handleToolAction(toolId)
    }
  }





  // Conversational Intelligence Context
  const {
    context,
    isLoading: contextLoading,
    fetchContextFromLocalSession,
    clearContextCache,
    generatePersonalizedGreeting,
    sendRealtimeVoice
  } = useConversationalIntelligence()

  // Lead Context Data
  const leadContextData = useMemo(() => {
    if (!context) return undefined
    return {
      name: context?.person?.fullName || context?.lead?.name,
      email: context?.lead?.email,
      company: context?.company?.name,
      role: context?.role,
      industry: context?.company?.industry,
    }
  }, [context])

  // Unified Chat Hook - Single source for all chat functionality
  const {
    messages: chatMessages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    updateContext,
    addMessage
  } = useUnifiedChat({
    sessionId: sessionId || 'default-session',
    mode: 'standard', // Unified system - single optimized mode
    context: {
      sessionId: sessionId || 'default-session',
      leadContext: leadContextData,
      intelligenceContext: context
    },
    onMessage: (message) => {
      // Handle message updates
      console.log('Unified chat message:', message)
    },
    onComplete: () => {
      console.log('Unified chat response completed')
    },
    onError: (error) => {
      console.error('Unified chat error:', error)
      // Error handling is now built into the unified hook
    }
  })

  // Canvas Provider
  const { openCanvas } = useCanvas()

    // Event Handlers
  const handleSendMessage = useCallback(async (content: string) => {
    if (content.trim()) {
      try {
        // Use unified chat system - single source for all modes
        await sendMessage(content.trim())
        setCurrentStage(prev => Math.min(prev + 1, 7))
      } catch (err) {
        console.error('Failed to send message:', err)
        // Error handling is now managed by unified hook
      }
    }
  }, [sendMessage])

  const handleToolAction = useCallback((tool: string) => {
    console.log('Tool action:', tool)
    switch(tool) {
      case 'menu':
        // Tool canvas functionality can be implemented later
        console.log('Menu tool selected')
        break
      case 'demo':
        // Redirect to real-time demo page
        window.location.href = '/demo'
        break
      case 'webcam':
        openCanvas('webcam')
        break
      case 'screen':
        openCanvas('screen')
        break
      case 'document':
        openCanvas('pdf')
        break
      case 'video':
        // Redirect to dedicated workshop page for video-to-app
        window.location.href = '/workshop/video-to-app'
        break
      case 'roi':
        openCanvas('roi')
        break
      case 'code':
        openCanvas('code')
        break
      case 'workshop':
        // Redirect to workshop index or specific workshop page
        window.location.href = '/workshop'
        break
      case 'suggested':
        console.log('Suggested action triggered')
        break
      case 'book-call':
        console.log('Book call triggered')
        break
      case 'summary':
        console.log('Download summary triggered')
        break
      case 'voice':
        console.log('Voice input triggered')
        break
      case 'settings':
        console.log('Settings triggered')
        break
      default:
        console.log('Unknown tool action:', tool)
    }
  }, [openCanvas])

  const handleClearMessages = useCallback(() => {
    clearMessages()
    clearContextCache()
    setCurrentStage(1)
    const newSessionId = generateSecureSessionId()
    setSessionId(newSessionId)
  }, [clearMessages, clearContextCache])





  return (
    <TooltipProvider>
      <DemoSessionProvider>
        {/* MODERN BLUEPRINT-COMPLIANT LAYOUT - Following Inspiration Files */}
        <div className="h-screen w-full flex overflow-hidden bg-background">
          {/* Slim Left Sidebar - Modern Design with Gradients */}
          <div className="w-16 bg-gunmetal border-r border-gunmetal-lighter flex flex-col py-4 relative">
            {/* Logo/Brand with glow effect */}
            <div className="px-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-accent to-orange-accent-hover rounded-xl flex items-center justify-center modern-hover shadow-lg">
                  <span className="text-white text-base font-bold">C</span>
                </div>
                <div className="absolute inset-0 bg-orange-accent/20 rounded-xl blur-md -z-10 animate-modern-pulse"></div>
              </div>
            </div>

            {/* Navigation - Tighter Spacing */}
            <nav className="flex flex-col gap-1 px-2 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={feature === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  className={`w-12 h-12 p-0 rounded-xl modern-button transition-all duration-300 relative ${
                    feature === 'chat'
                      ? 'bg-gradient-to-br from-orange-accent to-orange-accent-hover text-white shadow-lg shadow-orange-accent/30'
                      : 'text-light-silver hover:text-white hover:bg-gunmetal-lighter'
                  }`}
                  onClick={() => {
                    setFeature('chat');
                    setShowProgressRail(false);
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  {feature === 'chat' && (
                    <div className="absolute inset-0 bg-orange-accent/20 rounded-xl blur-lg -z-10"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Chat</span>
                  <kbd className="px-2 py-1 text-xs bg-light-silver-darker dark:bg-gunmetal rounded font-mono">C</kbd>
                </div>
              </TooltipContent>
            </Tooltip>

            {toolItems.map((tool) => {
              const Icon = tool.icon;
              const isActive = feature === tool.id;
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={`w-12 h-12 p-0 rounded-xl modern-button transition-all duration-300 relative ${
                        isActive
                          ? 'bg-gradient-to-br from-orange-accent to-orange-accent-hover text-white shadow-lg shadow-orange-accent/30'
                          : 'text-light-silver hover:text-white hover:bg-gunmetal-lighter'
                      }`}
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <div className="absolute inset-0 bg-orange-accent/20 rounded-xl blur-lg -z-10"></div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex items-center gap-2">
                      <span>{tool.label}</span>
                      <kbd className="px-2 py-1 text-xs bg-light-silver-darker dark:bg-gunmetal rounded font-mono">
                        {tool.shortcut}
                      </kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Settings - Tighter Spacing */}
          <div className="px-2 space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 text-light-silver hover:text-white hover:bg-gunmetal-lighter rounded-xl modern-button"
                  onClick={() => setShowCanvasOverlay(!showCanvasOverlay)}
                >
                  <Layers className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Canvas Overlay</span>
                  <kbd className="px-2 py-1 text-xs bg-light-silver-darker dark:bg-gunmetal rounded font-mono">Ctrl+O</kbd>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0 text-light-silver hover:text-white hover:bg-gunmetal-lighter rounded-xl modern-button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Toggle Theme</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 bg-background">
            {/* Enhanced Header for Tools */}
            {feature !== 'chat' && (
              <header className="h-16 border-b border-light-silver-darker dark:border-gunmetal-lighter flex items-center justify-between px-8 bg-white/95 dark:bg-gunmetal/95 backdrop-blur-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-accent to-orange-accent-hover flex items-center justify-center shadow-md">
                    {React.createElement(toolItems.find(t => t.id === feature)?.icon || MessageCircle, {
                      className: "h-4 w-4 text-white"
                    })}
                  </div>
                  <h1 className="text-xl font-semibold text-gunmetal dark:text-light-silver">
                    {toolItems.find(t => t.id === feature)?.label || feature}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-500/10 text-green-600 border-green-500/20 animate-modern-pulse"
                  >
                    ● Active
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-light-silver-darker dark:border-gunmetal-lighter text-gunmetal dark:text-light-silver hover:bg-orange-accent hover:text-white hover:border-orange-accent modern-button"
                  onClick={() => {
                    setFeature('chat');
                    setShowProgressRail(false);
                  }}
                >
                  Back to Chat
                </Button>
              </header>
            )}

            {/* Main Panel - Now using UnifiedChatInterface */}
            <main className={`overflow-hidden bg-background ${
              feature === 'chat' ? "h-full" : "h-[calc(100vh-4rem)]"
            }`}>
              <UnifiedChatInterface
                messages={chatMessages}
                isLoading={isLoading}
                sessionId={sessionId}
                mode="full"
                onSendMessage={handleSendMessage}
                onClearMessages={handleClearMessages}
                onToolAction={handleToolAction}
                stickyHeaderSlot={
                <SuggestedActions
                  sessionId={sessionId}
                  stage="BACKGROUND_RESEARCH"
                  mode="static"
                />
                }
                composerTopSlot={
                  <div className="text-center mb-4">
                <p className="text-xs text-muted-foreground">
                  F.B-c AI can make mistakes. Please verify important information.
                </p>
              </div>
                }
              />
            </main>

          {/* Progress Rail - Original Design */}
          {showProgressRail && (
            <div className="w-24 border-l border-light-silver-darker dark:border-gunmetal-lighter bg-white/50 dark:bg-gunmetal/50 backdrop-blur-lg animate-smooth-slide-in">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-4">Progress</h3>
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="mb-3 p-2 bg-white/50 dark:bg-gunmetal-lighter/50 rounded-lg">
                    <div className="text-xs font-medium">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">{activity.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Minimal Floating Activity Chain - Original Design */}
        {activities.length > 0 && (
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30">
            <div className="bg-white/90 dark:bg-gunmetal/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-light-silver-darker dark:border-gunmetal-lighter">
              <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
              {activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="mb-2 last:mb-0">
                  <div className="text-xs font-medium">{activity.title}</div>
                  <div className="text-xs text-muted-foreground">{activity.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Orchestrator */}
        <CanvasOrchestrator />

        {/* Fixed Position Stage Indicator */}
        {sessionId && <StageRail sessionId={sessionId} />}

        {/* Voice Overlay - Now handled by UnifiedChatInterface */}
        <VoiceOverlay
          open={showVoiceOverlay}
          onCancel={() => setShowVoiceOverlay(false)}
          onAccept={(transcript, audioData, duration) => {
            // UnifiedChatInterface handles voice input internally
            handleToolAction('voice')
            setShowVoiceOverlay(false)
          }}
          sessionId={sessionId}
        />

        {/* Consent Overlay */}
        <ConsentOverlay
          isVisible={showConsentOverlay}
          onSubmit={handleConsentSubmit}
        />
        </div>
      </div>
      </DemoSessionProvider>
    </TooltipProvider>
  )
}
