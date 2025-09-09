"use client"

import React, { useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import Zustand stores
import { useAppStore } from '../../../stores/appStore';
import { useAIStore } from '../../../stores/aiStore';

// Import chat layout components
import { ChatLayout } from '../../../components/chat/layouts/ChatLayout';
import { ChatMessages } from '../../../components/chat/layouts/ChatMessages';
import { ChatComposer } from '../../../components/chat/layouts/ChatComposer';
import { ChatSidebar } from '../../../components/chat/layouts/ChatSidebar';

// Import canvas system
import { CanvasOrchestrator } from '../../../components/chat/CanvasOrchestrator';
import { CanvasWorkspace } from '../../../components/chat/CanvasWorkspace';

// Import overlays
import { VoiceOverlay } from '../../../components/chat/VoiceOverlay';
import { CalendarBookingOverlay } from '../../../components/CalendarBookingOverlay';
import { SettingsOverlay } from '../../../components/overlays/SettingsOverlay';
import { FileUploadOverlay } from '../../../components/overlays/FileUploadOverlay';

// Import tools
import { ToolMenu } from '../../../components/chat/ToolMenu';

// Import utilities
import { AI_RESPONSES, generateMessageId } from '../../../constants/appConstants';
import { generateSecureSessionId } from '../../../utils/sessionUtils';
import { ChatMessageUI, UnifiedMessage } from '../../../components/chat/types';

// Main Chat Page Component
export default function ChatPage() {
  // Zustand store selectors - optimized for minimal re-renders
  const messages = useAppStore(state => state.messages);
  const conversationState = useAppStore(state => state.conversationState);
  const theme = useAppStore(state => state.theme);
  const isLoading = useAppStore(state => state.isLoading);
  const isUserScrolling = useAppStore(state => state.isUserScrolling);
  const input = useAppStore(state => state.input);
  const voiceMode = useAppStore(state => state.voiceMode);
  const showVoiceOverlay = useAppStore(state => state.showVoiceOverlay);
  const showSettingsOverlay = useAppStore(state => state.showSettingsOverlay);
  const showFileUpload = useAppStore(state => state.showFileUpload);
  const showBookingOverlay = useAppStore(state => state.showBookingOverlay);
  const activeCanvasTool = useAppStore(state => state.activeCanvasTool);
  const activeTools = useAppStore(state => state.activeTools);
  
  // Zustand store actions
  const {
    setInput,
    setLoading,
    setUserScrolling,
    addMessage,
    updateConversationState,
    setTheme,
    setVoiceOverlay,
    toggleVoiceMode,
    setSettingsOverlay,
    setFileUpload,
    setBookingOverlay,
    setActiveCanvasTool,
    toggleTool,
  } = useAppStore();

  // AI store selectors and actions
  const stageProgress = useAIStore(state => state.stageProgress);
  const capabilityUsage = useAIStore(state => state.capabilityUsage);
  const { activateCapability, advanceStage, updateSystem } = useAIStore();

  // Session management
  const [sessionId, setSessionId] = React.useState<string>('');
  const [consentGiven, setConsentGiven] = React.useState(false);

  // Initialize session
  useEffect(() => {
    const newSessionId = generateSecureSessionId();
    setSessionId(newSessionId);
  }, []);

  // Update AI system when messages change - with debounce to prevent infinite loops
  const messageCount = messages.length;
  useEffect(() => {
    if (messageCount > 0) {
      const timeoutId = setTimeout(() => {
        updateSystem(messages);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messageCount, updateSystem]);

  // Convert UnifiedMessage[] to ChatMessageUI[] for compatibility
  const chatMessages: ChatMessageUI[] = React.useMemo(() => {
    return messages.map(msg => ({
      ...msg,
      // Add any additional ChatMessageUI properties here
      activities: [], // Extract from content if needed
      reasoning: msg.type === 'ai' ? msg.content : undefined,
    }));
  }, [messages]);

  // Enhanced message sending with AI integration
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: UnifiedMessage = {
      id: generateMessageId(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'user'
    };

    // Add user message and clear input
    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setUserScrolling(false);

    // Activate AI capabilities based on context
    activateCapability('real-time-processing');
    activateCapability('intent-recognition');
    activateCapability('response-generation');

    try {
      // Simulate AI processing with sophisticated response
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate contextual AI response
      const responses = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      
      const aiMessage: UnifiedMessage = {
        id: generateMessageId(),
        content: responses.content,
        sender: 'ai',
        timestamp: new Date(),
        type: responses.type,
        suggestions: responses.suggestions
      };

      addMessage(aiMessage);

      // Update conversation state based on message content
      if (input.toLowerCase().includes('@') || input.toLowerCase().includes('email')) {
        updateConversationState({ email: input.trim() });
        advanceStage('email-capture');
      }

      if (input.toLowerCase().includes('company') || input.toLowerCase().includes('business')) {
        updateConversationState({ company: input.trim() });
        advanceStage('company-research');
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }, [input, isLoading, addMessage, setInput, setLoading, setUserScrolling, activateCapability, updateConversationState, advanceStage]);

  // Tool action handler (matches your switch statement pattern)
  const handleToolAction = useCallback((toolId: string) => {
    switch (toolId) {
      case 'webcam':
        setActiveCanvasTool('webcam');
        activateCapability('real-time-processing');
        break;
      case 'screen':
        setActiveCanvasTool('screen');
        activateCapability('image-processing');
        break;
      case 'video':
        window.location.href = '/workshop/video-to-app';
        break;
      case 'roi':
        setActiveCanvasTool('roi');
        activateCapability('business-intelligence');
        break;
      case 'roi-inline':
        setActiveCanvasTool('roi-inline');
        activateCapability('business-intelligence');
        break;
      case 'code':
        setActiveCanvasTool('code');
        activateCapability('document-analysis');
        break;
      case 'workshop':
        window.location.href = '/workshop';
        break;
      case 'book-call':
        setBookingOverlay(true);
        break;
      case 'search':
        activateCapability('web-preview');
        // Implement web search logic
        break;
      case 'docs':
        setFileUpload(true);
        activateCapability('document-analysis');
        break;
      default:
        if (activeTools.includes(toolId)) {
          toggleTool(toolId);
        } else {
          setActiveCanvasTool(toolId);
        }
    }
  }, [setActiveCanvasTool, activateCapability, setBookingOverlay, setFileUpload, activeTools, toggleTool]);

  // Event handlers
  const handleBookingComplete = useCallback((bookingData: any) => {
    setBookingOverlay(false);
    
    const confirmationMessage: UnifiedMessage = {
      id: generateMessageId(),
      content: `🎉 **Strategy Session Confirmed!**\n\nThank you for booking your AI consultation. You'll receive:\n\n✅ Personalized AI assessment\n✅ Custom ROI projections\n✅ Implementation roadmap\n✅ Competitive analysis\n\nA preparation guide will be sent within 24 hours.`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'cta'
    };
    
    addMessage(confirmationMessage);
    updateConversationState({ leadScore: 100 });
    advanceStage('consultation-booking');
  }, [addMessage, updateConversationState, advanceStage, setBookingOverlay]);

  const handleFilesUploaded = useCallback((files: File[]) => {
    activateCapability('document-analysis');
    activateCapability('source-citation');
    activateCapability('data-persistence');
    
    const analysisMessage: UnifiedMessage = {
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
    
    addMessage(analysisMessage);
  }, [addMessage, activateCapability]);

  const handleVoiceComplete = useCallback((transcript: string) => {
    setVoiceOverlay(false);
    setInput(transcript);
    setUserScrolling(false);
    
    if (transcript.trim()) {
      activateCapability('real-time-processing');
      activateCapability('adaptive-learning');
      setTimeout(() => handleSendMessage(), 100);
    }
  }, [handleSendMessage, activateCapability, setVoiceOverlay, setInput, setUserScrolling]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    setUserScrolling(false);
    setTimeout(() => handleSendMessage(), 100);
  }, [handleSendMessage, setInput, setUserScrolling]);

  // Canvas workspace content
  const renderCanvasContent = () => {
    if (!activeCanvasTool) return null;

    return (
      <CanvasOrchestrator
        activeTool={activeCanvasTool}
        onClose={() => setActiveCanvasTool(null)}
        sessionId={sessionId}
        conversationState={conversationState}
      />
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ChatLayout disabled={isLoading}>
        {/* Main Chat Interface */}
        <div className="flex h-screen">
          {/* Left Sidebar - Activity Monitor */}
          <ChatSidebar
            activities={[]} // Extract from messages or AI store
            stageProgress={stageProgress}
            capabilityUsage={capabilityUsage}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 relative">
              <ChatMessages
                messages={chatMessages}
                isLoading={isLoading}
                onSuggestionClick={handleSuggestionClick}
                onMessageAction={(action, messageId) => {
                  console.log('Message action:', action, messageId);
                }}
                conversationState={conversationState}
              />
            </div>

            {/* Input Composer */}
            <ChatComposer
              input={input}
              setInput={setInput}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              voiceMode={voiceMode}
              onToggleVoice={toggleVoiceMode}
              onShowVoiceOverlay={() => setVoiceOverlay(true)}
              onToolSelect={handleToolAction}
              topSlot={
                <ToolMenu
                  onToolSelect={handleToolAction}
                  activeTools={activeTools}
                />
              }
            />
          </div>

          {/* Canvas Workspace */}
          {activeCanvasTool && (
            <CanvasWorkspace
              isOpen={!!activeCanvasTool}
              onClose={() => setActiveCanvasTool(null)}
            >
              {renderCanvasContent()}
            </CanvasWorkspace>
          )}
        </div>

        {/* Overlays */}
        <AnimatePresence mode="wait">
          {showVoiceOverlay && (
            <VoiceOverlay
              isOpen={showVoiceOverlay}
              onClose={() => setVoiceOverlay(false)}
              onTranscriptComplete={handleVoiceComplete}
              sessionId={sessionId}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showSettingsOverlay && (
            <SettingsOverlay
              isOpen={showSettingsOverlay}
              onClose={() => setSettingsOverlay(false)}
              theme={theme}
              onThemeChange={setTheme}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showFileUpload && (
            <FileUploadOverlay
              isOpen={showFileUpload}
              onClose={() => setFileUpload(false)}
              onFilesUploaded={handleFilesUploaded}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showBookingOverlay && (
            <CalendarBookingOverlay
              isOpen={showBookingOverlay}
              onClose={() => setBookingOverlay(false)}
              onBookingComplete={handleBookingComplete}
              leadData={{
                name: '',
                email: conversationState.email,
                company: conversationState.company
              }}
            />
          )}
        </AnimatePresence>

        {/* Consent Overlay (if needed) */}
        {!consentGiven && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-8 max-w-md">
              <h2 className="text-xl font-medium mb-4">Data Collection Consent</h2>
              <p className="text-muted-foreground mb-6">
                This AI assistant collects conversation data to provide personalized insights. 
                Your data is processed securely and never shared.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConsentGiven(true)}
                  className="glass-button px-6 py-2 rounded-lg flex-1"
                >
                  Accept
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 rounded-lg border border-border hover:bg-accent"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </ChatLayout>
    </DndProvider>
  );
}