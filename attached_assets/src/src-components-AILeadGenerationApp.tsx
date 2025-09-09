'use client'

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
import { CanvasOverlay } from '@/components/overlays/CanvasOverlay';

// Import existing components
import { CalendarBookingOverlay } from '@/components/CalendarBookingOverlay';
import { UnifiedMessage, MessageData } from '@/components/UnifiedMessage';
import { SpeechToSpeechPopover } from '@/components/SpeechToSpeechPopover';
import { WebcamInterface } from '@/components/WebcamInterface';
import { ScreenShareInterface } from '@/components/ScreenShareInterface';
import { UnifiedMultimodalWidget } from '@/components/UnifiedMultimodalWidget';

// Import hooks and utilities
import { useAppState } from '@/hooks/useAppState';
import { AI_RESPONSES, generateMessageId } from '@/lib/constants/appConstants';

// Main AI Lead Generation App Component
export function AILeadGenerationApp() {
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

  // Event handlers (keeping all your existing handlers...)
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

  // ... (keep all your other existing handlers)

  // Render
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* All your existing JSX structure */}
        {/* Just update import paths to use @ aliases */}
      </div>
    </DndProvider>
  );
}