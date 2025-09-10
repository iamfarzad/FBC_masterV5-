"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Import AI Elements system
import { useAIElementsSystem } from '@/components/ai-elements/ai-system';

// Import extracted components
import { UnifiedControlPanel } from '@/components/UnifiedControlPanel';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { LoadingIndicator } from '@/components/indicators/LoadingIndicator';
import { CleanInputField } from '@/components/input/CleanInputField';

// Import overlays
import { SettingsOverlay } from '@/components/overlays/SettingsOverlay';
import { FileUploadOverlay } from '@/components/overlays/FileUploadOverlay';
import { UnifiedCanvasSystem } from '@/components/UnifiedCanvasSystem';

// Import existing components
import { CalendarBookingOverlay } from '@/components/chat/CalendarBookingOverlay';
import { UnifiedMessage, MessageData } from '@/components/chat/UnifiedMessage';
import { SpeechToSpeechPopover } from '@/components/SpeechToSpeechPopover';
import { WebcamInterface } from '@/components/chat/WebcamInterface';
import { ScreenShareInterface } from '@/components/chat/ScreenShareInterface';
import { UnifiedMultimodalWidget } from '@/components/chat/UnifiedMultimodalWidget';
import { StageRail } from '@/components/chat/StageRail';

// Import hooks and utilities
import { useAppState } from '@/hooks/useAppState';
import { AI_RESPONSES, generateMessageId } from '@/constants/appConstants';

// ChatMessages Component - Center content
const ChatMessages = React.memo<{
  messages: MessageData[];
  isLoading: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isUserScrolling: boolean;
  conversationState: any;
  handleScroll: () => void;
  handleSuggestionClick: (suggestion: string) => void;
  scrollToBottom: () => void;
  updateState: (updates: any) => void;
  isMounted: boolean;
}>(({
  messages,
  isLoading,
  messagesContainerRef,
  messagesEndRef,
  isUserScrolling,
  conversationState,
  handleScroll,
  handleSuggestionClick,
  scrollToBottom,
  updateState,
  isMounted
}) => {
  return (
    <main 
      ref={messagesContainerRef}
      className="flex-1 max-w-4xl mx-auto px-6 py-24 pb-40 overflow-y-auto" 
      role="main"
      onScroll={handleScroll}
      style={{ 
        maxHeight: 'calc(100vh - 8rem)',
        scrollBehavior: 'smooth'
      }}
    >
      {messages.length === 0 && !isLoading ? (
        <WelcomeScreen />
      ) : (
        <div className="space-y-8">
          {messages.map((message, index) => (
            <motion.div 
              key={message.id}
              initial={isMounted ? { opacity: 0, y: 20 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.4, 
                delay: index === messages.length - 1 ? 0.1 : 0,
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
                conversationState={conversationState}
              />
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={isMounted ? { opacity: 0, y: 20 } : false}
              animate={isMounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3 }}
            >
              <LoadingIndicator />
            </motion.div>
          )}

          {/* Invisible scroll target */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      )}

      {/* Scroll to Bottom Button */}
      {isMounted && (
        <AnimatePresence>
          {isUserScrolling && messages.length > 0 && (
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
      )}
    </main>
  );
});

ChatMessages.displayName = 'ChatMessages';

// ChatComposer Component - Bottom input area
const ChatComposer = React.memo<{
  input: string;
  isLoading: boolean;
  voiceMode: boolean;
  activeTools: string[];
  handleSendMessage: () => void;
  updateState: (updates: any) => void;
  handleToolSelect: (toolId: string) => void;
}>(({
  input,
  isLoading,
  voiceMode,
  activeTools,
  handleSendMessage,
  updateState,
  handleToolSelect
}) => {
  return (
    <CleanInputField
      input={input}
      setInput={(value) => updateState({ input: value })}
      onSubmit={handleSendMessage}
      isLoading={isLoading}
      voiceMode={voiceMode}
      onToggleVoice={() => updateState({ voiceMode: !voiceMode })}
      onShowVoiceOverlay={() => updateState({ showVoiceOverlay: true })}
      onToolSelect={handleToolSelect}
      onShowSettings={() => updateState({ showSettingsOverlay: true })}
      activeTools={activeTools}
    />
  );
});

ChatComposer.displayName = 'ChatComposer';

// Main ChatApp Client Component
export default function ChatAppClient() {
  // Mounted state gate to prevent SSR/client divergence
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // AI Elements system hook - only initialize when mounted
  const {
    systemState,
    updateSystem,
    activateCapability,
    advanceStage
  } = useAIElementsSystem();

  // Update AI system when messages change - only when mounted
  useEffect(() => {
    if (isMounted) {
      updateSystem(state.messages);
    }
  }, [state.messages, updateSystem, isMounted]);

  // Multimodal widgets management - only when mounted
  const multimodalWidgets = React.useMemo(() => {
    if (!isMounted) return [];
    
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
    isMounted,
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
  const handleBookingComplete = useCallback((bookingData: any) => {
    updateState({ showBookingOverlay: false });
    
    const confirmationMessage: MessageData = {
      id: generateMessageId(),
      content: `🎉 **Strategy Session Confirmed!**\n\nThank you for booking your AI consultation. You'll receive:\n\n✅ Personalized AI assessment\n✅ Custom ROI projections\n✅ Implementation roadmap\n✅ Competitive analysis\n\nA preparation guide will be sent within 24 hours.`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'cta'
    };
    
    updateState({ 
      messages: [...state.messages, confirmationMessage],
      conversationState: { ...state.conversationState, leadScore: 100 }
    });
  }, [state.messages, state.conversationState, updateState]);

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
      // Activate relevant capabilities based on tool
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

  const handleFilesUploaded = useCallback((files: File[]) => {
    activateCapability('document-analysis');
    activateCapability('source-citation');
    activateCapability('data-persistence');
    
    const analysisMessage: MessageData = {
      id: generateMessageId(),
      content: `📄 **Document Analysis Complete**\n\nI've analyzed ${files.length} document${files.length > 1 ? 's' : ''}:\n\n${files.map(f => `• ${f.name}`).join('\n')}\n\n**Key Findings:**\n✅ Business process gaps identified\n✅ Automation opportunities detected\n✅ ROI improvement potential: 25-40%\n\nBased on your documents, I can see specific areas where AI implementation would deliver immediate value. Would you like me to prioritize these opportunities?`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'cta',
      suggestions: [
        'Show me the top 3 opportunities',
        'Focus on cost reduction areas',
        'Prioritize revenue growth potential'
      ]
    };
    
    updateState({ 
      messages: [...state.messages, analysisMessage] 
    });
  }, [state.messages, activateCapability, updateState]);

  const handleGeneratePDF = useCallback(() => {
    const pdfMessage: MessageData = {
      id: generateMessageId(),
      content: `📋 **AI Strategy Report Generated**\n\nYour personalized business intelligence report is ready:\n\n**Included Sections:**\n• Conversation summary & insights\n• AI opportunity assessment\n• ROI projections & timelines\n• Implementation roadmap\n• Next steps & recommendations\n\nThe report has been tailored to your specific business needs and industry requirements.\n\n[**⬇️ Download Report**](download) | [**📧 Email Report**](email)`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'cta'
    };
    
    updateState({ 
      messages: [...state.messages, pdfMessage] 
    });

    // Simulate PDF generation and download
    setTimeout(() => {
      const element = document.createElement('a');
      const file = new Blob([`
AI STRATEGY CONSULTATION REPORT
===============================

Lead Score: ${state.conversationState.leadScore}%
Generated: ${new Date().toLocaleDateString()}

CONVERSATION SUMMARY:
• ${state.messages.length} message exchanges
• Business intelligence consultation completed
• AI opportunities identified
• Implementation roadmap prepared

NEXT STEPS:
1. Review AI implementation priorities
2. Schedule technical consultation
3. Begin pilot program development
4. Monitor ROI and performance metrics

This report was generated by your AI Strategy Assistant.
Contact us to discuss implementation details.
      `], { type: 'text/plain' });
      
      element.href = URL.createObjectURL(file);
      element.download = `AI_Strategy_Report_${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  }, [state.conversationState.leadScore, state.messages, updateState]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    updateState({ 
      input: suggestion,
      isUserScrolling: false
    });
    setTimeout(() => handleSendMessage(), 100);
  }, [handleSendMessage, updateState]);

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

  const handleCameraSwitch = useCallback(() => {
    const newFacing = state.cameraFacing === 'user' ? 'environment' : 'user';
    updateState({ cameraFacing: newFacing });
  }, [state.cameraFacing, updateState]);

  // Don't render anything complex until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat interface...</p>
        </div>
      </div>
    );
  }

  // Render with Figma layout structure: StageRail (left), ChatMessages (center), ChatComposer (bottom), UnifiedControlPanel (top-right)
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background flex">
        {/* Left: StageRail - Floating Stage Progress Indicator */}
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-20">
          <StageRail
            currentStageIndex={systemState.stageProgress.current}
            conversationStarted={state.messages.length > 1}
            exploredCount={systemState.capabilityUsage.used}
            totalCapabilities={systemState.capabilityUsage.total}
          />
        </div>

        {/* Center: Main chat content area */}
        <div className="flex-1 flex flex-col">
          {/* ChatMessages - Center content */}
          <ChatMessages
            messages={state.messages}
            isLoading={state.isLoading}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
            isUserScrolling={state.isUserScrolling}
            conversationState={state.conversationState}
            handleScroll={handleScroll}
            handleSuggestionClick={handleSuggestionClick}
            scrollToBottom={scrollToBottom}
            updateState={updateState}
            isMounted={isMounted}
          />

          {/* Bottom: ChatComposer - Input Field */}
          <ChatComposer
            input={state.input}
            isLoading={state.isLoading}
            voiceMode={state.voiceMode}
            activeTools={state.activeTools}
            handleSendMessage={handleSendMessage}
            updateState={updateState}
            handleToolSelect={handleToolSelect}
          />
        </div>

        {/* Top-right: Unified Control Panel */}
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

        {/* Overlays - Only render when mounted */}
        {isMounted && (
          <>
            <AnimatePresence mode="wait">
              {state.showVoiceOverlay && !state.isVoiceMinimized && (
                <SpeechToSpeechPopover
                  isOpen={state.showVoiceOverlay}
                  onClose={() => updateState({ showVoiceOverlay: false, isVoiceMinimized: false, voiceMode: false })}
                  onMinimize={() => updateState({ isVoiceMinimized: !state.isVoiceMinimized })}
                  onTranscriptComplete={handleVoiceComplete}
                  audioEnabled={true}
                  onAudioToggle={() => {}}
                  assistantName="AI Strategy Assistant"
                  isMinimized={false}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {state.showSettingsOverlay && (
                <SettingsOverlay
                  isOpen={state.showSettingsOverlay}
                  onClose={() => updateState({ showSettingsOverlay: false })}
                  theme={state.theme}
                  onThemeChange={(theme) => updateState({ theme })}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {state.showFileUpload && (
                <FileUploadOverlay
                  isOpen={state.showFileUpload}
                  onClose={() => updateState({ showFileUpload: false })}
                  onFilesUploaded={handleFilesUploaded}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {state.activeCanvasTool && (
                <UnifiedCanvasSystem
                  activeTool={state.activeCanvasTool}
                  onClose={() => updateState({ activeCanvasTool: null })}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {state.showWebcamInterface && !state.isWebcamMinimized && (
                <WebcamInterface
                  isOpen={state.showWebcamInterface}
                  onClose={() => updateState({ showWebcamInterface: false, isWebcamMinimized: false })}
                  onMinimize={() => updateState({ isWebcamMinimized: !state.isWebcamMinimized })}
                  isMinimized={false}
                  analysisMode="business"
                  hasOtherWidgets={false}
                  onCameraSwitch={handleCameraSwitch}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {state.showScreenShareInterface && !state.isScreenShareMinimized && (
                <ScreenShareInterface
                  isOpen={state.showScreenShareInterface}
                  onClose={() => updateState({ showScreenShareInterface: false, isScreenShareMinimized: false })}
                  onMinimize={() => updateState({ isScreenShareMinimized: !state.isScreenShareMinimized })}
                  isMinimized={false}
                  analysisMode="workflow"
                  hasOtherWidgets={false}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {state.showBookingOverlay && (
                <CalendarBookingOverlay
                  isOpen={state.showBookingOverlay}
                  onClose={() => updateState({ showBookingOverlay: false })}
                  onBookingComplete={handleBookingComplete}
                  leadData={{
                    name: '',
                    email: '',
                    company: ''
                  }}
                />
              )}
            </AnimatePresence>

            {/* Floating: Unified Multimodal Widget - Only when mounted and has widgets */}
            <AnimatePresence>
              <UnifiedMultimodalWidget
                widgets={multimodalWidgets}
                onWidgetExpand={handleWidgetExpand}
                onWidgetClose={handleWidgetClose}
                onCameraSwitch={handleCameraSwitch}
                isVisible={multimodalWidgets.length > 0}
              />
            </AnimatePresence>
          </>
        )}
      </div>
    </DndProvider>
  );
}