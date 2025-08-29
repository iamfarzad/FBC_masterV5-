"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Send, BookOpen, Layers, Zap, User, MessageCircle, Camera, Monitor, FileText, GraduationCap, Sparkles, Sun, Moon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useChat } from "@/hooks/useChat-ui"
import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence"
import { generateSecureSessionId } from "@/src/core/security/session"
import { useRealtimeChat } from "@/hooks/useRealtimeChat"
import { useCanvas } from "@/components/providers/canvas-provider"
import { useTheme } from "next-themes"
import { CanvasOrchestrator } from "@/components/chat/CanvasOrchestrator"
import { SuggestedActions } from "@/components/intelligence/SuggestedActions"
import { VoiceOverlay } from "@/components/chat/VoiceOverlay"
import { StageRail } from "@/components/collab/StageRail"
import { ConsentOverlay } from "@/components/ui/consent-overlay"

import { PromptInputTextarea } from "@/components/ai-elements/prompt-input"
// AI Elements - Available for future workflow components
// import { Message, MessageAvatar, MessageContent } from '@/components/ai-elements/message'
// import { Response } from '@/components/ai-elements/response'
// import { Loader } from '@/components/ai-elements/loader'
// import { ActivityDisplay } from '@/components/chat/activity/ActivityDisplay'

export default function ChatPage() {
  // Session Management
  const [useRealtimeMode, setUseRealtimeMode] = useState(false)
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
  const [input, setInput] = useState('')
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

      // Add system message when switching tools
      const systemMessage = {
        id: `system-${Date.now()}`,
        content: `Switched to ${tool.label}. ${tool.description}`,
        role: 'assistant' as const,
        timestamp: new Date(),
        type: 'system' as const
      }

      addMessage(systemMessage)

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
    generatePersonalizedGreeting
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

  // Chat Hook
  const {
    messages: chatMessages,
    isLoading,
    error,
    send: sendMessageHook,
    clear: clearMessages,
    addMessage
  } = useChat({
    context: {
      sessionId: sessionId || null,
      leadContext: leadContextData,
      intelligenceContext: context
    }
  })

  // Real-time Chat Hook
  const realtimeChat = useRealtimeChat({
    sessionId: sessionId || 'default-session',
    context: {
      mode: 'unified_chat',
      userType: 'professional_user',
      intelligenceEnabled: true
    },
    onMessage: (message) => {
      if (message.type === 'text' && message.data) {
        // Add real-time messages to chat state
        addMessage({
          role: 'assistant',
          content: message.data,
          timestamp: new Date()
        })
      }
    },
    onComplete: () => {
      console.log('Real-time response completed')
    },
    onError: (error) => {
      console.error('Real-time chat error:', error)
      addMessage({
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error}. The conversation will continue with standard mode.`,
        timestamp: new Date()
      })
      setUseRealtimeMode(false) // Fall back to regular mode
    }
  })

  // Canvas Provider
  const { openCanvas } = useCanvas()

    // Event Handlers
  const handleSendMessage = useCallback(async (content?: string) => {
    const messageContent = content || input.trim()
    if (messageContent && !isLoading && !realtimeChat.isLoading) {
      // Clear input
      setInput('')

      // Add user message to chat
      addMessage({
        role: 'user',
        content: messageContent,
        timestamp: new Date()
      })

      try {
        if (useRealtimeMode) {
          // Use real-time Edge Function
          await realtimeChat.sendMessage(messageContent)
        } else {
          // Use regular chat backend
          await sendMessageHook(messageContent)
        }
        setCurrentStage(prev => Math.min(prev + 1, 7))
      } catch (err) {
        console.error('Failed to send message:', err)
        // Error handling is managed by respective hooks
      }
    }
  }, [input, isLoading, sendMessageHook, useRealtimeMode, realtimeChat, addMessage])

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
    setInput('')
    setCurrentStage(1)
    const newSessionId = generateSecureSessionId()
    setSessionId(newSessionId)
  }, [clearMessages, clearContextCache])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(input)
    }
  }, [handleSendMessage, input])

  const handleVoiceInput = useCallback((transcript: string) => {
    setInput(transcript)
    setShowVoiceOverlay(false)
    // Optionally auto-send the voice input
    // handleSendMessage(transcript)
  }, [])

  return (
    <TooltipProvider>
      <DemoSessionProvider>
        {/* BLUEPRINT-COMPLIANT LAYOUT - Following Inspiration Files */}
        <div className="h-screen w-full flex overflow-hidden bg-background">
          {/* Slim Left Sidebar - Optimized Spacing */}
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

            {/* Main Panel */}
            <main className={`overflow-hidden bg-background ${
              feature === 'chat' ? "h-full" : "h-[calc(100vh-4rem)]"
            }`}>
              {/* Chat Interface Content - Following Blueprint Pattern */}
              <div className="h-full flex">
                {/* Main Chat Area - Takes full width */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-white via-gray-50/50 to-light-silver/30 dark:from-gunmetal dark:via-gunmetal dark:to-gunmetal-lighter">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-modern">
                    <div className="max-w-4xl mx-auto space-y-8">
                      {chatMessages.length === 0 && !isLoading ? (
                        <div className="text-center space-y-8 py-16 animate-smooth-fade-in">
                          <div className="space-y-4">
                            <div className="relative">
                              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-accent to-orange-accent-hover rounded-2xl flex items-center justify-center mb-6 animate-modern-pulse">
                                <Sparkles className="h-8 w-8 text-white" />
                              </div>
                              <div className="absolute -inset-2 bg-orange-accent/20 rounded-3xl blur-xl animate-modern-pulse opacity-50"></div>
                            </div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">What can we build together?</h1>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto">
                              Select a tool to start collaborating or describe your project vision
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {chatMessages.map((message, index) => (
                            <div
                              key={message.id}
                              className="animate-smooth-fade-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              {message.role === 'user' ? (
                                // User message - Original design with modern styling
                                <div className="flex justify-end">
                                  <div className="flex gap-4 max-w-2xl">
                                    <div className="flex flex-col items-end flex-1">
                                      <div className="text-sm text-muted-foreground mb-2 text-right">
                                        You
                                      </div>
                                      <div className="bg-gradient-to-r from-orange-accent to-orange-accent-hover text-white rounded-2xl rounded-tr-md px-6 py-4 max-w-full modern-button shadow-lg shadow-orange-accent/20">
                                        <p className="text-sm leading-relaxed font-medium">
                                          {message.content}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gunmetal to-gunmetal-lighter flex items-center justify-center flex-shrink-0 mt-8 modern-hover shadow-lg">
                                      <User className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // AI message - Original design with modern styling
                                <div className="flex justify-start">
                                  <div className="flex gap-4 max-w-3xl">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-accent to-orange-accent-hover flex items-center justify-center flex-shrink-0 mt-8 modern-hover shadow-lg">
                                      <Zap className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                      <div className="text-sm text-muted-foreground mb-2">
                                        F.B/c AI {message.role === 'system' && <Badge variant="secondary" className="ml-2 text-xs">System</Badge>}
                                      </div>
                                      <div className="bg-white dark:bg-gunmetal-lighter rounded-2xl rounded-tl-md px-6 py-4 modern-card shadow-lg">
                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                          {message.content && message.content.trim() ? (
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gunmetal dark:text-light-silver m-0">
                                              {message.content}
                                            </p>
                                          ) : (
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-orange-accent rounded-full animate-modern-bounce"></div>
                                              <div className="w-2 h-2 bg-orange-accent rounded-full animate-modern-bounce [animation-delay:0.2s]"></div>
                                              <div className="w-2 h-2 bg-orange-accent rounded-full animate-modern-bounce [animation-delay:0.4s]"></div>
                                              <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                                            </div>
                                          )}
                                        </div>
                                        {/* AI Elements ready for workflow components */}
                                        {/* Uncomment to add: <Response>...</Response> */}
                                        {/* <Reasoning>...</Reasoning> */}
                                        {/* <CodeBlock>...</CodeBlock> */}
                                        {/* <Actions>...</Actions> */}
                                        {/* <Suggestions>...</Suggestions> */}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {isLoading && (
                            <div className="animate-smooth-fade-in">
                              <div className="flex justify-start">
                                <div className="flex gap-4 max-w-3xl">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-accent to-orange-accent-hover flex items-center justify-center flex-shrink-0 mt-8 shadow-lg">
                                    <Zap className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    <div className="text-sm text-muted-foreground mb-2">
                                      F.B/c AI
                                    </div>
                                    <div className="bg-white dark:bg-gunmetal-lighter rounded-2xl rounded-tl-md px-6 py-4 modern-card shadow-lg">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-accent rounded-full animate-modern-bounce"></div>
                                        <div className="w-2 h-2 bg-orange-accent rounded-full animate-modern-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-orange-accent rounded-full animate-modern-bounce [animation-delay:0.4s]"></div>
                                      </div>
                                      {/* AI Elements ready for enhanced loading */}
                                      {/* <Loader type="typing" text="AI is thinking..." /> */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                )}
              </div>
            </div>

            {/* Clean Input Area - No Redundant Tools */}
            <div className="border-t border-light-silver-darker dark:border-gunmetal-lighter bg-light-silver/90 dark:bg-gunmetal backdrop-blur-lg p-6">
              <div className="max-w-4xl mx-auto">
                {/* SuggestedActions Component - Connected to Composer Top Slot */}
                <SuggestedActions
                  sessionId={sessionId}
                  stage="BACKGROUND_RESEARCH"
                  mode="static"
                />
                <div className="relative bg-light-silver dark:bg-light-silver border border-light-silver-darker dark:border-light-silver rounded-3xl shadow-lg modern-input-focus overflow-hidden">
                  <PromptInputTextarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    className="px-6 pr-20 py-6 border-none text-base bg-transparent focus:ring-0 focus:outline-none rounded-3xl placeholder:text-muted-foreground text-gunmetal dark:text-gunmetal resize-none"
                                              disabled={isLoading}
                  />

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-10 px-3 text-xs rounded-full modern-button ${
                        useRealtimeMode
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'text-muted-foreground hover:text-orange-accent'
                      }`}
                      onClick={() => setUseRealtimeMode(!useRealtimeMode)}
                      title={useRealtimeMode ? 'Using Real-Time Mode (5x faster)' : 'Switch to Real-Time Mode'}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      {useRealtimeMode ? 'RT' : 'Fast'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-muted-foreground hover:text-orange-accent dark:text-muted-foreground dark:hover:text-orange-accent rounded-full modern-button"
                      onClick={() => setShowVoiceOverlay(true)}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                    {input.trim() && (
                      <Button
                        onClick={() => handleSendMessage(input)}
                        size="sm"
                        className="h-10 w-10 p-0 bg-gradient-to-r from-orange-accent to-orange-accent-hover hover:from-orange-accent-hover hover:to-orange-accent text-white rounded-full modern-button shadow-lg shadow-orange-accent/30"
                                                  disabled={isLoading}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-muted-foreground">
                  F.B-c AI can make mistakes. Please verify important information.
                </p>
              </div>
            </div>
            </div>
          </div>
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

        {/* Voice Overlay */}
        <VoiceOverlay
          open={showVoiceOverlay}
          onCancel={() => setShowVoiceOverlay(false)}
          onAccept={handleVoiceInput}
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
