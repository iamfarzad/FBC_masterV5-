import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Textarea } from './components/ui/textarea';
import { Mic, MicOff, Send, Camera, Monitor, Sparkles } from 'lucide-react';

// Simple design test to verify the holographic design system is working
export default function DesignTest() {
  const [activeMode, setActiveMode] = useState<'text' | 'voice' | 'video' | 'screen'>('text');
  const [input, setInput] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/90 backdrop-blur-lg p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary holo-glow">
                <Sparkles className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-gradient text-xl font-semibold">AI Lead Generation System</h1>
                <p className="text-sm text-muted-foreground">Holographic Design System Test</p>
              </div>
            </div>
            <Badge variant="outline" className="holo-border bg-transparent">
              Design Preview
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-120px)] flex-col">
        {/* Messages Area */}
        <div className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Welcome Message */}
            <div className="animate-smooth-fade-in space-y-6 py-8 text-center">
              <div className="relative">
                <div className="mx-auto mb-6 flex size-16 animate-modern-pulse items-center justify-center rounded-2xl bg-primary">
                  <Sparkles className="size-8 text-primary-foreground" />
                </div>
                <div className="absolute -inset-2 animate-modern-pulse rounded-3xl bg-primary/20 opacity-50 blur-xl"></div>
              </div>
              <h1 className="text-gradient mb-2 text-3xl font-bold">Design System Test</h1>
              <p className="mx-auto max-w-md text-lg text-muted-foreground">
                Testing the holographic design components and interactions
              </p>
            </div>

            {/* Sample Messages */}
            <div className="space-y-6">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="flex max-w-2xl gap-4">
                  <div className="flex flex-1 flex-col items-end">
                    <div className="mb-2 text-right text-sm text-muted-foreground">
                      You • Test message
                    </div>
                    <div className="max-w-full rounded-2xl rounded-tr-md bg-primary px-6 py-4 text-primary-foreground">
                      <p className="text-sm leading-relaxed">
                        Hello! I'd like to test the AI lead generation system. Can you show me how the holographic design works?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="flex max-w-2xl gap-4">
                  <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
                    <Sparkles className="size-5 text-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="mb-2 text-sm text-muted-foreground">
                      AI Assistant • Design Test Response
                    </div>
                    <div className="holo-card rounded-2xl rounded-tl-md px-6 py-4 backdrop-blur-sm">
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed">
                          🚀 <strong>Perfect!</strong> The holographic design system is working beautifully. Here's what you're seeing:
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-primary"></div>
                            <span>Holographic cards with backdrop blur effects</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-primary"></div>
                            <span>Animated glow effects and scan lines</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-primary"></div>
                            <span>Smooth animations and micro-interactions</span>
                          </div>
                        </div>

                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                          <p className="text-xs font-medium text-primary mb-1">✨ Design Status:</p>
                          <p className="text-xs text-muted-foreground">All holographic elements are rendering correctly!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card/90 p-6 backdrop-blur-lg">
          <div className="mx-auto max-w-4xl">
            <div className="modern-input-focus relative overflow-hidden rounded-3xl border border-border bg-background shadow-lg">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeMode === 'voice' ? "Voice mode active - speak or type..." :
                  activeMode === 'video' ? "Video mode active - show and tell..." :
                  activeMode === 'screen' ? "Screen sharing active - show me what you're working on..." :
                  "Type your message to test the interface..."
                }
                className="resize-none rounded-3xl border-none bg-transparent py-6 pl-20 pr-32 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0"
              />

              {/* Left Controls */}
              <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {/* Voice Toggle */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveMode(activeMode === 'voice' ? 'text' : 'voice')}
                    className={`modern-button size-11 rounded-full p-0 transition-all duration-300 ${
                      activeMode === 'voice'
                        ? 'text-primary holo-card holo-glow bg-primary/5 border-primary/30 scan-line'
                        : 'text-muted-foreground hover:text-primary hover:holo-glow holo-card hover:bg-primary/5'
                    }`}
                  >
                    {activeMode === 'voice' ? (
                      <Mic className="size-5" />
                    ) : (
                      <MicOff className="size-5" />
                    )}
                    
                    {/* Active Indicator */}
                    {activeMode === 'voice' && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background">
                        <div className="w-full h-full bg-primary rounded-full animate-pulse" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Right Controls */}
              <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {/* Mode Controls */}
                <div className="flex items-center gap-1">
                  {/* Video Mode */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setActiveMode('video')}
                      variant="ghost"
                      size="sm"
                      className={`modern-button size-9 rounded-full p-0 transition-all duration-200 ${
                        activeMode === 'video'
                          ? 'holo-card holo-glow text-foreground scan-line bg-primary/10 border-primary/20'
                          : 'holo-card text-muted-foreground hover:text-foreground hover:holo-glow hover:bg-primary/5'
                      }`}
                    >
                      <Camera className="size-4" />
                      {activeMode === 'video' && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full">
                          <div className="w-full h-full bg-primary rounded-full animate-modern-pulse" />
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  {/* Screen Share Mode */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setActiveMode('screen')}
                      variant="ghost"
                      size="sm"
                      className={`modern-button size-9 rounded-full p-0 transition-all duration-200 ${
                        activeMode === 'screen'
                          ? 'holo-card holo-glow text-foreground scan-line bg-primary/10 border-primary/20'
                          : 'holo-card text-muted-foreground hover:text-foreground hover:holo-glow hover:bg-primary/5'
                      }`}
                    >
                      <Monitor className="size-4" />
                      {activeMode === 'screen' && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full">
                          <div className="w-full h-full bg-primary rounded-full animate-modern-pulse" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {/* Mode Indicator Badge */}
                {activeMode !== 'text' && (
                  <Badge variant="outline" className="text-xs holo-border bg-transparent">
                    {activeMode === 'voice' && '🎤 Voice'}
                    {activeMode === 'video' && '📹 Video'} 
                    {activeMode === 'screen' && '🖥️ Screen'}
                  </Badge>
                )}
                
                {/* Send Button */}
                {input.trim() && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setInput('')}
                      size="sm"
                      className="modern-button size-10 rounded-full bg-primary p-0 text-primary-foreground shadow-lg hover:bg-primary/90 holo-glow"
                    >
                      <Send className="size-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Status Info */}
            <div className="mt-4 text-center space-y-1">
              <Badge variant="outline" className="text-xs holo-border bg-transparent">
                Design System Status: All Components Active
              </Badge>
              <p className="text-xs text-muted-foreground">
                Holographic effects • Animations • Interactive controls
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}