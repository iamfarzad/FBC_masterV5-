"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import { StageProvider } from "@/contexts/stage-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Send, BookOpen, Layers, Zap, User, MessageCircle, Camera, Monitor, FileText, GraduationCap, Sun, Moon, Sparkles, Plus, Paperclip } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUnifiedChat } from "@/hooks/useUnifiedChat"
// import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence" // DEPRECATED - now uses unified chat internally
import { generateSecureSessionId } from "@/src/core/security/session"
import { useCanvas } from "@/components/providers/canvas-provider"
import { useTheme } from "next-themes"
import { CanvasOrchestrator } from "@/components/chat/CanvasOrchestrator"
import { SuggestedActions } from "@/components/intelligence/SuggestedActions"
import { VoiceOverlay } from "@/components/chat/VoiceOverlay"
import { StageRail } from "@/components/collab/StageRail"
import { ConsentOverlay } from "@/components/ui/consent-overlay"

import { PromptInputTextarea } from "@/components/ai-elements/prompt-input"
import { Response } from "@/components/ai-elements/response"
import { InlineROICalculator } from "@/components/chat/tools/InlineROICalculator"
import { useMeeting } from "@/components/providers/meeting-provider"
import { omitUndefined } from '@/src/core/utils/optional'

// 🎯 AI RESPONSE PROCESSOR - Convert button HTML to React buttons
function renderAIResponse(content: string) {
  if (!content || !content.includes('<button')) {
    // No buttons - render normally
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <Response parseIncompleteMarkdown={false}>{content}</Response>
      </div>
    )
  }

  // Has buttons - parse and render with actual Button components
  const parts = content.split(/(<button[^>]*data-coach-cta[^>]*>.*?<\/button>)/g)
  
  return (
    <div className="prose prose-sm max-w-none space-y-3 dark:prose-invert">
      {parts.map((part, index) => {
        // Check if this part is a button
        const buttonMatch = part.match(/<button[^>]*data-tool="([^"]*)"[^>]*(?:data-query="([^"]*)")?[^>]*>(.*?)<\/button>/)
        
        if (buttonMatch) {
          const [, tool, query, buttonText] = buttonMatch
          return (
            <div key={`btn-wrapper-${index}`} className="not-prose">
              <Button
                size="sm"
                variant="outline"
                className="border-accent/30 hover:bg-accent/10 text-accent hover:border-accent"
                data-coach-cta="true"
                data-tool={tool}
                data-query={query || ''}
              >
                {buttonText}
              </Button>
            </div>
          )
        }
        
        // Regular text content
        if (part.trim()) {
          return (
            <Response key={`text-${index}`} parseIncompleteMarkdown={false}>
              {part}
            </Response>
          )
        }
        
        return null
      }).filter(Boolean)}
    </div>
  )
}

export default function ChatPage() {
  // 🔧 MASTER FLOW: Session Management with Intelligence Integration
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
  const [showInlineROI, setShowInlineROI] = useState(false)
  const [showProgressRail, setShowProgressRail] = useState(false)

  const { theme, setTheme } = useTheme()

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

  // 🔧 MASTER FLOW: Intelligence Context Integration
  const [intelligenceContext, setIntelligenceContext] = useState<any>(null)
  const [contextLoading, setContextLoading] = useState(false)

  const refreshIntelligenceContext = useCallback(async () => {
    if (!sessionId || sessionId === 'anonymous') return
    
    setContextLoading(true)
    try {
      const response = await fetch(`/api/intelligence/context?sessionId=${encodeURIComponent(sessionId)}`, { 
        cache: 'no-store',
        headers: {
          'x-intelligence-session-id': sessionId
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const context = data.ok ? (data.output || data) : null
        setIntelligenceContext(context)
        if (context) {
          console.log('🧠 Intelligence context loaded:', {
            hasLead: !!context.lead,
            hasCompany: !!context.company,
            hasPerson: !!context.person,
            role: context.role,
            confidence: context.roleConfidence
          })
        } else {
          console.log('⚠️ No intelligence context available')
        }
      } else {
        console.warn('⚠️ Intelligence context fetch failed:', response.status)
      }
    } catch (error) {
      console.warn('Failed to fetch intelligence context:', error)
    } finally {
      setContextLoading(false)
    }
  }, [sessionId])

  const clearContextCache = useCallback(() => {
    setIntelligenceContext(null)
  }, [])

  // Fetch intelligence context when session is available
  useEffect(() => {
    if (sessionId && sessionId !== 'anonymous') {
      refreshIntelligenceContext()
    }
  }, [sessionId, refreshIntelligenceContext])

  // 🔧 MASTER FLOW: Handle consent submission with intelligence trigger
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
          sessionId: sessionId // Pass sessionId to trigger intelligence
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setHasConsent(true)
        setShowConsentOverlay(false)

        // If intelligence was initialized, refresh context immediately
        if (result.intelligenceReady) {
          console.log('🚀 Intelligence ready, refreshing context...')
          setTimeout(() => refreshIntelligenceContext(), 1000) // Small delay for processing
        }

        // Add personalized welcome message
        const welcomeMessage = `Hi ${data.name}, welcome to F.B/c! I'm analyzing your background to provide personalized assistance. How can I help you today?`

        // Add welcome message to chat
        addMessage({
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
          type: 'text'
        })

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

  // Removed redundant activity management - using ai-elements instead

  // Tool Selection Handler - Simplified without custom activity tracking
  const handleToolSelect = (toolId: typeof feature) => {
    const tool = toolItems.find(t => t.id === toolId)
    if (!tool) return

    setFeature(toolId)
    
    // Trigger the appropriate tool action to open canvas/modal
    if (toolId !== 'chat') {
      handleToolAction(toolId)
    }
  }





  // 🔧 MASTER FLOW: Lead Context Data from Intelligence
  const leadContextData = useMemo(() => {
    if (!intelligenceContext) return undefined
    return {
      name: intelligenceContext?.person?.fullName || intelligenceContext?.lead?.name,
      email: intelligenceContext?.lead?.email,
      company: intelligenceContext?.company?.name,
      role: intelligenceContext?.role,
      industry: intelligenceContext?.company?.industry,
    }
  }, [intelligenceContext])

  // Chat Hook - Using unified chat hook with intelligence context
  const unifiedContext = useMemo(() => {
    const ctx: any = {};
    if (leadContextData) ctx.leadContext = leadContextData;
    if (intelligenceContext) ctx.intelligenceContext = intelligenceContext; // Pass full intelligence context
    if (sessionId) ctx.sessionId = sessionId; // Always pass sessionId
    return Object.keys(ctx).length ? ctx : undefined;
  }, [leadContextData, intelligenceContext, sessionId]);

  const chat = useUnifiedChat({
    sessionId: sessionId || 'anonymous',
    mode: 'standard',
    ...(unifiedContext ? { context: unifiedContext } : {})
  });

  const {
    messages: chatMessages,
    isLoading,
    // error, // Removed as unused
    sendMessage,
    clearMessages,
    addMessage
  } = chat

  // Canvas Provider
  const { openCanvas } = useCanvas()
  
  // Meeting Provider
  const meeting = useMeeting()

    // Event Handlers
  const handleSendMessage = useCallback(async (content?: string) => {
    const messageContent = content || input.trim()
    if (messageContent && !isLoading) {
      // Clear input - loading state is managed by useChat hook
      setInput('')

      try {
        // Send message via real backend
        await sendMessage(messageContent)
      } catch (err) {
        console.error('Failed to send message:', err)
        // Error is handled by useChat hook
      }
    }
  }, [input, isLoading, sendMessage])

  const handleToolAction = useCallback((tool: string) => {
    console.log('Tool action:', tool)
    switch(tool) {
      case 'menu':
        // Tool canvas functionality can be implemented later
        console.log('Menu tool selected')
        break
      case 'webcam':
        openCanvas('webcam')
        break
      case 'screen':
        openCanvas('screen')
        break

      case 'video':
        // Redirect to dedicated workshop page for video-to-app
        window.location.href = '/workshop/video-to-app'
        break
      case 'roi':
        openCanvas('roi')
        break
      case 'roi-inline':
        setShowInlineROI(true)
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
        meeting.open({
          username: 'farzad-bayat',
          event: '30min',
          title: 'Schedule Your AI Consultation',
          description: 'Book a free consultation to discuss your AI automation needs'
        })
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
  }, [openCanvas, meeting]) // Added 'meeting' to dependency array

  // 🎯 AI TOOL BUTTON HANDLER - Connect AI responses to actual tool launching
  // MUST be placed AFTER handleToolAction is defined
  useEffect(() => {
    const handleCoachCTA = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.hasAttribute('data-coach-cta') && target.hasAttribute('data-tool')) {
        const tool = target.getAttribute('data-tool')
        const query = target.getAttribute('data-query')
        
        console.log('🤖 AI triggered tool:', tool)
        
        // Map AI tool requests to actual tool actions
        switch (tool) {
          case 'roi':
            handleToolAction('roi') // Opens ROI calculator canvas
            break
          case 'roi-inline':
            setShowInlineROI(true) // Shows inline ROI calculator
            break
          case 'webcam':
            handleToolAction('webcam') // Opens webcam capture
            break
          case 'voice':
            setShowVoiceOverlay(true) // Starts voice chat
            break
          case 'screen':
            handleToolAction('screen') // Opens screen share
            break
          case 'search':
            if (query) {
              setInput(query)
              void handleSendMessage(query) // Triggers web search
            }
            break
          case 'book-call':
            meeting.open({
              username: 'farzad-bayat',
              event: '30min',
              title: 'Schedule Your AI Consultation',
              description: 'Book a free consultation to discuss your AI automation needs'
            })
            break
          case 'video':
            handleToolAction('video') // Opens video-to-app
            break
          case 'document':
            handleToolAction('document') // Opens document analysis
            break
          default:
            console.log('⚠️ Unknown AI tool request:', tool)
        }
      }
    }

    // Global click listener for AI-embedded tool buttons
    document.addEventListener('click', handleCoachCTA)
    return () => document.removeEventListener('click', handleCoachCTA)
  }, [handleToolAction, handleSendMessage, meeting]) // Added 'meeting' to dependency array

  // const handleClearMessages = useCallback(() => {
  //   clearMessages()
  //   clearContextCache()
  //   setInput('')
  //   const newSessionId = generateSecureSessionId()
  //   setSessionId(newSessionId)
  // }, [clearMessages, clearContextCache])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage(input)
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
      <StageProvider>
        <DemoSessionProvider>
        {/* MODERN BLUEPRINT-COMPLIANT LAYOUT - Following Inspiration Files */}
        <div className="flex h-screen w-full overflow-hidden bg-background">
          {/* Slim Left Sidebar - Modern Design with Gradients */}
          <div className="relative flex w-16 flex-col border-r border-gunmetal-lighter bg-gunmetal py-4">
            {/* Logo/Brand with glow effect */}
            <div className="mb-6 px-3">
              <div className="relative">
                <div className="modern-hover flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-accent to-orange-accent-hover shadow-lg">
                  <span className="text-base font-bold text-white">C</span>
                </div>
                <div className="absolute inset-0 -z-10 animate-modern-pulse rounded-xl bg-orange-accent/20 blur-md"></div>
              </div>
            </div>

            {/* Navigation - Tighter Spacing */}
            <nav className="flex flex-1 flex-col gap-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={feature === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  className={`modern-button relative size-12 rounded-xl p-0 transition-all duration-300 ${
                    feature === 'chat'
                      ? 'bg-gradient-to-br from-orange-accent to-orange-accent-hover text-white shadow-lg shadow-orange-accent/30'
                      : 'text-light-silver hover:bg-gunmetal-lighter hover:text-white'
                  }`}
                  onClick={() => {
                    setFeature('chat');
                    setShowProgressRail(false);
                  }}
                >
                  <MessageCircle className="size-5" />
                  {feature === 'chat' && (
                    <div className="absolute inset-0 -z-10 rounded-xl bg-orange-accent/20 blur-lg"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Chat</span>
                  <kbd className="rounded bg-light-silver-darker px-2 py-1 font-mono text-xs dark:bg-gunmetal">C</kbd>
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
                      className={`modern-button relative size-12 rounded-xl p-0 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-orange-accent to-orange-accent-hover text-white shadow-lg shadow-orange-accent/30'
                          : 'text-light-silver hover:bg-gunmetal-lighter hover:text-white'
                      }`}
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <Icon className="size-5" />
                      {isActive && (
                        <div className="absolute inset-0 -z-10 rounded-xl bg-orange-accent/20 blur-lg"></div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex items-center gap-2">
                      <span>{tool.label}</span>
                      <kbd className="rounded bg-light-silver-darker px-2 py-1 font-mono text-xs dark:bg-gunmetal">
                        {tool.shortcut}
                      </kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Settings - Tighter Spacing */}
          <div className="space-y-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="modern-button size-12 rounded-xl p-0 text-light-silver hover:bg-gunmetal-lighter hover:text-white"
                  onClick={() => setShowCanvasOverlay(!showCanvasOverlay)}
                >
                  <Layers className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Canvas Overlay</span>
                  <kbd className="rounded bg-light-silver-darker px-2 py-1 font-mono text-xs dark:bg-gunmetal">Ctrl+O</kbd>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="modern-button size-12 rounded-xl p-0 text-light-silver hover:bg-gunmetal-lighter hover:text-white"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Toggle Theme</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1">
          <div className="flex-1 bg-background">
            {/* Enhanced Header for Tools */}
            {feature !== 'chat' && (
              <header className="flex h-16 items-center justify-between border-b border-light-silver-darker bg-white/95 px-8 backdrop-blur-lg dark:border-gunmetal-lighter dark:bg-gunmetal/95">
                <div className="flex items-center gap-4">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-accent to-orange-accent-hover shadow-md">
                    {React.createElement(toolItems.find(t => t.id === feature)?.icon || MessageCircle, {
                      className: "h-4 w-4 text-white"
                    })}
                  </div>
                  <h1 className="text-xl font-semibold text-gunmetal dark:text-light-silver">
                    {toolItems.find(t => t.id === feature)?.label || feature}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="animate-modern-pulse border-green-500/20 bg-green-500/10 text-xs text-green-600"
                  >
                    ● Active
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="modern-button border-light-silver-darker text-gunmetal hover:border-orange-accent hover:bg-orange-accent hover:text-white dark:border-gunmetal-lighter dark:text-light-silver"
                  onClick={() => setFeature('chat')}
                >
                  Back to Chat
                </Button>
              </header>
            )}

            {/* Main Panel - Chat Content Area */}
            <main className={`overflow-hidden bg-background ${
              feature === 'chat' ? "h-full" : "h-[calc(100vh-4rem)]"
            }`}>
              {/* Chat Interface Content - Following Blueprint Pattern */}
              <div className="flex h-full">
                {/* Main Chat Area - Takes full width */}
                <div className="flex flex-1 flex-col bg-gradient-to-br from-white via-gray-50/50 to-light-silver/30 dark:from-gunmetal dark:via-gunmetal dark:to-gunmetal-lighter">
                  {/* Messages Area */}
                  <div className="scrollbar-modern flex-1 overflow-y-auto px-6 py-8">
                    <div className="mx-auto max-w-4xl space-y-8">
                      {/* Inline ROI Calculator */}
                      {showInlineROI && (
                        <div className="mb-6">
                          <InlineROICalculator
                            onComplete={(result) => {
                              console.log('ROI calculation completed:', result)
                              setShowInlineROI(false)
                              // Add result message to chat
                              addMessage({
                                role: 'assistant',
                                content: `ROI Analysis Complete: ${result.roi}% return, ${result.paybackPeriod || 'N/A'} month payback, $${result.netProfit?.toLocaleString()} net profit.`,
                                timestamp: new Date()
                              })
                            }}
                          />
                          <div className="mt-2 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowInlineROI(false)}
                            >
                              Close Calculator
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {chatMessages.length === 0 && !isLoading ? (
                        <div className="animate-smooth-fade-in space-y-8 py-16 text-center">
                          <div className="space-y-4">
                            <div className="relative">
                              <div className="mx-auto mb-6 flex size-16 animate-modern-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-orange-accent to-orange-accent-hover">
                                <Sparkles className="size-8 text-white" />
                              </div>
                              <div className="absolute -inset-2 animate-modern-pulse rounded-3xl bg-orange-accent/20 opacity-50 blur-xl"></div>
                            </div>
                            <h1 className="text-gradient mb-2 text-3xl font-bold">What can we build together?</h1>
                            <p className="mx-auto max-w-md text-lg text-muted-foreground">
                              Select a tool to start collaborating or describe your project vision
                            </p>
                            {/* 🔧 MASTER FLOW: Intelligence Status Indicator */}
                            {contextLoading && (
                              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <div className="size-4 animate-spin rounded-full border-2 border-orange-accent border-t-transparent"></div>
                                Analyzing your background for personalized assistance...
                              </div>
                            )}
                            {intelligenceContext && (
                              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                                <div className="size-2 rounded-full bg-green-500"></div>
                                Ready with personalized insights
                                {intelligenceContext.company?.name && ` for ${intelligenceContext.company.name}`}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {chatMessages.map((message, index) => (
                            <div
                              key={index}
                              className="animate-smooth-fade-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              {message.role === 'user' ? (
                                // User message - Original design with modern styling
                                <div className="flex justify-end">
                                  <div className="flex max-w-2xl gap-4">
                                    <div className="flex flex-1 flex-col items-end">
                                      <div className="mb-2 text-right text-sm text-muted-foreground">
                                        You
                                      </div>
                                      <div className="modern-button max-w-full rounded-2xl rounded-tr-md bg-gradient-to-r from-orange-accent to-orange-accent-hover px-6 py-4 text-white shadow-lg shadow-orange-accent/20">
                                        <p className="text-sm font-medium leading-relaxed">
                                          {message.content}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gunmetal to-gunmetal-lighter shadow-lg">
                                      <User className="size-5 text-white" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // AI message - Original design with modern styling
                                <div className="flex justify-start">
                                  <div className="flex max-w-3xl gap-4">
                                    <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-accent to-orange-accent-hover shadow-lg">
                                      <Zap className="size-5 text-white" />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                      <div className="mb-2 text-sm text-muted-foreground">
                                        F.B/c AI {message.role === 'system' && <Badge variant="secondary" className="ml-2 text-xs">System</Badge>}
                                      </div>
                                      <div className="modern-card rounded-2xl rounded-tl-md bg-white px-6 py-4 shadow-lg dark:bg-gunmetal-lighter">
                                        {message.content && message.content.trim() ? (
                                          renderAIResponse(message.content)
                                        ) : (
                                          <div className="prose prose-sm max-w-none dark:prose-invert">
                                            <div className="flex items-center gap-2">
                                              <div className="size-2 animate-modern-bounce rounded-full bg-orange-accent"></div>
                                              <div className="size-2 animate-modern-bounce rounded-full bg-orange-accent [animation-delay:0.2s]"></div>
                                              <div className="size-2 animate-modern-bounce rounded-full bg-orange-accent [animation-delay:0.4s]"></div>
                                              <span className="ml-2 text-sm text-muted-foreground">Thinking...</span>
                                            </div>
                                          </div>
                                        )}
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
                                <div className="flex max-w-3xl gap-4">
                                  <div className="mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-accent to-orange-accent-hover shadow-lg">
                                    <Zap className="size-5 text-white" />
                                  </div>
                                  <div className="flex flex-1 flex-col">
                                    <div className="mb-2 text-sm text-muted-foreground">
                                      F.B/c AI
                                    </div>
                                    <div className="modern-card rounded-2xl rounded-tl-md bg-white px-6 py-4 shadow-lg dark:bg-gunmetal-lighter">
                                      <div className="flex items-center gap-2">
                                        <div className="size-2 animate-modern-bounce rounded-full bg-orange-accent"></div>
                                        <div className="size-2 animate-modern-bounce rounded-full bg-orange-accent [animation-delay:0.2s]"></div>
                                        <div className="size-2 animate-modern-bounce rounded-full bg-orange-accent [animation-delay:0.4s]"></div>
                                      </div>
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
            <div className="border-t border-light-silver-darker bg-light-silver/90 p-6 backdrop-blur-lg dark:border-gunmetal-lighter dark:bg-gunmetal">
              <div className="mx-auto max-w-4xl">
                {/* SuggestedActions Component - Connected to Composer Top Slot */}
                <SuggestedActions
                  sessionId={sessionId}
                  stage="BACKGROUND_RESEARCH"
                  mode="static"
                />
                <div className="modern-input-focus relative overflow-hidden rounded-3xl border border-light-silver-darker bg-light-silver shadow-lg dark:border-light-silver dark:bg-light-silver">
                  <PromptInputTextarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    className="resize-none rounded-3xl border-none bg-transparent py-6 pl-16 pr-20 text-base text-gunmetal placeholder:text-muted-foreground focus:outline-none focus:ring-0 dark:text-gunmetal"
                                              disabled={isLoading}
                  />

                  <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
                    {/* 🎯 MULTIMODAL INPUT TRIGGER - Enhanced + Icon */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="modern-button size-10 rounded-full p-0 text-muted-foreground hover:text-orange-accent dark:text-muted-foreground dark:hover:text-orange-accent"
                        >
                          <Plus className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="top" align="start" className="w-56">
                        <div className="p-2">
                          <div className="mb-2 text-xs font-medium text-muted-foreground">Add to conversation</div>
                          
                          <DropdownMenuItem
                            onClick={() => handleToolAction('webcam')}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3"
                          >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
                              <Camera className="size-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Webcam</div>
                              <div className="text-xs text-muted-foreground">Capture video and photos</div>
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleToolAction('screen')}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3"
                          >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-green-100">
                              <Monitor className="size-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Screen Share</div>
                              <div className="text-xs text-muted-foreground">Share screen for analysis</div>
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*,video/*,.pdf,.docx,.txt'
                              input.onchange = async (e) => {
                                const files = (e.target as HTMLInputElement).files
                                if (files?.[0]) {
                                  // Handle file upload
                                  const formData = new FormData()
                                  formData.append('file', files[0])
                                  
                                  try {
                                    const response = await fetch('/api/upload', {
                                      method: 'POST',
                                      headers: {
                                        'x-intelligence-session-id': sessionId || '',
                                      },
                                      body: formData
                                    })
                                    
                                    if (response.ok) {
                                      const result = await response.json()
                                      if (result.analysis) {
                                        addMessage({
                                          role: 'assistant',
                                          content: `**📄 File Analysis: ${files[0].name}**\n\n${result.analysis}`,
                                          timestamp: new Date()
                                        })
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Upload failed:', error)
                                  }
                                }
                              }
                              input.click()
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3"
                          >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100">
                              <Paperclip className="size-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">Upload File</div>
                              <div className="text-xs text-muted-foreground">Documents, images, videos</div>
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              const url = prompt('Enter URL to analyze:')
                              if (url && url.trim()) {
                                fetch('/api/tools/url', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'x-intelligence-session-id': sessionId || '',
                                  },
                                  body: JSON.stringify({
                                    url: url.trim(),
                                    analysisType: 'comprehensive',
                                    extractContent: true
                                  })
                                }).then(async (response) => {
                                  if (response.ok) {
                                    const result = await response.json()
                                    if (result.output?.analysis) {
                                      addMessage({
                                        role: 'assistant',
                                        content: `**🌐 URL Analysis: ${url}**\n\n${result.output.analysis}`,
                                        timestamp: new Date()
                                      })
                                    }
                                  }
                                }).catch(console.error)
                              }
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3"
                          >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-100">
                              <FileText className="size-4 text-cyan-600" />
                            </div>
                            <div>
                              <div className="font-medium">Analyze URL</div>
                              <div className="text-xs text-muted-foreground">Web content analysis</div>
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => handleToolAction('video')}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3"
                          >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-100">
                              <FileText className="size-4 text-indigo-600" />
                            </div>
                            <div>
                              <div className="font-medium">Video to App</div>
                              <div className="text-xs text-muted-foreground">Convert videos to apps</div>
                            </div>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleToolAction('workshop')}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-3"
                          >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-pink-100">
                              <GraduationCap className="size-4 text-pink-600" />
                            </div>
                            <div>
                              <div className="font-medium">Workshop</div>
                              <div className="text-xs text-muted-foreground">Learning modules and courses</div>
                            </div>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="modern-button size-10 rounded-full p-0 text-muted-foreground hover:text-orange-accent dark:text-muted-foreground dark:hover:text-orange-accent"
                      onClick={() => setShowVoiceOverlay(true)}
                    >
                      <Mic className="size-5" />
                    </Button>
                    {input.trim() && (
                      <Button
                        onClick={() => handleSendMessage(input)}
                        size="sm"
                        className="modern-button size-10 rounded-full bg-gradient-to-r from-orange-accent to-orange-accent-hover p-0 text-white shadow-lg shadow-orange-accent/30 hover:from-orange-accent-hover hover:to-orange-accent"
                                                  disabled={isLoading}
                      >
                        <Send className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  F.B-c AI can make mistakes. Please verify important information.
                </p>
              </div>
            </div>
            </div>
          </div>
            </main>

        </div>

        {/* Canvas Orchestrator */}
        <CanvasOrchestrator />

        {/* 7-Step Consulting Process Indicator */}
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
      </StageProvider>
    </TooltipProvider>
  )
}
