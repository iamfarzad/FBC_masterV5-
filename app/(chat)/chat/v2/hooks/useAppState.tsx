"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MessageData } from '../components/UnifiedMessage';

export interface ConversationState {
  leadScore: number;
  stage: string;
  showActions: boolean;
}

export interface AppState {
  // Input and messaging
  input: string;
  isLoading: boolean;
  messages: MessageData[];
  
  // Voice and multimodal
  voiceMode: boolean;
  showVoiceOverlay: boolean;
  isVoiceMinimized: boolean;
  showWebcamInterface: boolean;
  isWebcamMinimized: boolean;
  showScreenShareInterface: boolean;
  isScreenShareMinimized: boolean;
  cameraFacing: 'user' | 'environment';
  
  // Overlays
  showBookingOverlay: boolean;
  showSettingsOverlay: boolean;
  showFileUpload: boolean;
  activeCanvasTool: string | null;
  
  // Tools and UI state
  activeTools: string[];
  theme: 'light' | 'dark';
  conversationState: ConversationState;
  
  // Auto-scroll state
  isUserScrolling: boolean;
}

export const useAppState = () => {
  // This is a placeholder - the real implementation uses the bridge
  const [state] = useState<AppState>({
    input: '',
    isLoading: false,
    messages: [],
    voiceMode: false,
    showVoiceOverlay: false,
    isVoiceMinimized: false,
    showWebcamInterface: false,
    isWebcamMinimized: false,
    showScreenShareInterface: false,
    isScreenShareMinimized: false,
    cameraFacing: 'user',
    showBookingOverlay: false,
    showSettingsOverlay: false,
    showFileUpload: false,
    activeCanvasTool: null,
    activeTools: [],
    theme: 'light',
    conversationState: {
      leadScore: 65,
      stage: 'discovery',
      showActions: true
    },
    isUserScrolling: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback((updates: Partial<AppState>) => {
    console.log('State update:', updates);
  }, []);

  const scrollToBottom = useCallback(() => {
    console.log('Scroll to bottom');
  }, []);

  const handleScroll = useCallback(() => {
    console.log('Handle scroll');
  }, []);

  const handleSendMessage = useCallback(() => {
    console.log('Send message');
  }, []);

  return {
    state,
    updateState,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    handleSendMessage
  };
};