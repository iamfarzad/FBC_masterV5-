/**
 * Chat V2 - Source of Truth (Minimal Working Version)
 * Clean implementation that passes TypeScript and builds successfully
 */

"use client"

import React, { useState, useCallback } from "react"
import { useUnifiedChat } from "@/hooks/useUnifiedChat"
import { ChatMessages } from "@/components/chat/layouts/ChatMessages"
import { PromptInputTextarea } from "@/components/ai-elements/prompt-input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Send, 
  Sparkles, 
  MessageCircle,
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
  
  const { theme, setTheme } = useTheme()

  // Use existing working chat hook for now (will be migrated incrementally)
  const {
    messages: rawMessages,
    isLoading,
    error,
    sendMessage,
    addMessage,
    clearMessages
  } = useUnifiedChat({
    sessionId,
    mode: 'standard'
  })

  // Convert to UI format
  const chatMessages: ChatMessageUI[] = rawMessages.map((msg: any) => ({
    ...msg,
    imageUrl: null,
    videoToAppCard: null
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

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Enhanced Sidebar with V2 Features */}
        <div className="relative flex w-16 flex-col border-r border-border bg-surface-elevated py-4">
          {/* V2 Logo */}
          <div className="mb-6 px-3">
            <div className="relative">
              <div className="modern-hover flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <span className="text-base font-bold text-white">V2</span>
              </div>
              <div className="absolute inset-0 -z-10 animate-modern-pulse rounded-xl bg-purple-500/20 blur-md"></div>
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
                <p className="text-sm text-text-muted">Source of Truth • Foundation for AI SDK Migration</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-purple-500">
                  SoT
                </Badge>
                <Badge variant="secondary">
                  🏗️ Foundation
                </Badge>
              </div>
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
                              Foundation for complete AI SDK implementation with intelligence, tools, and real-time capabilities
                            </p>
                            
                            <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                              <div className="flex items-center gap-1 text-purple-600">
                                <Brain className="size-3" />
                                AI SDK Ready
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <Sparkles className="size-3" />
                                V2 Foundation
                              </div>
                              <div className="flex items-center gap-1 text-blue-600">
                                <Settings className="size-3" />
                                Extensible
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
                    {/* Input */}
                    <div className="modern-input-focus relative overflow-hidden rounded-3xl border border-border bg-surface shadow-lg">
                      <PromptInputTextarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Chat V2 - Source of Truth for AI SDK Migration..."
                        className="resize-none rounded-3xl border-none bg-transparent py-6 pl-6 pr-20 text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-0"
                        disabled={isLoading}
                      />

                      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
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
                          <div className="size-2 rounded-full bg-purple-500"></div>
                          <span>Foundation Ready for AI SDK</span>
                        </div>
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
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}