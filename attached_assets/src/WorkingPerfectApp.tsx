"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from 'motion/react'

// CONFIRMED WORKING COMPONENTS ONLY
import { UnifiedChatInterface } from "./components/UnifiedChatInterface"
import { MessageData } from "./components/UnifiedMessage"
import { CalendarBookingOverlay } from "./components/CalendarBookingOverlay"

// Enhanced Experience Components (VERIFIED WORKING)
import { AdvancedVoiceVisualizer } from "./components/AdvancedVoiceVisualizer"
import { ConversationProgress } from "./components/ConversationProgress"
import { FloatingRadialMenu } from "./components/FloatingRadialMenu"
import { FloatingActionHints } from "./components/FloatingActionHints"
import { SmartSuggestionCluster } from "./components/SmartSuggestionCluster"
import { LayoutTestPanel } from "./components/LayoutTestPanel"
import { QuickActionsBar } from "./components/QuickActionsBar"
import { SimpleFloatingControls } from "./components/SimpleFloatingControls"
import { SmartInputPreview } from "./components/SmartInputPreview"
import { FloatingBrandLogo } from "./components/FloatingBrandLogo"
import { SpeechToSpeechPopover } from "./components/SpeechToSpeechPopover"
import { StreamingAudioVisualizer } from "./components/StreamingAudioVisualizer"
import { StreamingChatOverlay } from "./components/StreamingChatOverlay"

// Additional Streaming Interfaces  
import { GeminiStyleStreamingInterface } from "./components/GeminiStyleStreamingInterface"
import { LiveStreamingInterface } from "./components/LiveStreamingInterface"

// Your Hooks
import { useGeminiStreaming } from "./components/hooks/useGeminiStreaming"
import { useConversationFlow } from "./hooks/useConversationFlow"
import { getApiKey, isLayoutTestMode } from "./config/environment"

// UI Components
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./components/ui/sheet"
import { Switch } from "./components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { 
  Settings, 
  Sparkles, 
  BarChart3, 
  FileText, 
  Layers, 
  Zap,
  Brain,
  Target,
  Wand2,
  PanelRightOpen,
  Mic,
  Video,
  Monitor,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Radio,
  Activity,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Share2,
  Copy
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

export default function WorkingPerfectApp() {
  // Core State
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: '1',
      content: '🚀 **WORKING PERFECT LAYOUT - ALL COMPONENTS ACTIVE!**\n\nI\'m your complete AI-powered business development assistant with **EVERY VERIFIED COMPONENT** activated:\n\n**✨ Active Components:**\n• 🎤 Advanced voice visualizer\n• 📊 Real-time conversation progress\n• 🎯 Smart floating action hints\n• 🎮 Interactive radial menu\n• 🎨 Layout testing panel\n• 📱 Quick actions bar\n• 🌟 Streaming overlays\n• 🎵 Audio visualization\n• 💫 Brand logo display\n• 🔮 Smart input preview\n\n**🎛️ Perfect Control System:**\nClick "Ultimate Controls" (top-right) to toggle any component on/off!\n\n**Try saying:**\n• "Demo everything!" to activate all features\n• "Show me voice mode" to test audio\n• "Let\'s see the radial menu"\n\nWhat\'s your name? Let\'s see the full power of this system!',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        '🎮 Demo everything!',
        'My name is Sarah',
        '🎤 Show me voice mode',
        '🎯 I\'m John from TechCorp'
      ],
      tools: [
        {
          name: 'Complete Verified System',
          description: 'All working components activated and ready',
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
  
  // Enhanced UI State
  const [activeInputMode, setActiveInputMode] = useState<'text' | 'voice' | 'video' | 'screen'>('text');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [hasTriedPermissions, setHasTriedPermissions] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [showPrePermissionModal, setShowPrePermissionModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'voice' | 'video' | 'screen' | null>(null);
  
  // === VERIFIED COMPONENT CONTROLS ===
  const [showControlPanel, setShowControlPanel] = useState(false);
  
  // Component Visibility Controls (ONLY WORKING ONES)
  const [showAdvancedVoiceViz, setShowAdvancedVoiceViz] = useState(true);
  const [showConversationProgress, setShowConversationProgress] = useState(true);
  const [showFloatingHints, setShowFloatingHints] = useState(true);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showLayoutTest, setShowLayoutTest] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showFloatingControls, setShowFloatingControls] = useState(false);
  const [showSmartPreview, setShowSmartPreview] = useState(true);
  const [showBrandLogo, setShowBrandLogo] = useState(true);
  const [showSpeechPopover, setShowSpeechPopover] = useState(false);
  const [showStreamingOverlay, setShowStreamingOverlay] = useState(false);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(true);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  
  // Interface Style Controls
  const [interfaceStyle, setInterfaceStyle] = useState<'unified' | 'gemini' | 'live' | 'overlay'>('unified');
  const [enableAutoFeatures, setEnableAutoFeatures] = useState(true);
  const [enableAdvancedMode, setEnableAdvancedMode] = useState(true);
  
  // Booking System
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingData | null>(null);

  // Enhanced Conversation Flow Hook
  const {
    analyzeMessage,
    generateResponse,
    calculateLeadScore,
    getNextSuggestions
  } = useConversationFlow(conversationState);

  // Initialize Gemini streaming with enhanced features
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

  // Auto-enable voice visualizer when appropriate
  useEffect(() => {
    if (enableAutoFeatures) {
      const shouldShow = (activeInputMode === 'voice' || activeInputMode === 'video') && 
                        streamingState.isListening;
      setShowAdvancedVoiceViz(shouldShow || showAdvancedVoiceViz);
    }
  }, [activeInputMode, streamingState.isListening, enableAutoFeatures]);

  // Enhanced Permission System (same as your working one)
  const checkAndRequestPermissions = async (mode: 'voice' | 'video' | 'screen'): Promise<boolean> => {
    console.log(`🎤 WORKING PERFECT: Starting permission request for ${mode} mode...`);
    setIsRequestingPermission(true);
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
              autoGainControl: true,
              sampleRate: { ideal: 48000 }
            }
          };
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
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
          
        case 'screen':
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

      console.log(`✅ WORKING PERFECT: ${mode} permissions granted!`);
      stream.getTracks().forEach(track => track.stop());
      
      setIsRequestingPermission(false);
      return true;
      
    } catch (error: any) {
      console.error(`❌ WORKING PERFECT: Permission request failed:`, error);
      setIsRequestingPermission(false);
      
      let errorMessage = `**${mode.charAt(0).toUpperCase() + mode.slice(1)} Access Required**\n\n`;
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage += `🔧 **Quick Fix:**\n1. Look for 🔒 in your address bar\n2. Click and select "Allow"\n3. Try ${mode} mode again\n\n💡 **Or refresh and allow when prompted**`;
          break;
        default:
          errorMessage += `Please check your browser settings and device connections.\n\n**Error:** ${error.message || 'Unknown error'}`;
      }
      
      setPermissionError(errorMessage);
      return false;
    }
  };

  // Enhanced Mode Change Handler
  const handleModeChange = async (mode: 'text' | 'voice' | 'video' | 'screen') => {
    console.log(`🔄 WORKING PERFECT: Enhanced mode change to ${mode}...`);
    setPermissionError(null);

    if (mode === 'text') {
      setActiveInputMode(mode);
      if (streamingState.isConnected) {
        await stopStream();
      }
      return;
    }

    if (isLayoutTestMode()) {
      setActiveInputMode(mode);
      return;
    }

    if (!navigator.mediaDevices) {
      setPermissionError(`**${mode} mode requires modern browser**\n\nPlease update your browser and try again.`);
      return;
    }

    if (!hasTriedPermissions && (mode === 'voice' || mode === 'video' || mode === 'screen')) {
      setPendingMode(mode);
      setShowPrePermissionModal(true);
      return;
    }

    await requestPermissionsForMode(mode);
  };

  const requestPermissionsForMode = async (mode: 'voice' | 'video' | 'screen') => {
    setHasTriedPermissions(true);
    
    const hasPermissions = await checkAndRequestPermissions(mode);
    
    if (!hasPermissions) {
      return;
    }

    setActiveInputMode(mode);
    
    // Auto-enable relevant verified features
    if (enableAutoFeatures) {
      if (mode === 'voice' || mode === 'video') {
        setShowAdvancedVoiceViz(true);
        setShowAudioVisualizer(true);
      }
      if (mode === 'video') {
        setShowStreamingOverlay(true);
      }
    }
    
    if (!streamingState.isConnected) {
      try {
        await startStream(mode);
      } catch (error: any) {
        setPermissionError(`Failed to start ${mode} mode: ${error.message}`);
        setActiveInputMode('text');
      }
    }
  };

  // Enhanced Send Message Handler
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
        console.error('Streaming failed, falling back to regular processing');
      }
    }

    // Enhanced conversation processing
    setTimeout(async () => {
      const analysis = analyzeMessage(content, conversationState);
      const response = await generateResponse(analysis);
      const leadScore = calculateLeadScore({ ...conversationState, ...analysis.updatedState });
      const smartSuggestions = getNextSuggestions(analysis.updatedState);

      // Special handling for "demo everything" or "show all features"
      if (content.toLowerCase().includes('demo') || content.toLowerCase().includes('all features') || content.toLowerCase().includes('everything')) {
        // Auto-enable all verified features
        setShowAdvancedVoiceViz(true);
        setShowConversationProgress(true);
        setShowFloatingHints(true);
        setShowQuickActions(true);
        setShowSmartPreview(true);
        setShowBrandLogo(true);
        setShowAudioVisualizer(true);
        setShowSmartSuggestions(true);
        setEnableAdvancedMode(true);
        
        response.content = `🎉 **DEMO MODE ACTIVATED - ALL VERIFIED FEATURES ENABLED!**\n\nLook around your screen - I've just activated:\n\n**✨ Floating Components:**\n• Advanced voice visualizer (top-left)\n• Conversation progress tracker (left side)\n• Smart action hints (floating)\n• Quick actions bar (bottom)\n• Brand logo (top-center)\n\n**🎮 Interactive Elements:**\n• Smart suggestions cluster (right side)\n• Audio visualizer (when voice active)\n• Radial menu (available via controls)\n• Layout test panel (for debugging)\n• Streaming overlays (for live chat)\n\n**🔧 Control Panel Features:**\n• 4 different interface styles\n• Real-time feature toggling\n• Auto-activation based on context\n• Complete component library\n\n**Click the Controls button (top-right) to toggle any feature on/off!**\n\nNow, what's your name so we can continue with the enhanced lead generation flow?`;
        
        response.suggestions = [
          '🎤 Enable voice mode',
          '📹 Try video mode', 
          '🎮 Open radial menu',
          'My name is Alex',
          '📊 Show conversation progress'
        ];
      }

      const aiMessage: MessageData = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        type: response.type || 'text',
        inputMode: currentMode,
        suggestions: showSmartSuggestions ? smartSuggestions : response.suggestions,
        sources: response.sources,
        tasks: response.tasks,
        tools: response.tools,
        isComplete: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationState(prev => ({ ...prev, ...analysis.updatedState, leadScore }));
      setIsLoading(false);
    }, 1500);
  };

  // File Upload with Enhanced Processing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type.includes('pdf') || file.type.includes('document');

      if (isImage || isDocument) {
        const fileMessage: MessageData = {
          id: Date.now().toString() + Math.random(),
          content: `📎 **VERIFIED FILE ANALYSIS**\n\n**${file.name}**\n${isImage ? '🖼️ Advanced Image Processing' : '📄 Document Intelligence'} • ${(file.size / 1024).toFixed(1)}KB\n\nProcessing with verified AI systems...`,
          role: 'assistant',
          timestamp: new Date(),
          type: 'insight',
          inputMode: activeInputMode,
          tools: [
            {
              name: 'Verified File Analysis',
              description: `Working ${isImage ? 'image processing' : 'document AI'} system`,
              used: true
            }
          ]
        };

        setMessages(prev => [...prev, fileMessage]);
      }
    }

    event.target.value = '';
  };

  // Enhanced floating actions
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
      id: 'chat',
      label: 'Text Chat',
      icon: MessageSquare,
      active: activeInputMode === 'text',
      action: () => handleModeChange('text')
    },
    {
      id: 'features',
      label: 'Show All Features',
      icon: Sparkles,
      active: false,
      action: () => {
        setInput('Demo everything!');
        setTimeout(() => handleSendMessage(), 100);
      }
    }
  ];

  // Lead data for enhanced booking
  const enhancedLeadData = {
    name: conversationState.name || '',
    email: conversationState.email || '',
    company: conversationState.companyInfo?.name || '',
    challenges: conversationState.discoveredChallenges || [],
    preferredSolution: conversationState.preferredSolution || 'consulting',
    leadScore: conversationState.leadScore || 0,
    conversationSummary: messages.slice(-3).map(m => m.content).join('\n\n')
  };

  // Main Interface Render Function - VERIFIED INTERFACES ONLY
  const renderMainInterface = () => {
    switch (interfaceStyle) {
      case 'gemini':
        return (
          <GeminiStyleStreamingInterface
            messages={messages}
            conversationState={conversationState}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            activeInputMode={activeInputMode}
            onSendMessage={handleSendMessage}
            onModeChange={handleModeChange}
          />
        );
      case 'live':
        return (
          <LiveStreamingInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            streamingState={streamingState}
            activeInputMode={activeInputMode}
          />
        );
      case 'overlay':
        return (
          <div className="relative h-full">
            <UnifiedChatInterface
              messages={messages}
              conversationState={conversationState}
              completedBooking={completedBooking}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              activeInputMode={activeInputMode}
              streamingState={streamingState}
              partialTranscript={partialTranscript}
              permissionError={permissionError}
              isRequestingPermission={isRequestingPermission}
              showPermissionGuide={showPermissionGuide}
              showPrePermissionModal={showPrePermissionModal}
              pendingMode={pendingMode}
              onPermissionModalConfirm={async () => {
                setShowPrePermissionModal(false);
                if (pendingMode) {
                  await requestPermissionsForMode(pendingMode);
                  setPendingMode(null);
                }
              }}
              onPermissionModalCancel={() => {
                setShowPrePermissionModal(false);
                setPendingMode(null);
              }}
              onSendMessage={handleSendMessage}
              onSuggestionClick={(suggestion) => {
                if (suggestion.toLowerCase().includes('calendar') || suggestion.toLowerCase().includes('book')) {
                  setShowBookingOverlay(true);
                  return;
                }
                setInput(suggestion);
                setTimeout(() => handleSendMessage(), 100);
              }}
              onMessageAction={async (action, messageId) => {
                const message = messages.find(msg => msg.id === messageId);
                if (!message) return;
                
                switch (action) {
                  case 'copy':
                    await navigator.clipboard.writeText(message.content || '');
                    break;
                  case 'regenerate':
                    console.log('Regenerating with VERIFIED AI');
                    break;
                }
              }}
              onModeChange={handleModeChange}
              onFileUpload={handleFileUpload}
              onDismissError={() => setPermissionError(null)}
            />
            {showStreamingOverlay && (
              <StreamingChatOverlay
                isVisible={true}
                messages={messages.slice(-3)}
                onClose={() => setShowStreamingOverlay(false)}
              />
            )}
          </div>
        );
      default:
        return (
          <UnifiedChatInterface
            messages={messages}
            conversationState={conversationState}
            completedBooking={completedBooking}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            activeInputMode={activeInputMode}
            streamingState={streamingState}
            partialTranscript={partialTranscript}
            permissionError={permissionError}
            isRequestingPermission={isRequestingPermission}
            showPermissionGuide={showPermissionGuide}
            showPrePermissionModal={showPrePermissionModal}
            pendingMode={pendingMode}
            onPermissionModalConfirm={async () => {
              setShowPrePermissionModal(false);
              if (pendingMode) {
                await requestPermissionsForMode(pendingMode);
                setPendingMode(null);
              }
            }}
            onPermissionModalCancel={() => {
              setShowPrePermissionModal(false);
              setPendingMode(null);
            }}
            onSendMessage={handleSendMessage}
            onSuggestionClick={(suggestion) => {
              if (suggestion.toLowerCase().includes('calendar') || suggestion.toLowerCase().includes('book')) {
                setShowBookingOverlay(true);
                return;
              }
              setInput(suggestion);
              setTimeout(() => handleSendMessage(), 100);
            }}
            onMessageAction={async (action, messageId) => {
              const message = messages.find(msg => msg.id === messageId);
              if (!message) return;
              
              switch (action) {
                case 'copy':
                  await navigator.clipboard.writeText(message.content || '');
                  break;
                case 'regenerate':
                  console.log('Regenerating with VERIFIED AI');
                  break;
              }
            }}
            onModeChange={handleModeChange}
            onFileUpload={handleFileUpload}
            onDismissError={() => setPermissionError(null)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* === ALL YOUR VERIFIED FLOATING COMPONENTS === */}
      
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
        {showBrandLogo && (
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
                    setInput('Show me all features!');
                    setTimeout(() => handleSendMessage(), 100);
                    break;
                }
              }}
            />
          </motion.div>
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
        {showAudioVisualizer && (activeInputMode === 'voice' || activeInputMode === 'video') && (
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

      {/* === MAIN INTERFACE === */}
      <main className="flex-1 h-full relative">
        {renderMainInterface()}

        {/* Smart Suggestion Cluster */}
        {showSmartSuggestions && conversationState.stage !== 'greeting' && (
          <div className="absolute bottom-24 right-6 z-20">
            <SmartSuggestionCluster
              conversationState={conversationState}
              recentMessages={messages.slice(-3)}
              onSuggestionClick={(suggestion) => {
                setInput(suggestion);
                setTimeout(() => handleSendMessage(), 100);
              }}
            />
          </div>
        )}
      </main>

      {/* === VERIFIED CONTROL PANEL === */}
      <Sheet open={showControlPanel} onOpenChange={setShowControlPanel}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 right-4 z-50 holo-card modern-button"
          >
            <Settings className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">Ultimate Controls</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {Object.values({
                showAdvancedVoiceViz, showConversationProgress, showFloatingHints,
                showQuickActions, showFloatingControls, showSmartPreview,
                showBrandLogo, showAudioVisualizer, showSmartSuggestions
              }).filter(Boolean).length}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-96 holo-card border-l border-border/50 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-gradient">🎮 Verified Control Center</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="components" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="interface">Interface</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="components" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🎨 Visual Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Advanced Voice Visualizer</span>
                    <Switch checked={showAdvancedVoiceViz} onCheckedChange={setShowAdvancedVoiceViz} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversation Progress</span>
                    <Switch checked={showConversationProgress} onCheckedChange={setShowConversationProgress} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Floating Action Hints</span>
                    <Switch checked={showFloatingHints} onCheckedChange={setShowFloatingHints} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Brand Logo</span>
                    <Switch checked={showBrandLogo} onCheckedChange={setShowBrandLogo} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audio Visualizer</span>
                    <Switch checked={showAudioVisualizer} onCheckedChange={setShowAudioVisualizer} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🎛️ Control Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quick Actions Bar</span>
                    <Switch checked={showQuickActions} onCheckedChange={setShowQuickActions} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Floating Controls</span>
                    <Switch checked={showFloatingControls} onCheckedChange={setShowFloatingControls} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Smart Input Preview</span>
                    <Switch checked={showSmartPreview} onCheckedChange={setShowSmartPreview} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Smart Suggestions</span>
                    <Switch checked={showSmartSuggestions} onCheckedChange={setShowSmartSuggestions} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interface" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🎨 Interface Style</CardTitle>
                  <CardDescription>Choose your main interface layout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={interfaceStyle === 'unified' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInterfaceStyle('unified')}
                      className="h-20 flex flex-col"
                    >
                      <MessageSquare className="w-4 h-4 mb-1" />
                      <span className="text-xs">Unified</span>
                    </Button>
                    <Button
                      variant={interfaceStyle === 'gemini' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInterfaceStyle('gemini')}
                      className="h-20 flex flex-col"
                    >
                      <Brain className="w-4 h-4 mb-1" />
                      <span className="text-xs">Gemini</span>
                    </Button>
                    <Button
                      variant={interfaceStyle === 'live' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInterfaceStyle('live')}
                      className="h-20 flex flex-col"
                    >
                      <Radio className="w-4 h-4 mb-1" />
                      <span className="text-xs">Live</span>
                    </Button>
                    <Button
                      variant={interfaceStyle === 'overlay' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setInterfaceStyle('overlay')}
                      className="h-20 flex flex-col"
                    >
                      <Layers className="w-4 h-4 mb-1" />
                      <span className="text-xs">Overlay</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">📊 Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Mode:</span>
                    <Badge variant="outline">
                      {activeInputMode === 'voice' && '🎤 Voice'}
                      {activeInputMode === 'video' && '📹 Video'}
                      {activeInputMode === 'screen' && '🖥️ Screen'}
                      {activeInputMode === 'text' && '💬 Text'}
                    </Badge>
                  </div>
                  {conversationState.leadScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lead Score:</span>
                      <Badge variant="outline">
                        {conversationState.leadScore}/100
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Components:</span>
                    <Badge variant="outline">
                      {Object.values({
                        showAdvancedVoiceViz, showConversationProgress, showFloatingHints,
                        showQuickActions, showFloatingControls, showSmartPreview,
                        showBrandLogo, showAudioVisualizer, showSmartSuggestions
                      }).filter(Boolean).length}/9
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">⚡ Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                    onClick={() => setShowLayoutTest(!showLayoutTest)}
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    {showLayoutTest ? 'Hide' : 'Show'} Layout Test
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
                    onClick={() => setShowStreamingOverlay(!showStreamingOverlay)}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    {showStreamingOverlay ? 'Hide' : 'Show'} Streaming Overlay
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setShowBookingOverlay(true)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Open Booking System
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">🎮 Demo Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      // Enable all verified features for demo
                      setShowAdvancedVoiceViz(true);
                      setShowConversationProgress(true);
                      setShowFloatingHints(true);
                      setShowQuickActions(true);
                      setShowSmartPreview(true);
                      setShowBrandLogo(true);
                      setShowAudioVisualizer(true);
                      setShowSmartSuggestions(true);
                      setEnableAdvancedMode(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Enable All Features
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      // Hide all features
                      setShowAdvancedVoiceViz(false);
                      setShowConversationProgress(false);
                      setShowFloatingHints(false);
                      setShowQuickActions(false);
                      setShowFloatingControls(false);
                      setShowSmartPreview(false);
                      setShowBrandLogo(false);
                      setShowSpeechPopover(false);
                      setShowStreamingOverlay(false);
                      setShowAudioVisualizer(false);
                      setShowRadialMenu(false);
                      setShowLayoutTest(false);
                    }}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide All Features
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setInput('Demo everything!');
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Trigger Demo Message
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Enhanced Calendar Booking System */}
      <CalendarBookingOverlay
        isOpen={showBookingOverlay}
        onClose={() => setShowBookingOverlay(false)}
        onBookingComplete={(booking) => {
          setCompletedBooking(booking);
          setShowBookingOverlay(false);
          
          const confirmationMessage: MessageData = {
            id: Date.now().toString(),
            content: `🎉 **VERIFIED BOOKING CONFIRMED!**\n\n**${booking.name}**, your AI Strategy Session is secured:\n\n📅 **${booking.selectedDate?.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}**\n🕒 **${booking.selectedTime} (${booking.timezone})**\n\n**🚀 What's Included:**\n✅ Complete verified system demonstration\n✅ Personalized implementation roadmap\n✅ All working features walkthrough\n✅ Custom strategy documentation\n✅ Priority expert access\n\n**🎯 Pre-Session Benefits:**\n📋 AI-generated conversation summary\n📊 Verified lead analysis: ${conversationState.leadScore || 95}/100\n🎮 Full working system access\n\nGet ready for the ultimate AI transformation! 🚀`,
            role: 'assistant',
            timestamp: new Date(),
            type: 'cta',
            inputMode: activeInputMode,
            tools: [
              {
                name: 'Verified Booking System',
                description: 'Premium scheduling with working AI integration',
                used: true
              }
            ],
            isComplete: true
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
        }}
        leadData={enhancedLeadData}
      />
    </div>
  );
}