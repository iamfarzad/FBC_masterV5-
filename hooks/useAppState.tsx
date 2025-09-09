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

const CONVERSATION_STAGES = {
  GREETING: 'greeting',
  DISCOVERY: 'discovery',
  QUALIFICATION: 'qualification', 
  PRESENTATION: 'presentation',
  CLOSING: 'closing'
} as const;

const AI_RESPONSES = [
  "Thank you for sharing that. Based on your industry, I can already see several AI opportunities. What's your biggest operational challenge right now?",
  "Great! Your business profile shows strong potential for AI implementation. What specific goals are you hoping to achieve this year?", 
  "That's helpful context. Could you share your email so I can send you a personalized AI assessment after our conversation?",
  "Perfect! I'm building a comprehensive understanding of your needs. What's driving your interest in AI - competitive pressure or growth opportunities?"
];

const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useAppState = () => {
  // Auto-scroll refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize state
  const [state, setState] = useState<AppState>({
    input: '',
    isLoading: false,
    messages: [
      {
        id: generateMessageId(),
        content: "Hi! I'm your AI Strategy Assistant. I help businesses discover how AI can transform their operations and drive growth.\n\nWhat's your name, and what industry are you in?",
        sender: 'ai' as const,
        timestamp: new Date(),
        type: 'text',
        suggestions: [
          "I'm John Smith, CEO of a tech startup",
          "Sarah from retail/e-commerce",
          "Mike, manufacturing company"
        ]
      }
    ],
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
      stage: CONVERSATION_STAGES.DISCOVERY,
      showActions: true
    },
    isUserScrolling: false
  });

  // Update individual state properties
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Auto-scroll functionality
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && !state.isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [state.isUserScrolling]);

  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const threshold = 100;
    
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    );
  }, []);

  const handleScroll = useCallback(() => {
    if (!isNearBottom()) {
      updateState({ isUserScrolling: true });
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        updateState({ isUserScrolling: false });
      }, 2000);
    } else {
      updateState({ isUserScrolling: false });
    }
  }, [isNearBottom, updateState]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // Auto-scroll when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [state.messages, state.isLoading, scrollToBottom]);

  // Auto-scroll when conversation starts
  useEffect(() => {
    if (state.messages.length === 1) {
      scrollToBottom('auto');
    }
  }, [state.messages.length, scrollToBottom]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Message sending logic
  const handleSendMessage = useCallback(() => {
    if (!state.input.trim() || state.isLoading) return;

    const userMessage: MessageData = {
      id: generateMessageId(),
      content: state.input,
      sender: 'user',
      timestamp: new Date()
    };

    updateState({
      messages: [...state.messages, userMessage],
      input: '',
      isLoading: true,
      isUserScrolling: false
    });
    
    setTimeout(() => scrollToBottom(), 50);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: MessageData = {
        id: generateMessageId(),
        content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          'Customer service efficiency',
          'Better data insights', 
          'Process automation',
          'Sales optimization'
        ]
      };

      updateState({
        messages: [...state.messages, userMessage, aiMessage],
        isLoading: false
      });
      
      setTimeout(() => scrollToBottom(), 100);
    }, 1800);
  }, [state.input, state.isLoading, state.messages, updateState, scrollToBottom]);

  return {
    state,
    updateState,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    handleSendMessage,
    generateMessageId,
    AI_RESPONSES
  };
};