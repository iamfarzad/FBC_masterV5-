"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MessageData } from '../components/chat/UnifiedMessage';

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
  showResearchPanel: boolean;
  
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

  // Initialize state with static values for SSR consistency
  const [state, setState] = useState<AppState>({
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
    showResearchPanel: false,
    activeTools: [],
    theme: 'light',
    conversationState: {
      leadScore: 65,
      stage: CONVERSATION_STAGES.DISCOVERY,
      showActions: true
    },
    isUserScrolling: false
  });

  // Ensure a stable sessionId exists as early as possible (reduces 'default-session' fallbacks)
  useEffect(() => {
    try {
      const key = 'intelligence-session-id'
      if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
        const sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
        localStorage.setItem(key, sid)
      }
    } catch {}
  }, [])

  // Initialize with welcome message once per page session (avoid StrictMode duplicate)
  const welcomeRef = useRef(false)
  useEffect(() => {
    try {
      const flagKey = 'ai-elements-welcome-shown'
      const already = typeof window !== 'undefined' ? sessionStorage.getItem(flagKey) : '1'
      if (welcomeRef.current || already === '1') return
      if (state.messages.length > 0) return

      const welcomeMessage: MessageData = {
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

      welcomeRef.current = true
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(flagKey, '1')
        sessionStorage.setItem('ai-elements-has-greeted', '1')
      }
      setState(prev => ({ 
        ...prev, 
        messages: [welcomeMessage],
        conversationState: { ...prev.conversationState, stage: CONVERSATION_STAGES.DISCOVERY }
      }))
    } catch {
      // Fallback: still guard by ref
      if (!welcomeRef.current && state.messages.length === 0) {
        welcomeRef.current = true
        setState(prev => ({ ...prev, messages: [
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
        ], conversationState: { ...prev.conversationState, stage: CONVERSATION_STAGES.DISCOVERY } }))
      }
    }
  }, [state.messages.length, generateMessageId])

  // Update individual state properties
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Safe message appender to avoid race conditions
  const appendMessage = useCallback((message: MessageData) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, message] }))
  }, [])

  const updateMessage = useCallback((id: string, patch: Partial<MessageData>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, ...patch } : m)
    }))
  }, [])

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

  // Message sending logic - Connected to backend API
  const inFlightRef = useRef(false)
  const handleSendMessage = useCallback(async () => {
    if (!state.input.trim() || state.isLoading || inFlightRef.current) return;

    const userMessage: MessageData = {
      id: generateMessageId(),
      content: state.input,
      sender: 'user',
      timestamp: new Date()
    };

    const currentInput = state.input;
    inFlightRef.current = true
    updateState({
      messages: [...state.messages, userMessage],
      input: '',
      isLoading: true,
      isUserScrolling: false
    });
    
    setTimeout(() => scrollToBottom(), 50);

    try {
      // Build session + lead context from consent
      let leadContext: any = {}
      try {
        const consent = await fetch('/api/consent', { cache: 'no-store' })
        if (consent.ok) {
          const cj = await consent.json()
          if (cj?.allow) {
            leadContext = {
              name: cj.name || undefined,
              email: cj.email || undefined,
              company: cj.companyDomain || undefined
            }
          }
        }
      } catch {}

      const sessionId = (() => {
        try {
          const key = 'intelligence-session-id'
          let sid = localStorage.getItem(key)
          if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(key, sid) }
          return sid
        } catch { return null }
      })()

      // Call the real backend API
      const hasGreeted = (() => {
        try {
          const flag = (typeof window !== 'undefined' ? sessionStorage.getItem('ai-elements-has-greeted') : null) === '1'
          const byStage = (state.conversationState?.stage || '').toLowerCase() !== 'greeting'
          const hasAIMsg = state.messages.some(m => m.sender === 'ai')
          return flag || byStage || hasAIMsg
        } catch { return true }
      })()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: (() => {
          const h: Record<string, string> = { 'Content-Type': 'application/json' }
          try {
            if (sessionId) h['x-intelligence-session-id'] = sessionId
          } catch {}
          return h
        })(),
        body: JSON.stringify({
          version: 1,
          messages: [
            ...state.messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: currentInput
            }
          ],
          sessionId: sessionId || undefined,
          leadContext,
          hasGreeted,
          // Provide stage hint so backend can align system prompt
          conversationStage: state.conversationState?.stage || 'greeting'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const aiMessage: MessageData = {
        id: generateMessageId(),
        content: '',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          'Customer service efficiency',
          'Better data insights', 
          'Process automation',
          'Sales optimization'
        ]
      };

      // Add the AI message to state for streaming
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false
      }));

      // Handle streaming response
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              // Handle both JSON and plain string responses
              let content = '';
              if (data.startsWith('"') && data.endsWith('"')) {
                // Plain string response (quoted)
                content = JSON.parse(data);
              } else {
                // Try parsing as JSON object
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  content = parsed.content;
                } else if (typeof parsed === 'string') {
                  content = parsed;
                }
              }

              if (content) {
                // Update the AI message content progressively
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === aiMessage.id
                      ? { ...msg, content: msg.content + content }
                      : msg
                  )
                }));
              }
            } catch (e) {
              // If parsing fails, try treating as plain text
              if (data && typeof data === 'string' && data.trim()) {
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg =>
                    msg.id === aiMessage.id
                      ? { ...msg, content: msg.content + data }
                      : msg
                  )
                }));
              }
            }
          }
        }
      }
      
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Chat API Error:', error);
      
      // Fallback to mock response if API fails
      const aiMessage: MessageData = {
        id: generateMessageId(),
        content: `${AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]}`,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          'Customer service efficiency',
          'Better data insights', 
          'Process automation',
          'Sales optimization'
        ]
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false
      }));
      
      setTimeout(() => scrollToBottom(), 100);
    } finally {
      inFlightRef.current = false
    }
  }, [state.input, state.isLoading, state.messages, scrollToBottom]);

  return {
    state,
    updateState,
    appendMessage,
    updateMessage,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    handleSendMessage,
    generateMessageId,
    AI_RESPONSES
  };
};
