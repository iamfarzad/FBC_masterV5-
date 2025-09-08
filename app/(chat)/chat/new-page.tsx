"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { DemoSessionProvider } from "@/components/demo-session-manager"
import { StageProvider } from "@/contexts/stage-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, Send, MessageCircle, Camera, Monitor, FileText, 
  GraduationCap, Sun, Moon, Sparkles, Plus, Paperclip,
  Settings, User, History, BookOpen, Zap, ChevronLeft,
  MoreHorizontal, Search, Filter
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUnifiedChat } from "@/hooks/useUnifiedChat"
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
import { ChatMessages } from "@/components/chat/layouts/ChatMessages"
import type { ChatMessageUI } from "@/components/chat/types"
import { cn } from "@/src/core/utils"

// Modern Chat Page Implementation
export default function NewChatPage() {
  // All existing state and hooks from original page
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const existingId = window.localStorage.getItem('intelligence-session-id')
      if (existingId) {
        return existingId
      }
      const newId = generateSecureSessionId()
      window.localStorage.setItem('intelligence-session-id', newId)
      return newId
    }
    return null
  })

  const [input, setInput] = useState('')
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false)
  const [showConsentOverlay, setShowConsentOverlay] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [showInlineROI, setShowInlineROI] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const { theme, setTheme } = useTheme()

  // Chat hook with all existing functionality
  const chat = useUnifiedChat({
    sessionId: sessionId || 'anonymous',
    mode: 'standard'
  });

  const {
    messages: rawMessages,
    isLoading,
    sendMessage,
    clearMessages,
    addMessage
  } = chat

  const chatMessages: ChatMessageUI[] = rawMessages.map(msg => ({
    ...msg,
    imageUrl: null,
    videoToAppCard: null
  }))

  const { openCanvas } = useCanvas()
  const meeting = useMeeting()

  // All existing handlers
  const handleSendMessage = useCallback(async (content?: string) => {
    const messageContent = content || input.trim()
    if (messageContent && !isLoading) {
      setInput('')
      try {
        await sendMessage(messageContent)
      } catch (err) {
        console.error('Failed to send message:', err)
      }
    }
  }, [input, isLoading, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage(input)
    }
  }, [handleSendMessage, input])

  const handleVoiceInput = useCallback((transcript: string) => {
    setInput(transcript)
    setShowVoiceOverlay(false)
  }, [])

  const handleConsentSubmit = async (data: { name: string; email: string; companyUrl: string }) => {
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          companyUrl: data.companyUrl,
          name: data.name,
          sessionId: sessionId
        }),
      })

      if (response.ok) {
        setHasConsent(true)
        setShowConsentOverlay(false)
        const welcomeMessage = `Hi ${data.name}, welcome to F.B/c! I'm analyzing your background to provide personalized assistance. How can I help you today?`
        addMessage({
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
          type: 'text'
        })
      }
    } catch (error) {
      console.error('Error submitting consent:', error)
    }
  }

  // Check consent on mount
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

  return (
    <TooltipProvider>
      <StageProvider>
        <DemoSessionProvider>
          {/* MODERN CHAT LAYOUT */}
          <div className="flex h-screen bg-gradient-to-br from-background via-background/98 to-muted/20 overflow-hidden">
            
            {/* LEFT SIDEBAR - Modern Design */}
            <div className={cn(
              "bg-card/40 backdrop-blur-2xl border-r border-border/20 transition-all duration-300 flex flex-col shadow-xl",
              sidebarCollapsed ? "w-16" : "w-80"
            )}>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border/10">
                <div className="flex items-center justify-between">
                  <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
                    <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-hover rounded-2xl flex items-center justify-center shadow-lg shadow-brand/25">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    {!sidebarCollapsed && (
                      <div>
                        <h1 className="font-bold text-lg bg-gradient-to-r from-brand to-brand-hover bg-clip-text text-transparent">
                          F.B/c
                        </h1>
                        <p className="text-xs text-muted-foreground">AI Consultant</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 hover:bg-muted/50"
                  >
                    <ChevronLeft className={cn("w-4 h-4 transition-transform", sidebarCollapsed && "rotate-180")} />
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-3 space-y-1">
                <Button 
                  variant="default"
                  className={cn(
                    "justify-start gap-3 h-11 bg-gradient-to-r from-brand/10 to-brand-hover/10 border border-brand/20 text-brand hover:from-brand/20 hover:to-brand-hover/20",
                    sidebarCollapsed ? "w-10 px-0 justify-center" : "w-full"
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  {!sidebarCollapsed && "Current Chat"}
                </Button>
                
                <Button 
                  variant="ghost"
                  className={cn(
                    "justify-start gap-3 h-11 hover:bg-muted/50",
                    sidebarCollapsed ? "w-10 px-0 justify-center" : "w-full"
                  )}
                >
                  <Plus className="w-5 h-5" />
                  {!sidebarCollapsed && "New Chat"}
                </Button>

                <Button 
                  variant="ghost"
                  className={cn(
                    "justify-start gap-3 h-11 hover:bg-muted/50",
                    sidebarCollapsed ? "w-10 px-0 justify-center" : "w-full"
                  )}
                >
                  <History className="w-5 h-5" />
                  {!sidebarCollapsed && "History"}
                </Button>
              </div>

              {/* Tools Section */}
              {!sidebarCollapsed && (
                <div className="px-3 pb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-3">
                    AI Tools
                  </h3>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                      <Camera className="w-4 h-4" />
                      Webcam Capture
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                      <Monitor className="w-4 h-4" />
                      Screen Share
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                      <FileText className="w-4 h-4" />
                      Document Analysis
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                      <GraduationCap className="w-4 h-4" />
                      Workshop
                    </Button>
                  </div>
                </div>
              )}

              {/* Recent Conversations */}
              {!sidebarCollapsed && (
                <div className="flex-1 px-3 pb-3">
                  <div className="flex items-center justify-between mb-2 px-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Recent
                    </h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Search className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {[
                      { title: "AI Strategy Discussion", time: "2h ago", preview: "Let's explore automation opportunities..." },
                      { title: "ROI Calculator Session", time: "Yesterday", preview: "Calculate potential savings from..." },
                      { title: "Process Optimization", time: "3 days ago", preview: "Identify bottlenecks in your..." },
                      { title: "Technology Assessment", time: "1 week ago", preview: "Review current tech stack and..." }
                    ].map((conversation, i) => (
                      <div key={i} className="p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors group">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-brand transition-colors">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conversation.preview}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="p-3 border-t border-border/10 space-y-1">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "justify-start gap-3 h-10",
                    sidebarCollapsed ? "w-10 px-0 justify-center" : "w-full"
                  )}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {!sidebarCollapsed && "Theme"}
                </Button>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "justify-start gap-3 h-10",
                    sidebarCollapsed ? "w-10 px-0 justify-center" : "w-full"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  {!sidebarCollapsed && "Settings"}
                </Button>
              </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="h-16 bg-background/60 backdrop-blur-xl border-b border-border/10 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-lg">F.B/c AI Assistant</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-muted-foreground">Online • Ready to help with AI consulting</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
                <ChatMessages
                  messages={chatMessages}
                  isLoading={isLoading}
                  sessionId={sessionId}
                  className="h-full"
                  emptyState={
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-gradient-to-br from-brand/20 to-brand-hover/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <Sparkles className="w-10 h-10 text-brand" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Welcome to F.B/c AI
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          I'm your AI consultant specializing in business automation, strategy development, and ROI optimization. Let's explore how AI can transform your business.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Button variant="outline" size="sm" className="text-xs">
                            Calculate ROI
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            AI Strategy
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            Process Automation
                          </Button>
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>

              {/* Input Area - Modern Design */}
              <div className="bg-background/80 backdrop-blur-xl border-t border-border/10 p-6">
                <div className="max-w-4xl mx-auto">
                  {/* Suggested Actions */}
                  <SuggestedActions
                    sessionId={sessionId}
                    stage="BACKGROUND_RESEARCH"
                    mode="static"
                  />
                  
                  {/* Input Container */}
                  <div className="relative">
                    <div className="bg-card/60 backdrop-blur-sm border border-border/20 rounded-3xl shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:border-brand/30 transition-all duration-200">
                      <div className="flex items-end gap-3 p-4">
                        {/* Attachment Button */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-muted/50 flex-shrink-0">
                              <Plus className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="top" align="start" className="w-64">
                            <div className="p-2">
                              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Add to conversation</div>
                              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Camera className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Webcam</div>
                                  <div className="text-xs text-muted-foreground">Capture video and photos</div>
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Monitor className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Screen Share</div>
                                  <div className="text-xs text-muted-foreground">Share your screen</div>
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Paperclip className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Upload File</div>
                                  <div className="text-xs text-muted-foreground">Documents, images, videos</div>
                                </div>
                              </DropdownMenuItem>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Text Input */}
                        <div className="flex-1">
                          <PromptInputTextarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about AI strategy, ROI calculations, automation opportunities..."
                            className="resize-none border-none bg-transparent text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0 min-h-[24px] max-h-32 py-2"
                            disabled={isLoading}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-full hover:bg-muted/50"
                            onClick={() => setShowVoiceOverlay(true)}
                          >
                            <Mic className="w-5 h-5" />
                          </Button>
                          
                          {input.trim() && (
                            <Button
                              onClick={() => handleSendMessage(input)}
                              size="sm"
                              className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand shadow-lg shadow-brand/25 transition-all"
                              disabled={isLoading}
                            >
                              <Send className="w-4 h-4 text-white" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    F.B/c AI can make mistakes. Please verify important information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Overlays */}
          <CanvasOrchestrator />
          {sessionId && <StageRail sessionId={sessionId} />}
          
          <VoiceOverlay
            open={showVoiceOverlay}
            onCancel={() => setShowVoiceOverlay(false)}
            onAccept={handleVoiceInput}
            sessionId={sessionId}
          />

          <ConsentOverlay
            isVisible={showConsentOverlay}
            onSubmit={handleConsentSubmit}
          />

          {/* Inline ROI Calculator */}
          {showInlineROI && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                <InlineROICalculator
                  onComplete={(result) => {
                    console.log('ROI calculation completed:', result)
                    setShowInlineROI(false)
                    addMessage({
                      role: 'assistant',
                      content: `ROI Analysis Complete: ${result.roi}% return, ${result.paybackPeriod || 'N/A'} month payback, $${result.netProfit?.toLocaleString()} net profit.`,
                      timestamp: new Date()
                    })
                  }}
                />
                <div className="p-4 text-center border-t">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowInlineROI(false)}
                  >
                    Close Calculator
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DemoSessionProvider>
      </StageProvider>
    </TooltipProvider>
  )
}