"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from 'motion/react'

// === ALL YOUR CORE COMPONENTS ===
import { UnifiedChatInterface } from "./components/UnifiedChatInterface"
import { MessageData } from "./components/UnifiedMessage"
import { CalendarBookingOverlay } from "./components/CalendarBookingOverlay"

// === FLOATING & INTERACTIVE COMPONENTS ===
import { AdvancedVoiceVisualizer } from "./components/AdvancedVoiceVisualizer"
import { ConversationProgress } from "./components/ConversationProgress"
import { FloatingActionHints } from "./components/FloatingActionHints"
import { FloatingBrandLogo } from "./components/FloatingBrandLogo"
import { FloatingRadialMenu } from "./components/FloatingRadialMenu"
import { QuickActionsBar } from "./components/QuickActionsBar"
import { SimpleFloatingControls } from "./components/SimpleFloatingControls"
import { SmartInputPreview } from "./components/SmartInputPreview"
import { SmartSuggestionCluster } from "./components/SmartSuggestionCluster"
import { SpeechToSpeechPopover } from "./components/SpeechToSpeechPopover"
import { StreamingAudioVisualizer } from "./components/StreamingAudioVisualizer"
import { StreamingChatOverlay } from "./components/StreamingChatOverlay"
import { LayoutTestPanel } from "./components/LayoutTestPanel"

// === ALTERNATIVE CHAT INTERFACES ===
import { LiveStreamingInterface } from "./components/LiveStreamingInterface"
import { EnhancedStreamingInterface } from "./components/EnhancedStreamingInterface"
import { ChatInterface } from "./components/ChatInterface"
import { LeadGenerationChat } from "./components/LeadGenerationChat"
import { EnhancedLeadGenerationChat } from "./components/EnhancedLeadGenerationChat"

// === UTILITY COMPONENTS ===
import { MediaSupportChecker } from "./components/MediaSupportChecker"
import { PDFGenerator } from "./components/PDFGenerator"
import { ContextTransition } from "./components/ContextTransition"

// === HOOKS AND SERVICES ===
import { useGeminiStreaming } from "./components/hooks/useGeminiStreaming"
import { useConversationFlow } from "./hooks/useConversationFlow"
import { getApiKey, isLayoutTestMode } from "./config/environment"

// === UI COMPONENTS ===
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Switch } from "./components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/ui/tooltip"
import { 
  Settings, 
  Sparkles, 
  Layers, 
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Mic,
  Video,
  Monitor,
  MessageSquare,
  PanelRightOpen,
  Activity,
  Target,
  Wand2
} from 'lucide-react'

interface ConversationState {
  stage: 'greeting' | 'email_request' | 'email_collected' | 'discovery' | 'solution_positioning' | 'summary_offer' | 'booking_offer';
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

export default function UltimateComponentShowcase() {
  // === CORE STATE ===
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: '1',
      content: '🎊 **ULTIMATE COMPONENT SHOWCASE ACTIVATED!**\n\nWelcome to the complete demonstration of **ALL 25+ COMPONENTS** in your library!\n\n**🎯 Currently Active:**\n• 🎤 Advanced Voice Visualizer\n• 📊 Conversation Progress Panel\n• 🎮 Floating Brand Logo\n• ⚡ Quick Actions Bar\n• 🔄 Smart Input Preview\n• 🎯 Smart Suggestion Cluster\n• 🎨 Layout Test Panel\n• 🌟 Streaming Audio Visualizer\n• 💫 Floating Action Hints\n\n**🎛️ Interface Options:**\nSwitch between 5 different chat interfaces using the control panel!\n\nType your name to begin, or say **"Show everything!"** to activate ALL features at once! 🚀',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        '🚀 Show everything!',
        'My name is Alex',
        '🎮 Demo all components',
        '🎛️ Switch interfaces'
      ],
      tools: [
        {
          name: 'Ultimate Component System',
          description: 'All 25+ components loaded and ready',
          used: true
        }
      ]
    }
  ]);

  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'greeting'
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // === INPUT MODES ===
  const [activeInputMode, setActiveInputMode] = useState<'text' | 'voice' | 'video' | 'screen'>('text');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [hasTriedPermissions, setHasTriedPermissions] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [showPrePermissionModal, setShowPrePermissionModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'voice' | 'video' | 'screen' | null>(null);
  
  // Showcase mode - disable intrusive permission errors
  const [showcaseMode, setShowcaseMode] = useState(true);
  
  // === COMPONENT VISIBILITY CONTROLS ===
  const [showControlPanel, setShowControlPanel] = useState(false);
  
  // Core Floating Components
  const [showAdvancedVoiceViz, setShowAdvancedVoiceViz] = useState(true);
  const [showConversationProgress, setShowConversationProgress] = useState(true);
  const [showFloatingBrandLogo, setShowFloatingBrandLogo] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showSmartPreview, setShowSmartPreview] = useState(true);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [showStreamingAudioViz, setShowStreamingAudioViz] = useState(true);
  const [showFloatingHints, setShowFloatingHints] = useState(true);
  
  // Interactive Components
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showSpeechPopover, setShowSpeechPopover] = useState(false);
  const [showStreamingOverlay, setShowStreamingOverlay] = useState(false);
  const [showLayoutTest, setShowLayoutTest] = useState(false);
  const [showFloatingControls, setShowFloatingControls] = useState(false);
  
  // Interface Selection
  const [activeInterface, setActiveInterface] = useState<'unified' | 'live' | 'enhanced' | 'chat' | 'lead'>('unified');
  
  // System Components
  const [showMediaChecker, setShowMediaChecker] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [enableContextTransition, setEnableContextTransition] = useState(false);
  
  // Booking System
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingData | null>(null);

  // === HOOKS ===
  const {
    analyzeMessage,
    generateResponse,
    calculateLeadScore,
    getNextSuggestions
  } = useConversationFlow(conversationState);

  const {
    state: streamingState,
    startStream,
    stopStream,
    sendMessage: sendStreamingMessage,
  } = useGeminiStreaming({
    apiKey: getApiKey(),
    onMessage: (message) => {
      const unifiedMessage: MessageData = {
        id: `stream-${Date.now()}`,
        content: message.content,
        role: message.role as 'user' | 'assistant',
        timestamp: new Date(),
        type: message.type as MessageData['type'],
        inputMode: activeInputMode,
        isComplete: message.isComplete
      };
      setMessages(prev => [...prev, unifiedMessage]);
    },
    onPartialTranscript: (transcript) => {
      setPartialTranscript(transcript);
    },
    onError: (error) => {
      console.error('Streaming error:', error);
      setPermissionError(`Streaming error: ${error.message || 'Connection failed'}`);
    }
  });

  // === PERMISSION SYSTEM ===
  const checkAndRequestPermissions = async (mode: 'voice' | 'video' | 'screen'): Promise<boolean> => {
    console.log(`🎤 SHOWCASE: Starting permission request for ${mode} mode...`);
    setIsRequestingPermission(true);
    
    // Clear any previous errors
    setPermissionError(null);
    
    try {
      let constraints: MediaStreamConstraints = {};
      let stream: MediaStream;
      
      switch (mode) {
        case 'voice':
          constraints = { 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          };
          console.log('🎤 Requesting microphone access...');
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        case 'video':
          constraints = { 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }, 
            video: {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 60 }
            }
          };
          console.log('📹 Requesting camera and microphone access...');
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        case 'screen':
          console.log('🖥️ Requesting screen share access...');
          stream = await navigator.mediaDevices.getDisplayMedia({ 
            video: { 
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }, 
            audio: true 
          });
          break;
        default:
          throw new Error(`Unsupported mode: ${mode}`);
      }

      console.log(`✅ SHOWCASE: ${mode} permissions granted!`);
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
      
      setIsRequestingPermission(false);
      return true;
      
    } catch (error: any) {
      console.error(`❌ SHOWCASE: Permission request failed for ${mode}:`, error);
      setIsRequestingPermission(false);
      
      // In showcase mode, don't show intrusive permission errors
      if (showcaseMode) {
        console.log(`🎭 SHOWCASE MODE: Suppressing permission error for ${mode}`);
        
        // Add a non-intrusive message to chat instead
        const showcaseMessage: MessageData = {
          id: Date.now().toString(),
          content: `🎭 **Showcase Mode Alert**\n\n${mode.charAt(0).toUpperCase() + mode.slice(1)} mode requires permission.\n\n💡 **For full functionality:**\n1. Click the 🔒 in your address bar\n2. Select "Allow" for ${mode === 'video' ? 'Camera & Microphone' : mode === 'screen' ? 'Screen Sharing' : 'Microphone'}\n3. Try ${mode} mode again\n\n**Currently showing UI preview only.** 🎨`,
          role: 'assistant',
          timestamp: new Date(),
          type: 'insight',
          inputMode: 'text'
        };
        
        setMessages(prev => [...prev, showcaseMessage]);
        
        // Switch back to text mode gracefully
        setActiveInputMode('text');
        return false;
      }
      
      // Normal permission error handling for production mode
      let errorMessage = `**${mode.charAt(0).toUpperCase() + mode.slice(1)} Access Required**\n\n`;
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage += `🔧 **Quick Fix:**\n1. Look for 🔒 in your address bar\n2. Click and select "Allow"\n3. Try ${mode} mode again\n\n💡 **Or refresh and allow when prompted**`;
          break;
        case 'NotFoundError':
          errorMessage += `No ${mode === 'video' ? 'camera or microphone' : mode === 'screen' ? 'display' : 'microphone'} detected.\n\nPlease check your device connections.`;
          break;
        case 'NotReadableError':
          errorMessage += `${mode === 'video' ? 'Camera or microphone' : mode === 'screen' ? 'Display' : 'Microphone'} is in use by another application.\n\nPlease close other apps and try again.`;
          break;
        default:
          errorMessage += `Please check your browser settings and device connections.\n\n**Error:** ${error.message || 'Unknown error'}`;
      }
      
      setPermissionError(errorMessage);
      return false;
    }
  };

  const handleModeChange = async (mode: 'text' | 'voice' | 'video' | 'screen') => {
    console.log(`🔄 SHOWCASE: User clicked ${mode} mode button...`);
    
    // Always clear permission errors when changing modes
    setPermissionError(null);

    if (mode === 'text') {
      setActiveInputMode(mode);
      if (streamingState.isConnected) {
        await stopStream();
      }
      return;
    }

    // In showcase mode or layout test mode, allow UI preview without real permissions
    if (showcaseMode || isLayoutTestMode()) {
      console.log(`🎨 SHOWCASE: ${mode} mode (UI preview only)`);
      setActiveInputMode(mode);
      
      // Show a friendly info message about showcase mode
      const showcaseInfo: MessageData = {
        id: Date.now().toString(),
        content: `🎨 **${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode Activated** (Preview)\n\nShowing UI components and interactions for ${mode} mode.\n\n**Features visible:**\n• Voice/Video visualizers\n• Audio level indicators\n• Recording animations\n• Mode-specific controls\n\n💡 Enable real ${mode} functionality by granting permissions when prompted.`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'insight',
        inputMode: mode
      };
      
      setMessages(prev => [...prev, showcaseInfo]);
      return;
    }

    if (!navigator.mediaDevices) {
      if (!showcaseMode) {
        setPermissionError(`**${mode} mode not supported**\n\nPlease use a modern browser with media device support.`);
      }
      return;
    }

    if (!hasTriedPermissions) {
      console.log(`💡 SHOWCASE: First time ${mode} - requesting permissions directly in showcase mode`);
      await requestPermissionsForMode(mode);
      return;
    }

    console.log(`🚀 SHOWCASE: Requesting ${mode} permissions`);
    await requestPermissionsForMode(mode);
  };

  const requestPermissionsForMode = async (mode: 'voice' | 'video' | 'screen') => {
    console.log(`🎤 SHOWCASE: Requesting ${mode} permissions...`);
    setHasTriedPermissions(true);
    
    const hasPermissions = await checkAndRequestPermissions(mode);
    if (!hasPermissions) {
      console.log(`❌ SHOWCASE: ${mode} permissions denied`);
      return;
    }

    console.log(`✅ SHOWCASE: ${mode} permissions granted! Activating mode...`);
    setActiveInputMode(mode);
    
    if (!streamingState.isConnected) {
      try {
        console.log(`🚀 SHOWCASE: Starting ${mode} stream...`);
        await startStream(mode);
        console.log(`✅ SHOWCASE: ${mode} stream started successfully!`);
      } catch (error: any) {
        console.error(`❌ SHOWCASE: Failed to start ${mode} stream:`, error);
        setPermissionError(`Failed to start ${mode} mode: ${error.message}`);
        setActiveInputMode('text');
      }
    }
  };

  // === MESSAGE HANDLER ===
  const handleSendMessage = async (messageContent?: string, mode?: typeof activeInputMode) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const currentMode = mode || activeInputMode;
    
    const userMessage: MessageData = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      inputMode: currentMode,
      type: currentMode === 'voice' ? 'audio' : currentMode === 'video' ? 'video' : currentMode === 'screen' ? 'screen' : 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (!messageContent) setInput('');
    if (currentMode === 'voice') setPartialTranscript('');
    
    setIsLoading(true);

    // Try streaming first
    if (streamingState.isConnected && (currentMode === 'voice' || currentMode === 'video' || currentMode === 'screen')) {
      try {
        await sendStreamingMessage(content);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Streaming failed');
      }
    }

    // Enhanced response processing
    setTimeout(async () => {
      let response = '';
      let newState = { ...conversationState };
      
      // Special showcase responses
      if (content.toLowerCase().includes('show everything') || content.toLowerCase().includes('demo all')) {
        // ACTIVATE ALL COMPONENTS!
        setShowAdvancedVoiceViz(true);
        setShowConversationProgress(true);
        setShowFloatingBrandLogo(true);
        setShowQuickActions(true);
        setShowSmartPreview(true);
        setShowSmartSuggestions(true);
        setShowStreamingAudioViz(true);
        setShowFloatingHints(true);
        setShowFloatingControls(true);
        setShowLayoutTest(true);
        setShowStreamingOverlay(true);
        setShowMediaChecker(true);
        
        response = `🎉 **ALL COMPONENTS ACTIVATED!**\n\nLook around your screen - every component is now visible:\n\n**🎨 Floating Components:**\n✅ Advanced Voice Visualizer (top-left)\n✅ Conversation Progress (left side)\n✅ Floating Brand Logo (top-center)\n✅ Quick Actions Bar (bottom)\n✅ Smart Suggestion Cluster (right)\n✅ Audio Visualizer (bottom-left)\n✅ Floating Action Hints (contextual)\n✅ Simple Floating Controls (right-bottom)\n\n**📱 Interactive Panels:**\n✅ Layout Test Panel (bottom-left)\n✅ Streaming Chat Overlay (center)\n✅ Media Support Checker (system)\n\n**🎛️ Control System:**\nUse the Settings button (top-right) to toggle any component on/off!\n\n**🎭 Showcase Mode:** ${showcaseMode ? 'ON' : 'OFF'} - ${showcaseMode ? 'UI previews without permissions' : 'Full functionality with permissions'}\n\n**Try switching interfaces** or **enabling voice mode** to see even more! 🚀`;
        
        newState.name = 'Showcase User';
        newState.stage = 'email_request';
      } else if (content.toLowerCase().includes('switch interfaces')) {
        response = `🎛️ **Interface Switching Demo!**\n\nI can switch between 5 different chat interfaces:\n\n**🎯 Available Interfaces:**\n1. **Unified** (current) - Complete feature set\n2. **Live Streaming** - Real-time streaming focus\n3. **Enhanced** - Advanced AI capabilities\n4. **Classic Chat** - Simple conversation\n5. **Lead Generation** - Business-focused\n\nUse the control panel (top-right) to switch between them!\n\nWhich interface would you like to try?`;
      } else {
        // Regular conversation flow
        const analysis = analyzeMessage(content, conversationState);
        const generatedResponse = await generateResponse(analysis);
        response = generatedResponse.content;
        newState = { ...newState, ...analysis.updatedState };
      }

      const aiMessage: MessageData = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text',
        inputMode: currentMode,
        suggestions: [
          '🎮 Switch to Live interface',
          '🎤 Try voice mode',
          '📊 Show conversation progress',
          '🎛️ Open control panel'
        ],
        tools: [
          {
            name: 'Component Showcase',
            description: 'Demonstrating all available components',
            used: true
          }
        ],
        isComplete: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationState(newState);
      setIsLoading(false);
    }, 1500);
  };

  // === COMPONENT ACTIONS ===
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.toLowerCase().includes('calendar') || suggestion.toLowerCase().includes('booking')) {
      setShowBookingOverlay(true);
      return;
    }
    setInput(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleMessageAction = async (action: string, messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    switch (action) {
      case 'copy':
        await navigator.clipboard.writeText(message.content || '');
        break;
      case 'regenerate':
        console.log('Regenerating with all components active');
        break;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const fileMessage: MessageData = {
        id: Date.now().toString() + Math.random(),
        content: `📎 **File Analysis** - ${file.name}\n\nProcessing with all component systems...`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'insight',
        inputMode: activeInputMode,
        tools: [
          {
            name: 'File Analysis',
            description: 'Complete component-powered analysis',
            used: true
          }
        ]
      };
      setMessages(prev => [...prev, fileMessage]);
    }
    event.target.value = '';
  };

  // === INTERFACE RENDERER ===
  const renderActiveInterface = () => {
    const commonProps = {
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
      isRequestingPermission,
      showPermissionGuide,
      showPrePermissionModal,
      pendingMode,
      onPermissionModalConfirm: async () => {
        setShowPrePermissionModal(false);
        if (pendingMode) {
          await requestPermissionsForMode(pendingMode);
          setPendingMode(null);
        }
      },
      onPermissionModalCancel: () => {
        setShowPrePermissionModal(false);
        setPendingMode(null);
      },
      onSendMessage: handleSendMessage,
      onSuggestionClick: handleSuggestionClick,
      onMessageAction: handleMessageAction,
      onModeChange: handleModeChange,
      onFileUpload: handleFileUpload,
      onDismissError: () => {
        setPermissionError(null);
        // In showcase mode, also switch back to text mode to clear any UI state
        if (showcaseMode && activeInputMode !== 'text') {
          setActiveInputMode('text');
        }
      }
    };

    switch (activeInterface) {
      case 'live':
        return (
          <LiveStreamingInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            streamingState={streamingState}
            activeInputMode={activeInputMode}
          />
        );
      case 'enhanced':
        return (
          <EnhancedStreamingInterface
            {...commonProps}
          />
        );
      case 'chat':
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        );
      case 'lead':
        return (
          <EnhancedLeadGenerationChat />
        );
      default:
        return (
          <UnifiedChatInterface
            {...commonProps}
          />
        );
    }
  };

  // === FLOATING ACTIONS ===
  const floatingActions = [
    {
      id: 'voice',
      label: activeInputMode === 'voice' ? 'Voice Active' : 'Enable Voice',
      icon: Mic,
      active: activeInputMode === 'voice',
      action: () => handleModeChange(activeInputMode === 'voice' ? 'text' : 'voice')
    },
    {
      id: 'video',
      label: activeInputMode === 'video' ? 'Video Active' : 'Enable Video', 
      icon: Video,
      active: activeInputMode === 'video',
      action: () => handleModeChange(activeInputMode === 'video' ? 'text' : 'video')
    },
    {
      id: 'screen',
      label: activeInputMode === 'screen' ? 'Screen Active' : 'Share Screen',
      icon: Monitor,
      active: activeInputMode === 'screen',
      action: () => handleModeChange(activeInputMode === 'screen' ? 'text' : 'screen')
    },
    {
      id: 'showcase',
      label: 'Activate All Components',
      icon: Sparkles,
      active: false,
      action: () => {
        setInput('Show everything!');
        setTimeout(() => handleSendMessage(), 100);
      }
    }
  ];

  const activeComponentCount = [
    showAdvancedVoiceViz, showConversationProgress, showFloatingBrandLogo,
    showQuickActions, showSmartPreview, showSmartSuggestions,
    showStreamingAudioViz, showFloatingHints, showFloatingControls,
    showLayoutTest, showStreamingOverlay, showMediaChecker
  ].filter(Boolean).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* === ALL YOUR FLOATING COMPONENTS === */}
      
      {/* Advanced Voice Visualizer */}
      <AnimatePresence>
        {showAdvancedVoiceViz && (activeInputMode === 'voice' || activeInputMode === 'video') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 left-4 z-40"
          >
            <AdvancedVoiceVisualizer
              isListening={streamingState.isListening}
              audioLevel={streamingState.audioLevel}
              mode={activeInputMode as 'voice' | 'video'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation Progress Panel */}
      <AnimatePresence>
        {showConversationProgress && conversationState.stage !== 'greeting' && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 top-20 z-30"
          >
            <ConversationProgress
              conversationState={conversationState}
              messages={messages}
              onClose={() => setShowConversationProgress(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Brand Logo */}
      <AnimatePresence>
        {showFloatingBrandLogo && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30"
          >
            <FloatingBrandLogo />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Bar */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30"
          >
            <QuickActionsBar
              activeMode={activeInputMode}
              onModeChange={handleModeChange}
              onQuickAction={(action) => {
                switch (action) {
                  case 'radial':
                    setShowRadialMenu(true);
                    break;
                  case 'features':
                    setInput('Show everything!');
                    setTimeout(() => handleSendMessage(), 100);
                    break;
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Input Preview */}
      <AnimatePresence>
        {showSmartPreview && input.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-4 z-30"
          >
            <SmartInputPreview
              input={input}
              onSuggestionSelect={(suggestion) => setInput(suggestion)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streaming Audio Visualizer */}
      <AnimatePresence>
        {showStreamingAudioViz && (activeInputMode === 'voice' || activeInputMode === 'video') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 left-4 z-30"
          >
            <StreamingAudioVisualizer
              isListening={streamingState.isListening}
              audioLevel={streamingState.audioLevel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Hints */}
      <AnimatePresence>
        {showFloatingHints && (
          <FloatingActionHints
            activeMode={activeInputMode}
            conversationStage={conversationState.stage}
            onActionTaken={() => setShowFloatingHints(false)}
          />
        )}
      </AnimatePresence>

      {/* Simple Floating Controls */}
      <AnimatePresence>
        {showFloatingControls && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-4 bottom-20 z-30"
          >
            <SimpleFloatingControls
              activeMode={activeInputMode}
              onModeChange={handleModeChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Test Panel */}
      <AnimatePresence>
        {showLayoutTest && (
          <motion.div
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            className="fixed bottom-4 left-4 z-40"
          >
            <LayoutTestPanel onClose={() => setShowLayoutTest(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Radial Menu */}
      <AnimatePresence>
        {showRadialMenu && (
          <FloatingRadialMenu
            isOpen={showRadialMenu}
            onClose={() => setShowRadialMenu(false)}
            actions={floatingActions}
            centerIcon={Sparkles}
          />
        )}
      </AnimatePresence>

      {/* Speech to Speech Popover */}
      <AnimatePresence>
        {showSpeechPopover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <SpeechToSpeechPopover
              isOpen={showSpeechPopover}
              onClose={() => setShowSpeechPopover(false)}
              onStartSpeech={() => handleModeChange('voice')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streaming Chat Overlay */}
      <AnimatePresence>
        {showStreamingOverlay && (
          <StreamingChatOverlay
            isVisible={showStreamingOverlay}
            messages={messages.slice(-3)}
            onClose={() => setShowStreamingOverlay(false)}
          />
        )}
      </AnimatePresence>

      {/* Media Support Checker */}
      <AnimatePresence>
        {showMediaChecker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 right-4 z-30"
          >
            <MediaSupportChecker />
          </motion.div>
        )}
      </AnimatePresence>

      {/* === MAIN INTERFACE === */}
      <main className="flex-1 h-full relative">
        {enableContextTransition ? (
          <ContextTransition 
            currentStage={conversationState.stage || 'greeting'}
            isTransitioning={isLoading}
          >
            {renderActiveInterface()}
          </ContextTransition>
        ) : (
          renderActiveInterface()
        )}

        {/* Smart Suggestion Cluster */}
        {showSmartSuggestions && conversationState.stage !== 'greeting' && (
          <div className="absolute bottom-24 right-6 z-20">
            <SmartSuggestionCluster
              conversationState={conversationState}
              recentMessages={messages.slice(-3)}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}
      </main>

      {/* === ULTIMATE CONTROL PANEL === */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="flex items-center gap-3">
          {/* Component Counter Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="holo-card px-3 py-2 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{activeComponentCount}/12</span>
            </div>
          </motion.div>

          {/* Control Panel Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControlPanel(!showControlPanel)}
            className="holo-card modern-button px-4"
          >
            <Settings className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">Ultimate Controls</span>
          </Button>
        </div>

        {/* Expandable Control Panel */}
        <AnimatePresence>
          {showControlPanel && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-16 right-0 w-80 holo-card border border-holo-border p-4 rounded-2xl backdrop-blur-xl"
            >
              <Tabs defaultValue="components" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="components" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🎨 Floating Components</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Voice Visualizer</span>
                        <Switch checked={showAdvancedVoiceViz} onCheckedChange={setShowAdvancedVoiceViz} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Progress Panel</span>
                        <Switch checked={showConversationProgress} onCheckedChange={setShowConversationProgress} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Brand Logo</span>
                        <Switch checked={showFloatingBrandLogo} onCheckedChange={setShowFloatingBrandLogo} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quick Actions</span>
                        <Switch checked={showQuickActions} onCheckedChange={setShowQuickActions} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Smart Preview</span>
                        <Switch checked={showSmartPreview} onCheckedChange={setShowSmartPreview} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Audio Visualizer</span>
                        <Switch checked={showStreamingAudioViz} onCheckedChange={setShowStreamingAudioViz} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🎛️ Interactive Panels</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Floating Controls</span>
                        <Switch checked={showFloatingControls} onCheckedChange={setShowFloatingControls} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Layout Test</span>
                        <Switch checked={showLayoutTest} onCheckedChange={setShowLayoutTest} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Streaming Overlay</span>
                        <Switch checked={showStreamingOverlay} onCheckedChange={setShowStreamingOverlay} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Media Checker</span>
                        <Switch checked={showMediaChecker} onCheckedChange={setShowMediaChecker} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Context Transitions</span>
                        <Switch checked={enableContextTransition} onCheckedChange={setEnableContextTransition} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🎭 Showcase Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm">Showcase Mode</span>
                          <span className="text-xs text-muted-foreground">UI preview without permissions</span>
                        </div>
                        <Switch checked={showcaseMode} onCheckedChange={setShowcaseMode} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="interfaces" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">🎨 Interface Selection</CardTitle>
                      <CardDescription className="text-xs">Switch between different chat interfaces</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'unified', name: 'Unified', icon: MessageSquare, desc: 'Complete feature set' },
                          { id: 'live', name: 'Live Streaming', icon: Activity, desc: 'Real-time focus' },
                          { id: 'enhanced', name: 'Enhanced', icon: Zap, desc: 'Advanced AI' },
                          { id: 'chat', name: 'Classic Chat', icon: MessageSquare, desc: 'Simple conversation' },
                          { id: 'lead', name: 'Lead Gen', icon: Target, desc: 'Business focused' }
                        ].map((interfaceOption) => (
                          <Button
                            key={interfaceOption.id}
                            variant={activeInterface === interfaceOption.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveInterface(interfaceOption.id as any)}
                            className="justify-start h-auto p-3"
                          >
                            <interfaceOption.icon className="w-4 h-4 mr-3" />
                            <div className="text-left">
                              <div className="text-sm font-medium">{interfaceOption.name}</div>
                              <div className="text-xs text-muted-foreground">{interfaceOption.desc}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">⚡ Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowRadialMenu(true)}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Open Radial Menu
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowSpeechPopover(true)}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Speech Popover
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowBookingOverlay(true)}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Booking System
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          // Enable all components
                          setShowAdvancedVoiceViz(true);
                          setShowConversationProgress(true);
                          setShowFloatingBrandLogo(true);
                          setShowQuickActions(true);
                          setShowSmartPreview(true);
                          setShowSmartSuggestions(true);
                          setShowStreamingAudioViz(true);
                          setShowFloatingHints(true);
                          setShowFloatingControls(true);
                          setShowLayoutTest(true);
                          setShowStreamingOverlay(true);
                          setShowMediaChecker(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Show All ({activeComponentCount}/12)
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          // Hide all floating components
                          setShowAdvancedVoiceViz(false);
                          setShowConversationProgress(false);
                          setShowFloatingBrandLogo(false);
                          setShowQuickActions(false);
                          setShowSmartPreview(false);
                          setShowStreamingAudioViz(false);
                          setShowFloatingHints(false);
                          setShowFloatingControls(false);
                          setShowLayoutTest(false);
                          setShowStreamingOverlay(false);
                          setShowMediaChecker(false);
                          setShowRadialMenu(false);
                          setShowSpeechPopover(false);
                        }}
                      >
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide All
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* === BOOKING SYSTEM === */}
      <CalendarBookingOverlay
        isOpen={showBookingOverlay}
        onClose={() => setShowBookingOverlay(false)}
        onBookingComplete={(booking) => {
          setCompletedBooking(booking);
          setShowBookingOverlay(false);
          
          const confirmationMessage: MessageData = {
            id: Date.now().toString(),
            content: `🎉 **Ultimate Booking Confirmed!**\n\n**${booking.name}**, your session is scheduled with the full component showcase active!\n\n📅 **${booking.selectedDate?.toLocaleDateString()}**\n🕒 **${booking.selectedTime}**\n\nYou'll experience the complete system during our call! 🚀`,
            role: 'assistant',
            timestamp: new Date(),
            type: 'cta',
            inputMode: activeInputMode,
            isComplete: true
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
        }}
        leadData={{
          name: conversationState.name || '',
          email: conversationState.email || '',
          company: conversationState.companyInfo?.name || '',
          challenges: conversationState.discoveredChallenges || [],
          preferredSolution: conversationState.preferredSolution || 'consulting'
        }}
      />

      {/* PDF Generator (Background) */}
      {showPDFGenerator && (
        <PDFGenerator
          messages={messages}
          conversationState={conversationState}
          onGenerated={(url) => {
            console.log('PDF generated:', url);
            setShowPDFGenerator(false);
          }}
        />
      )}
    </div>
  );
}