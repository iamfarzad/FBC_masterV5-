import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Send, Sparkles, User, AlertTriangle, X, Paperclip, Mic, MicOff, Check, Camera, Monitor } from 'lucide-react';
import { UnifiedMessage, UnifiedTypingIndicator, MessageData } from './UnifiedMessage';
import { UnifiedStatusBar, LiveStatusCard } from './UnifiedStreamingControls';
import { MediaSupportChecker } from './MediaSupportChecker';
import { EnhancedStreamingInterface } from './EnhancedStreamingInterface';
import { config } from '@/config/environment';

interface ConversationState {
  stage: string;
  name?: string;
  email?: string;
  companyInfo?: {
    name: string;
    domain: string;
    industry: string;
    insights: string[];
    challenges: string[];
  };
  discoveredChallenges?: string[];
  preferredSolution?: 'training' | 'consulting' | 'both';
  leadScore?: number;
}

interface BookingData {
  name: string;
  email: string;
  company: string;
  message: string;
  selectedDate: Date | null;
  selectedTime: string;
  timezone: string;
}

interface StreamingState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}

interface UnifiedChatInterfaceProps {
  messages: MessageData[];
  conversationState: ConversationState;
  completedBooking?: BookingData | null;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  activeInputMode: 'text' | 'voice' | 'video' | 'screen';
  streamingState: StreamingState;
  partialTranscript: string;
  permissionError?: string | null;
  isRequestingPermission?: boolean;
  showPermissionGuide?: boolean;
  showPrePermissionModal?: boolean;
  pendingMode?: 'voice' | 'video' | 'screen' | null;
  onPermissionModalConfirm?: () => void;
  onPermissionModalCancel?: () => void;
  onSendMessage: (content?: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  onMessageAction: (action: string, messageId: string) => void;
  onModeChange: (mode: 'text' | 'voice' | 'video' | 'screen') => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDismissError?: () => void;
}

export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({
  messages,
  conversationState,
  completedBooking,
  input,
  setInput,
  isLoading,
  activeInputMode,
  streamingState,
  partialTranscript,
  permissionError,
  isRequestingPermission = false,
  showPermissionGuide = false,
  showPrePermissionModal = false,
  pendingMode = null,
  onPermissionModalConfirm,
  onPermissionModalCancel,
  onSendMessage,
  onSuggestionClick,
  onMessageAction,
  onModeChange,
  onFileUpload,
  onDismissError
}) => {
  const [showGeminiInterface, setShowGeminiInterface] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
    // Voice toggle shortcut
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      onModeChange(activeInputMode === 'voice' ? 'text' : 'voice');
    }
    // File upload shortcut
    if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
      e.preventDefault();
      document.getElementById('unified-file-upload')?.click();
    }
  }, [onSendMessage, onModeChange, activeInputMode]);

  // Show Gemini-style interface when streaming is active
  useEffect(() => {
    setShowGeminiInterface(
      streamingState.isConnected && (activeInputMode === 'voice' || activeInputMode === 'video' || activeInputMode === 'screen')
    );
  }, [streamingState.isConnected, activeInputMode]);

  return (
    <>
      {/* Enhanced Streaming Interface Overlay */}
      <AnimatePresence>
        {showGeminiInterface && (
          <EnhancedStreamingInterface
            mode={activeInputMode as 'voice' | 'video' | 'screen'}
            streamingState={{
              ...streamingState,
              connectionQuality: streamingState.isConnected ? 'excellent' : 'disconnected'
            }}
            transcript={partialTranscript}
            onToggleMic={() => {
              // Toggle microphone state
              console.log('Toggling microphone');
            }}
            onToggleCamera={() => {
              // Toggle camera on/off
              console.log('Toggling camera');
            }}
            onTogglePause={() => {
              // Toggle pause/resume
              console.log('Toggling pause/resume');
            }}
            onEndSession={() => onModeChange('text')}
            onFileUpload={onFileUpload}
            onSwitchCamera={() => {
              // Switch between front/back camera
              console.log('Switching camera (front/back)');
            }}
            onToggleFullscreen={() => {
              // Toggle fullscreen mode
              console.log('Toggling fullscreen');
            }}
          />
        )}
      </AnimatePresence>

      {/* Pre-Permission Modal */}
      <AnimatePresence>
        {showPrePermissionModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md"
            >
              <div className="holo-card p-8 rounded-3xl border-2 border-primary/30 bg-card/95 backdrop-blur-xl">
                {/* Icon based on mode */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl holo-card holo-glow-lg flex items-center justify-center">
                    {pendingMode === 'voice' && <Mic className="w-8 h-8 text-primary" />}
                    {pendingMode === 'video' && <Camera className="w-8 h-8 text-primary" />}
                    {pendingMode === 'screen' && <Monitor className="w-8 h-8 text-primary" />}
                  </div>
                </div>

                {/* Title and Description */}
                <div className="text-center space-y-4 mb-8">
                  <h3 className="text-xl font-semibold text-foreground">
                    Enable {pendingMode?.charAt(0).toUpperCase()}{pendingMode?.slice(1)} Mode
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pendingMode === 'voice' && 
                      "Your browser will ask for microphone access. This allows you to speak naturally with the AI assistant."
                    }
                    {pendingMode === 'video' && 
                      "Your browser will ask for camera and microphone access. This enables face-to-face AI conversations."
                    }
                    {pendingMode === 'screen' && 
                      "Your browser will ask to share your screen. This allows the AI to see what you're working on and provide contextual help."
                    }
                  </p>
                  
                  {/* What will happen */}
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mt-4">
                    <div className="text-xs font-medium text-primary mb-2">What happens next:</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        <span>Browser permission popup appears</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        <span>Click "Allow" to enable {pendingMode} features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        <span>Start your AI-powered {pendingMode} session</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={onPermissionModalCancel}
                      variant="outline"
                      className="w-full h-12 rounded-2xl modern-button holo-border hover:holo-glow"
                    >
                      Maybe Later
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={onPermissionModalConfirm}
                      className="w-full h-12 rounded-2xl modern-button bg-primary text-primary-foreground holo-glow-lg"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      I'm Ready
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Chat Interface */}
      <div className={`flex h-full flex-col bg-gradient-to-br from-background via-background to-muted/30 relative ${showGeminiInterface ? 'hidden' : ''}`}>
        {/* Permission Guide - First Time Users */}
        <AnimatePresence>
          {showPermissionGuide && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="border-b border-blue-500/20 bg-blue-500/10 backdrop-blur-lg p-4"
            >
              <div className="flex items-start justify-center max-w-4xl mx-auto gap-4">
                <div className="flex items-start gap-3 flex-1 text-center">
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">🎤 Voice Mode Activated</p>
                      <p className="text-xs text-blue-600/80 leading-relaxed">
                        Your browser will ask for microphone permission. Please click "Allow" when prompted to enable voice features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permission Error Banner */}
        <AnimatePresence>
          {permissionError && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="border-b border-destructive/20 bg-destructive/10 backdrop-blur-lg p-4"
            >
              <div className="flex items-start justify-between max-w-4xl mx-auto gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-destructive mb-1">Permission Required</p>
                      <p className="text-xs text-destructive/80 leading-relaxed whitespace-pre-line">{permissionError}</p>
                    </div>
                    
                    {/* Debug Information */}
                    <div className="bg-muted/20 border border-muted/20 rounded-lg p-3 mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">🔧 Debug Info:</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Mode: <code className="bg-muted/30 px-1 rounded">{activeInputMode}</code></div>
                        <div>Browser: <code className="bg-muted/30 px-1 rounded">{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}</code></div>
                        <div>HTTPS: <code className="bg-muted/30 px-1 rounded">{typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'Yes' : 'No'}</code></div>
                        <div>Media Support: <code className="bg-muted/30 px-1 rounded">{navigator.mediaDevices ? 'Yes' : 'No'}</code></div>
                        <div>getUserMedia: <code className="bg-muted/30 px-1 rounded">{navigator.mediaDevices?.getUserMedia ? 'Yes' : 'No'}</code></div>
                      </div>
                    </div>
                    
                    {/* Helpful Instructions */}
                    {permissionError.toLowerCase().includes('permission') && (
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                        <p className="text-xs font-medium text-destructive mb-2">🔧 How to fix this:</p>
                        <div className="text-xs text-destructive/80 space-y-1">
                          <p>1. Look for the 🔒 or 🎤 icon in your browser's address bar</p>
                          <p>2. Click it and select "Allow" for microphone/camera permissions</p>
                          <p>3. Refresh the page if needed and try again</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Chrome:</strong> Click the 🔒 → Site settings → Camera/Microphone → Allow
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <MediaSupportChecker />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Clear error and retry permission request
                      console.log('🔄 User clicked Try Again - retrying permissions...');
                      if (onDismissError) {
                        onDismissError(); // Clear the error first
                      }
                      // Small delay to ensure error is cleared, then retry
                      setTimeout(() => {
                        console.log(`🎯 Retrying ${activeInputMode} mode...`);
                        onModeChange(activeInputMode); // Try the same mode again
                      }, 200);
                    }}
                    className="h-8 px-3 rounded-lg text-xs border-primary/30 text-primary hover:bg-primary/10"
                  >
                    🔄 Try Again
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="h-8 px-3 rounded-lg text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                  >
                    Refresh Page
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModeChange('text')}
                    className="h-8 px-3 rounded-lg text-xs border-muted-foreground/30 text-muted-foreground hover:bg-muted/10"
                  >
                    Use Text Mode
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDismissError || (() => {})}
                    className="h-8 px-3 rounded-lg text-xs border-green-500/30 text-green-600 hover:bg-green-500/10"
                  >
                    Hide
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Status Bar */}
        <UnifiedStatusBar
          activeInputMode={activeInputMode}
          streamingState={streamingState}
          onEndSession={() => onModeChange('text')}
        />

        {/* Messages Area */}
        <div className="scrollbar-modern flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-4xl space-y-8">
            {messages.length === 0 && !isLoading ? (
              <div className="animate-smooth-fade-in space-y-8 py-16 text-center">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="mx-auto mb-6 flex size-16 animate-modern-pulse items-center justify-center rounded-2xl bg-primary">
                      <Sparkles className="size-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -inset-2 animate-modern-pulse rounded-3xl bg-primary/20 opacity-50 blur-xl"></div>
                  </div>
                  <h1 className="text-gradient mb-2 text-3xl font-bold">What can we build together?</h1>
                  <p className="mx-auto max-w-md text-lg text-muted-foreground">
                    Let's discover how AI can transform your business
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Partial Transcript Display */}
                <AnimatePresence>
                  {partialTranscript && !showGeminiInterface && (
                    <motion.div 
                      key="partial-transcript"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-end"
                    >
                      <div className="flex max-w-2xl gap-4">
                        <div className="flex flex-1 flex-col items-end">
                          <div className="mb-2 text-right text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                            <span>You • Live transcription</span>
                          </div>
                          <div className="max-w-full rounded-2xl rounded-tr-md bg-muted/30 border border-blue-400/20 px-6 py-4 scan-line backdrop-blur-sm">
                            <p className="text-sm leading-relaxed text-muted-foreground italic">
                              {partialTranscript}
                              <motion.span 
                                className="ml-2 text-blue-400"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                ▋
                              </motion.span>
                            </p>
                          </div>
                        </div>
                        <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
                          <User className="size-5 text-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages */}
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className="animate-smooth-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <UnifiedMessage
                      message={message}
                      onSuggestionClick={onSuggestionClick}
                      onMessageAction={onMessageAction}
                      onPlayMessage={() => {}}
                      onStopMessage={() => {}}
                      conversationState={conversationState}
                      completedBooking={completedBooking}
                    />
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <UnifiedTypingIndicator assistantName="F.B/c AI Assistant" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Removed floating LiveStatusCard - keeping layout clean */}

        {/* Unified Input Area */}
        <div className="border-t border-border bg-card/90 p-6 backdrop-blur-lg">
          <div className="mx-auto max-w-4xl">
            <div className="modern-input-focus relative overflow-hidden rounded-3xl border border-border bg-background shadow-lg">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeInputMode === 'voice' ? "Voice mode active - speak or type..." :
                  activeInputMode === 'video' ? "Video mode active - show and tell..." :
                  activeInputMode === 'screen' ? "Screen sharing active - show me what you're working on..." :
                  "Ask about AI for your business..."
                }
                className="resize-none rounded-3xl border-none bg-transparent py-6 pl-20 pr-32 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                disabled={isLoading}
              />

              {/* Left Controls */}
              <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {/* Voice Toggle - Primary Control */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onModeChange(activeInputMode === 'voice' ? 'text' : 'voice')}
                        className={`modern-button size-11 rounded-full p-0 transition-all duration-300 ${
                          activeInputMode === 'voice'
                            ? 'text-primary holo-card holo-glow bg-primary/5 border-primary/30 scan-line'
                            : isRequestingPermission || showPermissionGuide
                            ? 'text-blue-500 holo-card bg-blue-500/10 border-blue-500/30 animate-pulse'
                            : 'text-muted-foreground hover:text-primary hover:holo-glow holo-card hover:bg-primary/5'
                        }`}
                        disabled={isLoading || isRequestingPermission}
                      >
                        <AnimatePresence mode="wait">
                          {activeInputMode === 'voice' ? (
                            <motion.div
                              key="mic-active"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <Mic className="size-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="mic-inactive"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <MicOff className="size-5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Enhanced Active Indicator */}
                        {activeInputMode === 'voice' && (
                          <>
                            <div className="absolute inset-0 rounded-full">
                              <div className="absolute inset-1 rounded-full border border-primary/20 animate-modern-pulse" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background">
                              <div className="w-full h-full bg-primary rounded-full animate-pulse" />
                            </div>
                          </>
                        )}

                        {/* Audio Level Indicator */}
                        {activeInputMode === 'voice' && streamingState.isListening && (
                          <div className="absolute inset-0 rounded-full pointer-events-none">
                            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="holo-card">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium">
                        {isRequestingPermission 
                          ? 'Requesting Permissions...' 
                          : activeInputMode === 'voice' 
                          ? 'Voice Active' 
                          : 'Enable Voice'
                        }
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isRequestingPermission
                          ? 'Please allow microphone access'
                          : activeInputMode === 'voice' 
                          ? 'Speaking mode enabled' 
                          : 'Click to start voice input'
                        }
                      </span>
                      {!isRequestingPermission && (
                        <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded border">⌘+M</kbd>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* File Upload - Secondary Control */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <input
                        type="file"
                        id="unified-file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={onFileUpload}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        multiple
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="modern-button size-9 rounded-full p-0 text-muted-foreground hover:text-primary hover:holo-glow holo-card hover:bg-primary/5 transition-all duration-200"
                        asChild
                      >
                        <label htmlFor="unified-file-upload" className="cursor-pointer flex items-center justify-center">
                          <Paperclip className="size-4" />
                        </label>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="holo-card">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium">Upload Files</span>
                      <span className="text-xs text-muted-foreground">Images, PDFs, Documents</span>
                      <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded border">⌘+U</kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Right Controls */}
              <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {/* Advanced Mode Controls */}
                <div className="flex items-center gap-1">
                  {/* Video Mode */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => onModeChange('video')}
                          variant="ghost"
                          size="sm"
                          className={`modern-button size-9 rounded-full p-0 transition-all duration-200 ${
                            activeInputMode === 'video'
                              ? 'holo-card holo-glow text-foreground scan-line bg-primary/10 border-primary/20'
                              : 'holo-card text-muted-foreground hover:text-foreground hover:holo-glow hover:bg-primary/5'
                          }`}
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          
                          {/* Active Indicator */}
                          {activeInputMode === 'video' && (
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full">
                              <div className="w-full h-full bg-primary rounded-full animate-modern-pulse" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="holo-card">
                      <div className="text-center">
                        <div className="font-medium">Video Mode</div>
                        <div className="text-xs text-muted-foreground">Camera + Microphone</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Screen Share Mode */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => onModeChange('screen')}
                          variant="ghost"
                          size="sm"
                          className={`modern-button size-9 rounded-full p-0 transition-all duration-200 ${
                            activeInputMode === 'screen'
                              ? 'holo-card holo-glow text-foreground scan-line bg-primary/10 border-primary/20'
                              : 'holo-card text-muted-foreground hover:text-foreground hover:holo-glow hover:bg-primary/5'
                          }`}
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeWidth={2}/>
                            <line x1="8" y1="21" x2="16" y2="21" strokeWidth={2}/>
                            <line x1="12" y1="17" x2="12" y2="21" strokeWidth={2}/>
                          </svg>
                          
                          {/* Active Indicator */}
                          {activeInputMode === 'screen' && (
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full">
                              <div className="w-full h-full bg-primary rounded-full animate-modern-pulse" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="holo-card">
                      <div className="text-center">
                        <div className="font-medium">Screen Share</div>
                        <div className="text-xs text-muted-foreground">Share your screen</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Mode Indicator Badge */}
                {activeInputMode !== 'text' && activeInputMode !== 'voice' && (
                  <Badge variant="outline" className="text-xs holo-border bg-transparent">
                    {activeInputMode === 'video' && '📹 Video'}
                    {activeInputMode === 'screen' && '🖥️ Screen'}
                  </Badge>
                )}
                
                {/* Send Button */}
                {(input.trim() || activeInputMode !== 'text') && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => onSendMessage()}
                      size="sm"
                      className="modern-button size-10 rounded-full bg-primary p-0 text-primary-foreground shadow-lg hover:bg-primary/90 holo-glow"
                      disabled={isLoading}
                    >
                      <Send className="size-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center space-y-1">
            {config.isDemoMode && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-xs holo-border bg-transparent">
                  Demo Mode
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Connect Gemini API for full functionality
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              F.B/c AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};