'use client'

import React, { useState } from 'react'
import { cn } from '@/src/core/utils'
import { Button } from '@/components/ui/button'
import { MessageCircle, Plus, Settings, User, Sparkles } from 'lucide-react'

// Modern Chat Design Template - Ready for your Figma specifications
interface NewChatDesignProps {
  className?: string
}

export function NewChatDesign({ className }: NewChatDesignProps) {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className={cn(
      "flex h-screen bg-gradient-to-br from-background via-background/95 to-muted/30",
      className
    )}>
      {/* LEFT SIDEBAR - Modern Design */}
      <div className="w-80 bg-card/50 backdrop-blur-xl border-r border-border/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-hover rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">F.B/c AI</h1>
              <p className="text-xs text-muted-foreground">AI Consultant</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <Button 
            variant={activeTab === 'chat' ? 'default' : 'ghost'}
            className="w-full justify-start gap-3 h-12"
            onClick={() => setActiveTab('chat')}
          >
            <MessageCircle className="w-5 h-5" />
            Chat
          </Button>
          <Button 
            variant="ghost"
            className="w-full justify-start gap-3 h-12"
          >
            <Plus className="w-5 h-5" />
            New Conversation
          </Button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Conversations</h3>
          {/* Conversation items would go here */}
          <div className="space-y-1">
            <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <p className="text-sm font-medium text-foreground truncate">AI Strategy Discussion</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <p className="text-sm font-medium text-foreground truncate">ROI Calculator Session</p>
              <p className="text-xs text-muted-foreground">Yesterday</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border/10">
          <Button variant="ghost" className="w-full justify-start gap-3 h-12">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12">
            <User className="w-5 h-5" />
            Profile
          </Button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 bg-background/80 backdrop-blur-xl border-b border-border/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Online • Ready to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome Message */}
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-brand/20 to-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to F.B/c AI</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                I'm here to help with AI strategy, business automation, and technical consulting. How can I assist you today?
              </p>
            </div>

            {/* Sample Messages */}
            <div className="space-y-4">
              {/* AI Message */}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl rounded-tl-md p-4 shadow-sm">
                    <p className="text-foreground leading-relaxed">
                      Hello! I'm your AI consultant specializing in business automation and strategy. I can help you with ROI calculations, process optimization, and AI implementation planning. What would you like to explore today?
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-1">Just now</p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-gradient-to-r from-brand to-brand-hover rounded-2xl rounded-tr-md p-4 shadow-sm">
                    <p className="text-white leading-relaxed">
                      I'm interested in implementing AI automation for my customer service team. Can you help me calculate the potential ROI?
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 mr-1 text-right">2 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-background/80 backdrop-blur-xl border-t border-border/20 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl p-4 shadow-sm focus-within:shadow-md focus-within:border-brand/30 transition-all">
                <textarea
                  placeholder="Ask about AI strategy, ROI calculations, or automation opportunities..."
                  className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground min-h-[20px] max-h-32"
                  rows={1}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-brand to-brand-hover hover:from-brand-hover hover:to-brand">
                    Send
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              F.B/c AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}