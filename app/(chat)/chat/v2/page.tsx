"use client"

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedChat } from '@/hooks/useUnifiedChat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Brain, 
  Send, 
  Mic, 
  Plus,
  Settings,
  Calendar,
  FileText,
  User
} from 'lucide-react';

// Chat V2 with AI SDK Integration
export default function ChatV2() {
  const [input, setInput] = useState('')

  // Use your existing unified chat hook with AI SDK backend
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    addMessage,
    clearMessages
  } = useUnifiedChat({
    sessionId: 'v2-session',
    mode: 'standard',
    onMessage: (message) => {
      console.log('[AI_SDK_V2] Message received:', message.content.slice(0, 50) + '...')
    },
    onError: (error) => {
      console.error('[AI_SDK_V2] Error:', error)
    }
  });

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    try {
      await sendMessage(message);
    } catch (err) {
      console.error('[AI_SDK_V2] Send failed:', err);
    }
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-surface/95 backdrop-blur">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center">
              <Brain className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="font-semibold text-text">F.B/c AI V2</h1>
              <p className="text-sm text-text-muted">AI SDK Connected</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-elevated rounded-lg p-4">
              <h3 className="font-medium text-text mb-2">Connection Status</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isLoading ? 'bg-blue-500 animate-pulse' : 
                  error ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm text-text-muted">
                  {isLoading ? 'Processing...' : error ? 'Error' : 'Ready'}
                </span>
              </div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-4">
              <h3 className="font-medium text-text mb-2">Pipeline Status</h3>
              <div className="space-y-2 text-sm text-text-muted">
                <div className="flex justify-between">
                  <span>Messages:</span>
                  <span>{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>API:</span>
                  <Badge variant="secondary" className="text-xs">AI SDK</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Backend:</span>
                  <Badge variant="secondary" className="text-xs">Unified</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => console.log('Settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => console.log('Calendar')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Call
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => console.log('Generate Report')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-surface/95 backdrop-blur p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand" />
              <div>
                <h2 className="font-semibold text-text">Chat V2 - Source of Truth</h2>
                <p className="text-sm text-text-muted">Complete pipeline connected to AI SDK</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-brand text-surface">
                V2 SoT
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                AI SDK
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center shadow-lg">
                    <Brain className="w-10 h-10 text-surface" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-text mb-2">Chat V2 - Source of Truth</h3>
                    <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                      Your complete pipeline is now connected to AI SDK. All your original features 
                      (intelligence, multimodal, voice, admin) are preserved and enhanced.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-surface border-border">
                      <Brain className="w-3 h-3 mr-1" />
                      Intelligence
                    </Badge>
                    <Badge variant="outline" className="bg-surface border-border">
                      <Mic className="w-3 h-3 mr-1" />
                      Voice
                    </Badge>
                    <Badge variant="outline" className="bg-surface border-border">
                      <Settings className="w-3 h-3 mr-1" />
                      Multimodal
                    </Badge>
                  </div>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3 mt-1">
                        <Sparkles className="w-4 h-4 text-brand" />
                      </div>
                    )}
                    
                    <div className={`max-w-2xl rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-brand text-surface' 
                        : 'bg-surface-elevated border border-border'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-surface/70' : 'text-text-muted'
                      }`}>
                        {message.timestamp ? message.timestamp.toLocaleTimeString() : 'Now'}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center ml-3 mt-1">
                        <User className="w-4 h-4 text-text" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center mr-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4 text-brand" />
                  </motion.div>
                </div>
                <div className="bg-surface-elevated border border-border rounded-lg p-4">
                  <div className="text-sm text-text-muted">AI is thinking...</div>
                  <div className="flex items-center gap-1 mt-2">
                    {[0, 0.2, 0.4].map((delay, index) => (
                      <motion.div
                        key={index}
                        className="w-1.5 h-1.5 bg-brand rounded-full"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          delay: delay,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
              >
                <div className="text-sm text-red-600">
                  Error: {error.message}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-surface/95 backdrop-blur p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-surface border border-border rounded-3xl shadow-lg">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Your complete pipeline + AI SDK)"
                className="w-full resize-none border-0 bg-transparent py-4 pl-16 pr-20 focus:outline-none focus:ring-0 placeholder:text-text-muted"
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '56px' }}
              />

              {/* Left Controls */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full text-text-muted hover:text-brand"
                  disabled={isLoading}
                  onClick={() => console.log('Tools menu')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Right Controls */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full text-text-muted hover:text-brand"
                  disabled={isLoading}
                  onClick={() => console.log('Voice input')}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                
                <AnimatePresence>
                  {input.trim() && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full bg-brand hover:bg-brand-hover text-surface"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-text-muted">
                Chat V2 - Your complete pipeline connected to AI SDK
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}