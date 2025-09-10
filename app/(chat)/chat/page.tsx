"use client"

// Line by line implementation using your exact Figma App.tsx
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useAIElementsSystem } from '@/components/ai-elements/ai-system';

import { UnifiedControlPanel } from '@/components/UnifiedControlPanel';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { LoadingIndicator } from '@/components/indicators/LoadingIndicator';
import { CleanInputField } from '@/components/input/CleanInputField';

import { SettingsOverlay } from '@/components/overlays/SettingsOverlay';
import { FileUploadOverlay } from '@/components/overlays/FileUploadOverlay';
import { UnifiedCanvasSystem } from '@/components/UnifiedCanvasSystem';

import { CalendarBookingOverlay } from '@/components/chat/CalendarBookingOverlay';
import { UnifiedMessage, MessageData } from '@/components/chat/UnifiedMessage';
import { SpeechToSpeechPopover } from '@/components/chat/SpeechToSpeechPopover';
import { WebcamInterface } from '@/components/chat/WebcamInterface';
import { ScreenShareInterface } from '@/components/chat/ScreenShareInterface';
import { UnifiedMultimodalWidget } from '@/components/chat/UnifiedMultimodalWidget';
import { StageRail } from '@/components/chat/StageRail';

import { useAppState } from '@/hooks/useAppState';

const AI_RESPONSES = [
  "Thank you for sharing that. Based on your industry, I can already see several AI opportunities. What's your biggest operational challenge right now?",
  "Great! Your business profile shows strong potential for AI implementation. What specific goals are you hoping to achieve this year?",
  "That's helpful context. Could you share your email so I can send you a personalized AI assessment after our conversation?",
  "Perfect! I'm building a comprehensive understanding of your needs. What's driving your interest in AI - competitive pressure or growth opportunities?"
];

const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Main ChatPage Component (exactly as in your Figma App.tsx)
export default function ChatPage() {
  // Use centralized state management
  const {
    state,
    updateState,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    handleSendMessage
  } = useAppState();

  // AI Elements system hook
  const {
    systemState,
    updateSystem,
    activateCapability,
    advanceStage
  } = useAIElementsSystem();

  // Update AI system when messages change
  React.useEffect(() => {
    updateSystem(state.messages);
  }, [state.messages, updateSystem]);

  // Multimodal widgets management
  const multimodalWidgets = React.useMemo(() => {
    const widgets = [];
    
    if (state.showVoiceOverlay && state.isVoiceMinimized) {
      widgets.push({
        id: 'voice',
        type: 'voice' as const,
        title: 'Voice AI',
        status: state.voiceMode ? 'Active' : 'Ready',
        isActive: state.voiceMode,
        data: {
          isRecording: false,
          aiState: 'idle' as const
        }
      });
    }
    
    if (state.showWebcamInterface && state.isWebcamMinimized) {
      widgets.push({
        id: 'webcam',
        type: 'webcam' as const,
        title: 'Video Call',
        status: 'Connected',
        isActive: true,
        data: {
          facingMode: state.cameraFacing,
          insightCount: 0,
          confidence: 85
        }
      });
    }
    
    if (state.showScreenShareInterface && state.isScreenShareMinimized) {
      widgets.push({
        id: 'screen',
        type: 'screen' as const,
        title: 'Screen Share',
        status: 'Sharing',
        isActive: true,
        data: {
          analysisProgress: 65
        }
      });
    }
    
    return widgets;
  }, [
    state.showVoiceOverlay, 
    state.isVoiceMinimized, 
    state.voiceMode,
    state.showWebcamInterface, 
    state.isWebcamMinimized,
    state.cameraFacing,
    state.showScreenShareInterface, 
    state.isScreenShareMinimized
  ]);

  // Event handlers
  const handleGeneratePDF = useCallback(() => {
    activateCapability('pdf-generation');
  }, [activateCapability]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    updateState({ 
      input: suggestion,
      isUserScrolling: false
    });
    setTimeout(() => handleSendMessage(), 100);
  }, [handleSendMessage, updateState]);

  const handleToolSelect = useCallback((toolId: string) => {
    if (state.activeTools.includes(toolId)) {
      updateState({ 
        activeTools: state.activeTools.filter(t => t !== toolId) 
      });
    } else if (toolId === 'docs') {
      updateState({ showFileUpload: true });
      activateCapability('document-analysis');
    } else if (toolId === 'webcam') {
      updateState({ showWebcamInterface: true });
      activateCapability('real-time-processing');
    } else if (toolId === 'screen') {
      updateState({ showScreenShareInterface: true });
      activateCapability('image-processing');
    } else {
      updateState({ activeCanvasTool: toolId });
      switch (toolId) {
        case 'research':
          activateCapability('source-citation');
          activateCapability('web-preview');
          break;
        case 'workshop':
          activateCapability('adaptive-learning');
          break;
      }
    }
  }, [state.activeTools, activateCapability, updateState]);

  const handleVoiceComplete = useCallback((transcript: string) => {
    updateState({ 
      showVoiceOverlay: false,
      isVoiceMinimized: false,
      input: transcript,
      isUserScrolling: false
    });
    
    if (transcript.trim()) {
      activateCapability('real-time-processing');
      activateCapability('adaptive-learning');
      setTimeout(() => handleSendMessage(), 100);
    }
  }, [handleSendMessage, activateCapability, updateState]);

  // Widget handlers
  const handleWidgetExpand = useCallback((widgetId: string) => {
    const updates: any = {};
    switch (widgetId) {
      case 'voice':
        updates.isVoiceMinimized = false;
        break;
      case 'webcam':
        updates.isWebcamMinimized = false;
        break;
      case 'screen':
        updates.isScreenShareMinimized = false;
        break;
    }
    updateState(updates);
  }, [updateState]);

  const handleWidgetClose = useCallback((widgetId: string) => {
    const updates: any = {};
    switch (widgetId) {
      case 'voice':
        updates.showVoiceOverlay = false;
        updates.isVoiceMinimized = false;
        updates.voiceMode = false;
        break;
      case 'webcam':
        updates.showWebcamInterface = false;
        updates.isWebcamMinimized = false;
        break;
      case 'screen':
        updates.showScreenShareInterface = false;
        updates.isScreenShareMinimized = false;
        break;
    }
    updateState(updates);
  }, [updateState]);

  // Step 25: Render with message rendering (exactly from your App.tsx line 304-424)
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* Unified Control Panel */}
        <UnifiedControlPanel
          voiceMode={state.voiceMode}
          leadScore={state.conversationState.leadScore}
          conversationStarted={state.messages.length > 1}
          currentStageIndex={systemState.stageProgress.current}
          exploredCount={systemState.capabilityUsage.used}
          totalCapabilities={systemState.capabilityUsage.total}
          systemState={systemState}
          onGeneratePDF={handleGeneratePDF}
          onShowBooking={() => updateState({ showBookingOverlay: true })}
          onShowSettings={() => updateState({ showSettingsOverlay: true })}
          onShowVoiceOverlay={() => updateState({ showVoiceOverlay: true })}
        />

        {/* Stage Rail */}
        <StageRail
          currentStageIndex={systemState.stageProgress.current}
          conversationStarted={state.messages.length > 1}
          exploredCount={systemState.capabilityUsage.used}
          totalCapabilities={systemState.capabilityUsage.total}
        />

        {/* Main Content with Auto-Scroll (exactly from your App.tsx line 330-424) */}
        <main 
          ref={messagesContainerRef}
          className="max-w-4xl mx-auto px-6 py-24 pb-40 overflow-y-auto" 
          role="main"
          onScroll={handleScroll}
          style={{ 
            maxHeight: 'calc(100vh - 8rem)',
            scrollBehavior: 'smooth'
          }}
        >
          {state.messages.length === 0 && !state.isLoading ? (
            <WelcomeScreen />
          ) : (
            <div className="space-y-8">
              {/* Message rendering (exactly from your App.tsx line 345-367) */}
              {state.messages.map((message, index) => (
                <motion.div 
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index === state.messages.length - 1 ? 0.1 : 0,
                    ease: "easeOut" 
                  }}
                >
                  <UnifiedMessage
                    message={message}
                    onSuggestionClick={handleSuggestionClick}
                    onMessageAction={(action, messageId) => {
                      console.log('Action:', action, messageId);
                    }}
                    onPlayMessage={() => {}}
                    onStopMessage={() => {}}
                    conversationState={state.conversationState}
                  />
                </motion.div>
              ))}

              {/* Loading indicator (exactly from your App.tsx line 369-377) */}
              {state.isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoadingIndicator />
                </motion.div>
              )}

              {/* Invisible scroll target (exactly from your App.tsx line 379-380) */}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}

          {/* Scroll to Bottom Button (exactly from your App.tsx line 385-423) */}
          <AnimatePresence>
            {state.isUserScrolling && state.messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-32 right-8 z-30"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => {
                          updateState({ isUserScrolling: false });
                          scrollToBottom();
                        }}
                        size="sm"
                        className="h-10 w-10 rounded-full glass-button bg-primary/10 hover:bg-primary/20 text-primary shadow-lg"
                        aria-label="Scroll to bottom"
                      >
                        <motion.div
                          animate={{ y: [0, 2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m7 13 5 5 5-5M7 6l5 5 5-5"/>
                          </svg>
                        </motion.div>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Scroll to latest message</TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Input Field (exactly from your App.tsx line 427-438) */}
        <CleanInputField
          input={state.input}
          setInput={(value) => updateState({ input: value })}
          onSubmit={handleSendMessage}
          isLoading={state.isLoading}
          voiceMode={state.voiceMode}
          onToggleVoice={() => updateState({ voiceMode: !state.voiceMode })}
          onShowVoiceOverlay={() => updateState({ showVoiceOverlay: true })}
          onToolSelect={handleToolSelect}
          onShowSettings={() => updateState({ showSettingsOverlay: true })}
          activeTools={state.activeTools}
        />
      </div>
    </DndProvider>
  );
}