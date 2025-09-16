/**
 * Chat V2 - Source of Truth
 * Complete AI SDK implementation with all features
 */

"use client"

import React, { useState, useCallback, useMemo } from "react"
import { useAISDKComplete } from "@/hooks/useAISDKComplete"
import { ChatDevtools } from "@/components/debug/ChatDevtools"
import { ChatMessages } from "@/components/chat/layouts/ChatMessages"
import { ChatLayout } from "@/components/chat/layouts/ChatLayout"
import { PromptInputTextarea } from "@/components/ai-elements/prompt-input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Mic, 
  Send, 
  Sparkles, 
  Zap, 
  User, 
  MessageCircle, 
  Camera, 
  Monitor, 
  Plus,
  Sun,
  Moon,
  Brain,
  Settings
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/src/core/utils"
import type { ChatMessageUI } from "@/components/chat/types"

export default function ChatV2Page() {
  // Session management
  const [sessionId] = useState(() => crypto.randomUUID())
  const [input, setInput] = useState('')
  
  // Feature flags for V2
  const [enableDebugTools, setEnableDebugTools] = useState(false)
  const [enableIntelligence, setEnableIntelligence] = useState(true)
  const [enableTools, setEnableTools] = useState(true)
  
  const { theme, setTheme } = useTheme()

  // Complete AI SDK Chat - Source of Truth Implementation
  const {
    messages: rawMessages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    intelligenceContext,
    suggestedActions,
    contextLoading,
    executeSuggestedAction,
    getIntelligenceInsights,
    refreshIntelligence,
    toolCalls,
    mode,
    capabilities
  } = useAISDKComplete({
    sessionId,
    mode: 'standard',
    enableIntelligence,
    enableTools,
    enableMultimodal: true,
    onIntelligenceUpdate: (context) => {
      console.log('🧠 [CHAT_V2] Intelligence context updated:', context)
    },
    onToolCall: (toolName, args, result) => {
      console.log('🔧 [CHAT_V2] Tool executed:', { toolName, args, result })
    },
    onError: (error) => {
      console.error('❌ [CHAT_V2] Error:', error)
    }
  })

  // Convert to UI format
  const chatMessages: ChatMessageUI[] = rawMessages.map((msg: any) => ({
    ...msg,
    imageUrl: null,
    videoToAppCard: null,
    sources: toolCalls.filter(tc => tc.toolName === 'webSearch').map(tc => ({
      url: 'https://example.com',
      title: 'Search Result'
    }))
  }))

  // Enhanced send message handler
  const handleSendMessage = useCallback(async (content?: string) => {
    const messageContent = content || input.trim()
    if (messageContent && !isLoading) {
      setInput('')
      try {
        await sendMessage(messageContent)
      } catch (err) {
        console.error('[CHAT_V2] Send message failed:', err)
      }
    }
  }, [input, isLoading, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage(input)
    }
  }, [handleSendMessage, input])

  // Intelligence insights
  const insights = getIntelligenceInsights()

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Enhanced Sidebar with V2 Features */}
        <div className="relative flex w-16 flex-col border-r border-border bg-surface-elevated py-4">
          {/* V2 Logo with Intelligence Indicator */}
          <div className="mb-6 px-3">
            <div className="relative">
              <div className="modern-hover flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <span className="text-base font-bold text-white">V2</span>
              </div>
              <div className="absolute inset-0 -z-10 animate-modern-pulse rounded-xl bg-purple-500/20 blur-md"></div>
              
              {/* Intelligence Status Indicator */}
              {intelligenceContext && (
                <div className="absolute -top-1 -right-1 size-4 rounded-full bg-green-500 border-2 border-background">
                  <div className="size-full rounded-full bg-green-400 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1 px-2">
            {/* Chat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="modern-button relative size-12 rounded-xl p-0 bg-gradient-to-br from-brand to-brand-hover text-white shadow-lg shadow-brand/30"
                >
                  <MessageCircle className="size-5" />
                  <div className="absolute inset-0 -z-10 rounded-xl bg-brand/20 blur-lg"></div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Chat V2 (Active)</span>
                  <Badge variant="default" className="bg-purple-500">SoT</Badge>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Intelligence Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={enableIntelligence ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "modern-button relative size-12 rounded-xl p-0 transition-all duration-300",
                    enableIntelligence 
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-text-muted hover:bg-surface hover:text-text"
                  )}
                  onClick={() => setEnableIntelligence(!enableIntelligence)}
                >
                  <Brain className="size-5" />
                  {enableIntelligence && (
                    <div className="absolute inset-0 -z-10 rounded-xl bg-purple-500/20 blur-lg"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>{enableIntelligence ? 'Intelligence: ON' : 'Intelligence: OFF'}</span>
                  <kbd className="rounded bg-surface-elevated px-2 py-1 font-mono text-xs">I</kbd>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Tools Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={enableTools ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "modern-button relative size-12 rounded-xl p-0 transition-all duration-300",
                    enableTools 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-text-muted hover:bg-surface hover:text-text"
                  )}
                  onClick={() => setEnableTools(!enableTools)}
                >
                  <Zap className="size-5" />
                  {enableTools && (
                    <div className="absolute inset-0 -z-10 rounded-xl bg-blue-500/20 blur-lg"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>{enableTools ? 'Tools: ON' : 'Tools: OFF'}</span>
                  <kbd className="rounded bg-surface-elevated px-2 py-1 font-mono text-xs">T</kbd>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Debug Tools Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={enableDebugTools ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "modern-button relative size-12 rounded-xl p-0 transition-all duration-300",
                    enableDebugTools 
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                      : "text-text-muted hover:bg-surface hover:text-text"
                  )}
                  onClick={() => setEnableDebugTools(!enableDebugTools)}
                >
                  <Settings className="size-5" />
                  {enableDebugTools && (
                    <div className="absolute inset-0 -z-10 rounded-xl bg-orange-500/20 blur-lg"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>{enableDebugTools ? 'Debug: ON' : 'Debug: OFF'}</span>
                  <kbd className="rounded bg-surface-elevated px-2 py-1 font-mono text-xs">D</kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          </nav>

          {/* Settings */}
          <div className="space-y-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="modern-button size-12 rounded-xl p-0 text-text-muted hover:bg-surface hover:text-text"
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

        {/* Main Chat Area */}
        <div className="flex-1 bg-background">
          {/* V2 Header */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-surface/95 px-8 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-text">F.B/c AI Chat V2</h1>
                <p className="text-sm text-text-muted">Source of Truth • AI SDK Native</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-purple-500">
                  SoT
                </Badge>
                <Badge 
                  variant={enableIntelligence ? "default" : "secondary"}
                  className={enableIntelligence ? "bg-green-500" : ""}
                >
                  {enableIntelligence ? "🧠 Smart" : "💬 Basic"}
                </Badge>
                <Badge 
                  variant={enableTools ? "default" : "secondary"}
                  className={enableTools ? "bg-blue-500" : ""}
                >
                  {enableTools ? "🛠️ Tools" : "📝 Text"}
                </Badge>
              </div>
            </div>

            {/* Intelligence Status */}
            <div className="flex items-center gap-4">
              {contextLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="size-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                  Analyzing...
                </div>
              )}
              
              {insights && (
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500"></div>
                    <span className="text-text-muted">
                      {insights.completeness.hasLead ? 'Lead' : 'Anonymous'} • 
                      {insights.stage} • 
                      {insights.nextActions} actions
                    </span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Main Chat Interface */}
          <main className="h-[calc(100vh-4rem)] overflow-hidden bg-background">
            <div className="flex h-full">
              {/* Chat Messages Area */}
              <div className="flex flex-1 flex-col bg-gradient-to-br from-surface via-bg/50 to-bg/30">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-8">
                  <div className="mx-auto max-w-4xl space-y-8">
                    <ChatMessages
                      messages={chatMessages}
                      isLoading={isLoading}
                      sessionId={sessionId}
                      emptyState={
                        <div className="animate-smooth-fade-in space-y-8 py-16 text-center">
                          <div className="space-y-4">
                            <div className="relative">
                              <div className="mx-auto mb-6 flex size-16 animate-modern-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
                                <Sparkles className="size-8 text-white" />
                              </div>
                              <div className="absolute -inset-2 animate-modern-pulse rounded-3xl bg-purple-500/20 opacity-50 blur-xl"></div>
                            </div>
                            <h1 className="text-gradient mb-2 text-3xl font-bold">Chat V2 - Source of Truth</h1>
                            <p className="mx-auto max-w-md text-lg text-muted-foreground">
                              Complete AI SDK implementation with intelligence, tools, and real-time capabilities
                            </p>
                            
                            {/* Intelligence Status */}
                            {contextLoading && (
                              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <div className="size-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                                Initializing intelligence system...
                              </div>
                            )}
                            
                            {intelligenceContext && (
                              <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm text-green-600">
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-green-500"></div>
                                  <span>Intelligence active for {intelligenceContext.lead?.name || 'user'}</span>
                                </div>
                                {intelligenceContext.company?.name && (
                                  <div className="text-xs text-green-500/80">
                                    Company: {intelligenceContext.company.name}
                                    {intelligenceContext.intent && ` • Intent: ${intelligenceContext.intent.primary}`}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Feature Status */}
                            <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                              <div className={`flex items-center gap-1 ${enableIntelligence ? 'text-green-600' : 'text-gray-400'}`}>
                                <Brain className="size-3" />
                                Intelligence
                              </div>
                              <div className={`flex items-center gap-1 ${enableTools ? 'text-blue-600' : 'text-gray-400'}`}>
                                <Zap className="size-3" />
                                Tools
                              </div>
                              <div className={`flex items-center gap-1 ${enableDebugTools ? 'text-orange-600' : 'text-gray-400'}`}>
                                <Settings className="size-3" />
                                Debug
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* Enhanced Input Area */}
                <div className="border-t border-border bg-bg/90 p-6 backdrop-blur-lg">
                  <div className="mx-auto max-w-4xl">
                    {/* Suggested Actions */}
                    {suggestedActions.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-text-muted mb-2">Suggested Actions:</div>
                        <div className="flex flex-wrap gap-2">
                          {suggestedActions.slice(0, 3).map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => executeSuggestedAction(action)}
                            >
                              {action.action}
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {action.priority}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    <div className="modern-input-focus relative overflow-hidden rounded-3xl border border-border bg-surface shadow-lg">
                      <PromptInputTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything... (V2 with AI SDK + Intelligence + Tools)"
                        className="resize-none rounded-3xl border-none bg-transparent py-6 pl-16 pr-20 text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-0"
                        disabled={isLoading}
                      />

                      {/* Enhanced Input Controls */}
                      <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="modern-button size-10 rounded-full p-0 text-text-muted hover:text-purple-500"
                        >
                          <Plus className="size-5" />
                        </Button>
                      </div>

                      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="modern-button size-10 rounded-full p-0 text-text-muted hover:text-purple-500"
                        >
                          <Mic className="size-5" />
                        </Button>
                        
                        {input.trim() && (
                          <Button
                            onClick={() => handleSendMessage(input)}
                            size="sm"
                            className="modern-button size-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 p-0 text-white shadow-lg shadow-purple-500/30"
                            disabled={isLoading}
                          >
                            <Send className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* V2 Footer */}
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>F.B/c AI Chat V2 - Source of Truth</span>
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-green-500"></div>
                          <span>AI SDK Native</span>
                        </div>
                        {toolCalls.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Zap className="size-3" />
                            <span>{toolCalls.length} tools used</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span>Session: {sessionId.slice(0, 8)}</span>
                        {error && (
                          <Badge variant="destructive" className="text-xs">
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intelligence Sidebar */}
              {enableIntelligence && intelligenceContext && (
                <div className="w-80 border-l border-border bg-surface/30 backdrop-blur-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-text mb-4">Intelligence Context</h3>
                    
                    {/* Lead Info */}
                    {intelligenceContext.lead && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-elevated">
                        <div className="text-sm font-medium text-text">Lead Information</div>
                        <div className="mt-2 space-y-1 text-xs text-text-muted">
                          <div>Name: {intelligenceContext.lead.name}</div>
                          <div>Email: {intelligenceContext.lead.email}</div>
                          {intelligenceContext.lead.role && (
                            <div>Role: {intelligenceContext.lead.role}</div>
                          )}
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {Math.round((intelligenceContext.lead.confidence || 0) * 100)}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Company Info */}
                    {intelligenceContext.company && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-elevated">
                        <div className="text-sm font-medium text-text">Company</div>
                        <div className="mt-2 space-y-1 text-xs text-text-muted">
                          <div>Name: {intelligenceContext.company.name}</div>
                          <div>Domain: {intelligenceContext.company.domain}</div>
                          {intelligenceContext.company.industry && (
                            <div>Industry: {intelligenceContext.company.industry}</div>
                          )}
                          {intelligenceContext.company.size && (
                            <div>Size: {intelligenceContext.company.size}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Intent Analysis */}
                    {intelligenceContext.intent && (
                      <div className="mb-4 p-3 rounded-lg bg-surface-elevated">
                        <div className="text-sm font-medium text-text">Intent</div>
                        <div className="mt-2 space-y-1 text-xs text-text-muted">
                          <div>Primary: {intelligenceContext.intent.primary}</div>
                          <div>Urgency: {intelligenceContext.intent.urgency}</div>
                          {intelligenceContext.intent.timeline && (
                            <div>Timeline: {intelligenceContext.intent.timeline}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Suggested Actions */}
                    {suggestedActions.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-text mb-2">Next Actions</div>
                        <div className="space-y-2">
                          {suggestedActions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-left text-xs"
                              onClick={() => executeSuggestedAction(action)}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`size-2 rounded-full ${
                                  action.priority === 'high' ? 'bg-red-500' :
                                  action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                                <span>{action.action}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Refresh Intelligence */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={refreshIntelligence}
                      disabled={contextLoading}
                    >
                      <Brain className="size-4 mr-2" />
                      Refresh Intelligence
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Debug Tools */}
        {enableDebugTools && (
          <ChatDevtools />
        )}
      </div>
    </TooltipProvider>
  )
}