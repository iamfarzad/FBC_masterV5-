"use client"

import React, { useCallback } from 'react';
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
import './layout.css';

// Import existing components
import { CalendarBookingOverlay } from '@/components/chat/CalendarBookingOverlay';
import { UnifiedMessage, MessageData } from '@/components/chat/UnifiedMessage';
import { SpeechToSpeechPopover } from '@/components/chat/SpeechToSpeechPopover';
import { WebcamInterface } from '@/components/chat/WebcamInterface';
import { ScreenShareInterface } from '@/components/chat/ScreenShareInterface';
import { UnifiedMultimodalWidget } from '@/components/chat/UnifiedMultimodalWidget';
import { StageRail } from '@/components/chat/StageRail';

// Import hooks and utilities
import { useAppState } from '@/hooks/useAppState';
// Constants
const AI_RESPONSES = [
  "Thank you for sharing that. Based on your industry, I can already see several AI opportunities. What's your biggest operational challenge right now?",
  "Great! Your business profile shows strong potential for AI implementation. What specific goals are you hoping to achieve this year?", 
  "That's helpful context. Could you share your email so I can send you a personalized AI assessment after our conversation?",
  "Perfect! I'm building a comprehensive understanding of your needs. What's driving your interest in AI - competitive pressure or growth opportunities?"
];

const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Import styles
import '@/styles/figma-design.css';

// Main Chat Page Component
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
          transcript: '',
          audioLevel: 0
        }
      });
    }
    
    if (state.showWebcamInterface && state.isWebcamMinimized) {
      widgets.push({
        id: 'webcam',
        type: 'video' as const,
        title: 'Video Call',
        status: 'Streaming',
        isActive: true,
        data: {
          resolution: '1920x1080',
          frameRate: 30
        }
      });
    }
    
    if (state.showScreenShareInterface && state.isScreenShareMinimized) {
      widgets.push({
        id: 'screen',
        type: 'screen' as const,
        title: 'Screen Share',
        status: 'Active',
        isActive: true,
        data: {
          displayName: 'Main Display',
          resolution: '2560x1440'
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
    state.showScreenShareInterface,
    state.isScreenShareMinimized
  ]);

  // Event Handlers
  const handleSuggestionClick = useCallback((suggestion: string) => {
    updateState({ input: suggestion });
    handleSendMessage();
  }, [updateState, handleSendMessage]);

  const handleVoiceComplete = useCallback((transcript: string) => {
    updateState({ input: transcript });
    handleSendMessage();
  }, [updateState, handleSendMessage]);

  const handleToolSelect = useCallback((toolId: string) => {
    switch (toolId) {
      case 'docs':
        updateState({ showFileUpload: true });
        break;
      case 'voice':
        updateState({ showVoiceOverlay: true, isVoiceMinimized: false });
        break;
      case 'webcam':
        updateState({ showWebcamInterface: true, isWebcamMinimized: false });
        break;
      case 'screen':
        updateState({ showScreenShareInterface: true, isScreenShareMinimized: false });
        break;
      case 'settings':
        updateState({ showSettingsOverlay: true });
        break;
      default:
        break;
    }
  }, [updateState]);

  const handleFilesUploaded = useCallback((files: File[]) => {
    const fileNames = files.map(f => f.name).join(', ');
    const message: MessageData = {
      id: generateMessageId(),
      content: `Uploaded files: ${fileNames}`,
      sender: 'user',
      timestamp: new Date(),
      metadata: { type: 'file_upload', files: fileNames }
    };
    updateState({ 
      messages: [...state.messages, message],
      showFileUpload: false 
    });
    activateCapability('document-analysis');
  }, [state.messages, updateState, activateCapability]);

  const handleWidgetExpand = useCallback((widgetId: string) => {
    switch (widgetId) {
      case 'voice':
        updateState({ isVoiceMinimized: false });
        break;
      case 'webcam':
        updateState({ isWebcamMinimized: false });
        break;
      case 'screen':
        updateState({ isScreenShareMinimized: false });
        break;
    }
  }, [updateState]);

  const handleWidgetClose = useCallback((widgetId: string) => {
    switch (widgetId) {
      case 'voice':
        updateState({ showVoiceOverlay: false, isVoiceMinimized: false });
        break;
      case 'webcam':
        updateState({ showWebcamInterface: false, isWebcamMinimized: false });
        break;
      case 'screen':
        updateState({ showScreenShareInterface: false, isScreenShareMinimized: false });
        break;
    }
  }, [updateState]);

  const handleBookingComplete = useCallback((bookingData: any) => {
    const message: MessageData = {
      id: generateMessageId(),
      content: `Meeting scheduled for ${bookingData.selectedDate} at ${bookingData.selectedTime}`,
      sender: 'system',
      timestamp: new Date(),
      metadata: { type: 'booking', data: bookingData }
    };
    updateState({ 
      messages: [...state.messages, message],
      showBookingOverlay: false 
    });
    advanceStage();
  }, [state.messages, updateState, advanceStage]);

  const handleGeneratePDF = useCallback(() => {
    activateCapability('pdf-generation');
    // PDF generation logic here
  }, [activateCapability]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="chat-container">
        {/* Fixed Header - UnifiedControlPanel */}
        <header className="chat-header">
            <UnifiedControlPanel
              leadScore={state.conversationState.leadScore}
              systemState={systemState}
              currentStageIndex={systemState.currentStageIndex}
              onGeneratePDF={handleGeneratePDF}
              onOpenBooking={() => updateState({ showBookingOverlay: true })}
              onOpenSettings={() => updateState({ showSettingsOverlay: true })}
            />
          </header>

        {/* Main Chat Area - Scrollable Center */}
        <main 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="chat-messages"
        >
            <div className="max-w-4xl mx-auto">
              {state.messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <AnimatePresence mode="popLayout">
                  {state.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UnifiedMessage
                        message={message}
                        onSuggestionClick={handleSuggestionClick}
                        onActionClick={(action) => {
                          if (action === 'book') {
                            updateState({ showBookingOverlay: true });
                          }
                        }}
                        isLatest={index === state.messages.length - 1}
                      />
                    </motion.div>
                  ))}
                  {state.isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <LoadingIndicator />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </div>
          </main>

        {/* Fixed Bottom - CleanInputField */}
        <footer className="chat-input-container">
          <div className="max-w-4xl mx-auto">
              <CleanInputField
                input={state.input}
                setInput={(value: string) => updateState({ input: value })}
                onSubmit={handleSendMessage}
                onToolSelect={handleToolSelect}
                isLoading={state.isLoading}
                voiceMode={state.voiceMode}
                suggestions={[
                  "Tell me about AI solutions",
                  "How can AI help my business?",
                  "What's your pricing?",
                  "Schedule a consultation"
                ]}
                onSuggestionClick={handleSuggestionClick}
                onShowVoiceOverlay={() => updateState({ showVoiceOverlay: true })}
                onShowSettings={() => updateState({ showSettingsOverlay: true })}
                activeTools={state.activeTools || []}
              />
          </div>
        </footer>

        {/* Overlay System - Modal Layers */}
        <AnimatePresence mode="wait">
          {/* Speech to Speech Popover */}
          {state.showVoiceOverlay && !state.isVoiceMinimized && (
            <SpeechToSpeechPopover
              isOpen={state.showVoiceOverlay}
              onClose={() => updateState({ showVoiceOverlay: false })}
              onMinimize={() => updateState({ isVoiceMinimized: true })}
              onTranscriptComplete={handleVoiceComplete}
            />
          )}

          {/* Settings Overlay */}
          {state.showSettingsOverlay && (
            <SettingsOverlay
              isOpen={state.showSettingsOverlay}
              onClose={() => updateState({ showSettingsOverlay: false })}
              theme={state.theme}
              onThemeChange={(theme) => updateState({ theme })}
            />
          )}

          {/* File Upload Overlay */}
          {state.showFileUpload && (
            <FileUploadOverlay
              isOpen={state.showFileUpload}
              onClose={() => updateState({ showFileUpload: false })}
              onFilesUploaded={handleFilesUploaded}
            />
          )}

          {/* Canvas System */}
          {state.activeCanvasTool && (
            <UnifiedCanvasSystem
              activeTool={state.activeCanvasTool}
              onClose={() => updateState({ activeCanvasTool: null })}
            />
          )}

          {/* Webcam Interface */}
          {state.showWebcamInterface && !state.isWebcamMinimized && (
            <WebcamInterface
              isOpen={state.showWebcamInterface}
              onClose={() => updateState({ showWebcamInterface: false })}
              onMinimize={() => updateState({ isWebcamMinimized: true })}
              onCapture={(imageData) => {
                const message: MessageData = {
                  id: generateMessageId(),
                  content: 'Image captured from webcam',
                  sender: 'user',
                  timestamp: new Date(),
                  metadata: { type: 'image', data: imageData }
                };
                updateState({ messages: [...state.messages, message] });
                activateCapability('visual-analysis');
              }}
              facing={state.cameraFacing}
              onFacingChange={(facing) => updateState({ cameraFacing: facing })}
            />
          )}

          {/* Screen Share Interface */}
          {state.showScreenShareInterface && !state.isScreenShareMinimized && (
            <ScreenShareInterface
              isOpen={state.showScreenShareInterface}
              onClose={() => updateState({ showScreenShareInterface: false })}
              onMinimize={() => updateState({ isScreenShareMinimized: true })}
              onCapture={(screenData) => {
                const message: MessageData = {
                  id: generateMessageId(),
                  content: 'Screen captured',
                  sender: 'user',
                  timestamp: new Date(),
                  metadata: { type: 'screen', data: screenData }
                };
                updateState({ messages: [...state.messages, message] });
                activateCapability('screen-analysis');
              }}
            />
          )}

          {/* Calendar Booking Overlay */}
          {state.showBookingOverlay && (
            <CalendarBookingOverlay
              isOpen={state.showBookingOverlay}
              onClose={() => updateState({ showBookingOverlay: false })}
              onComplete={handleBookingComplete}
              leadInfo={{
                name: state.conversationState.name || '',
                email: state.conversationState.email || '',
                company: state.conversationState.company || ''
              }}
            />
          )}
        </AnimatePresence>

        {/* Multimodal Widget System */}
        {multimodalWidgets.length > 0 && (
          <UnifiedMultimodalWidget
            widgets={multimodalWidgets}
            onExpand={handleWidgetExpand}
            onClose={handleWidgetClose}
          />
        )}

        {/* Stage Rail - Progress Indicator */}
        <AnimatePresence>
          {state.messages.length > 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-20"
            >
              <StageRail
                currentStage={systemState.currentStageIndex}
                stages={systemState.stages}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {state.isUserScrolling && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToBottom}
              className="fixed bottom-24 right-4 z-20 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
              aria-label="Scroll to bottom"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}