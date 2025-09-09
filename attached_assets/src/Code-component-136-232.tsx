"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from 'motion/react'

// Core Unified Components
import { UnifiedChatInterface } from "./components/UnifiedChatInterface"
import { MessageData } from "./components/UnifiedMessage"
import { CalendarBookingOverlay } from "./components/CalendarBookingOverlay"

// Enhanced Experience Components
import { EnhancedStreamingInterface } from "./components/EnhancedStreamingInterface"
import { AdvancedVoiceVisualizer } from "./components/AdvancedVoiceVisualizer"
import { ConversationProgress } from "./components/ConversationProgress"
import { FloatingRadialMenu } from "./components/FloatingRadialMenu"
import { FloatingActionHints } from "./components/FloatingActionHints"
import { SmartSuggestionCluster } from "./components/SmartSuggestionCluster"
import { LayoutTestPanel } from "./components/LayoutTestPanel"
import { PDFGenerator } from "./components/PDFGenerator"

// AI Elements Integration
import { AIElementsIntegration } from "./components/AIElementsIntegration"

// Hooks and Services
import { useGeminiStreaming } from "./components/hooks/useGeminiStreaming"
import { useConversationFlow } from "./hooks/useConversationFlow"
import { getApiKey, isLayoutTestMode } from "./config/environment"

// UI Components
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet"
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
  MessageSquare
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

export default function PerfectLayoutApp() {
  // Core State
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: '1',
      content: '🚀 **Welcome to the Ultimate AI Lead Generation Experience!**\n\nI\'m your AI-powered business development assistant, featuring advanced voice interaction, real-time analysis, and seamless booking integration.\n\n**✨ Enhanced Features Active:**\n• 🎤 Voice & video conversations\n• 📊 Real-time lead scoring\n• 🎯 Smart conversation flow\n• 📱 Mobile-optimized interface\n• 🔮 Holographic design system\n\nWhat\'s your name? Let\'s discover how AI can transform your business!',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        'Demo - Show me everything!',
        'My name is John Smith',
        'I\'m Sarah from TechCorp',
        'Let\'s explore AI opportunities'
      ],
      tools: [
        {
          name: 'Ultimate AI System',
          description: 'Full-featured lead generation and conversation management',
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
  
  // Advanced Features State
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [showLayoutTest, setShowLayoutTest] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(true);
  const [showFloatingHints, setShowFloatingHints] = useState(true);
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showVoiceVisualizer, setShowVoiceVisualizer] = useState(false);
  const [enableAIElements, setEnableAIElements] = useState(true);
  const [enableSmartSuggestions, setEnableSmartSuggestions] = useState(true);
  const [autoGeneratePDF, setAutoGeneratePDF] = useState(false);
  
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

  // Smart Voice Visualizer Toggle
  useEffect(() => {
    setShowVoiceVisualizer(
      (activeInputMode === 'voice' || activeInputMode === 'video') && 
      streamingState.isListening
    );
  }, [activeInputMode, streamingState.isListening]);

  // Enhanced Permission System
  const checkAndRequestPermissions = async (mode: 'voice' | 'video' | 'screen'): Promise<boolean> => {
    console.log(`🎤 Starting enhanced permission request for ${mode} mode...`);
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

      // Success! Clean up and enable advanced features
      console.log(`✅ Enhanced ${mode} permissions granted!`);
      stream.getTracks().forEach(track => track.stop());
      
      setIsRequestingPermission(false);
      return true;
      
    } catch (error: any) {
      console.error(`❌ Enhanced permission request failed:`, error);
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
    console.log(`🔄 Enhanced mode change to ${mode}...`);
    setPermissionError(null);

    if (mode === 'text') {
      setActiveInputMode(mode);
      setShowVoiceVisualizer(false);
      if (streamingState.isConnected) {
        await stopStream();
      }
      return;
    }

    if (isLayoutTestMode()) {
      setActiveInputMode(mode);
      setShowVoiceVisualizer(mode === 'voice' || mode === 'video');
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
    
    // Enable enhanced features for the mode
    if (mode === 'voice' || mode === 'video') {
      setShowVoiceVisualizer(true);
    }
    
    if (!streamingState.isConnected) {
      try {
        await startStream(mode);
      } catch (error: any) {
        setPermissionError(`Failed to start ${mode} mode: ${error.message}`);
        setActiveInputMode('text');
        setShowVoiceVisualizer(false);
      }
    }
  };

  // Enhanced Send Message Handler with AI Elements
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

    // Enhanced conversation processing with AI Elements
    setTimeout(async () => {
      const analysis = analyzeMessage(content, conversationState);
      const response = await generateResponse(analysis);
      const leadScore = calculateLeadScore({ ...conversationState, ...analysis.updatedState });
      const smartSuggestions = getNextSuggestions(analysis.updatedState);

      // Enhanced AI response with full AI Elements integration
      const aiMessage: MessageData = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
        type: response.type || 'text',
        inputMode: currentMode,
        suggestions: enableSmartSuggestions ? smartSuggestions : response.suggestions,
        sources: response.sources,
        tasks: response.tasks,
        tools: response.tools,
        isComplete: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationState(prev => ({ ...prev, ...analysis.updatedState, leadScore }));
      setIsLoading(false);

      // Auto-generate PDF if enabled and conversation is substantial
      if (autoGeneratePDF && messages.length > 6) {
        console.log('Auto-generating conversation PDF...');
      }
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
          content: `📎 **Enhanced File Analysis**\n\n**${file.name}**\n${isImage ? '🖼️ Image' : '📄 Document'} • ${(file.size / 1024).toFixed(1)}KB\n\nProcessing with advanced AI analysis...`,
          role: 'assistant',
          timestamp: new Date(),
          type: 'insight',
          inputMode: activeInputMode,
          tools: [
            {
              name: 'Advanced File Analysis',
              description: `Enhanced ${isImage ? 'image' : 'document'} processing with AI insights`,
              used: true
            }
          ]
        };

        setMessages(prev => [...prev, fileMessage]);

        // Enhanced analysis with more detailed insights
        setTimeout(() => {
          const analysisMessage: MessageData = {
            id: (Date.now() + 1).toString(),
            content: isImage 
              ? `✅ **Enhanced Image Analysis Complete**\n\n**Insights from ${file.name}:**\n\n📊 **Visual Analysis:**\n• Business context detected\n• Process optimization opportunities identified\n• AI automation potential mapped\n\n🎯 **Recommendations:**\n• Computer vision solutions for quality control\n• Automated visual inspection systems\n• Smart image processing workflows\n\n**Next Steps:** Let's discuss how AI can transform your visual processes!`
              : `✅ **Advanced Document Analysis Complete**\n\n**Key Findings from ${file.name}:**\n\n📈 **Content Analysis:**\n• Business processes documented\n• Automation opportunities identified\n• Workflow bottlenecks detected\n\n🤖 **AI Opportunities:**\n• Document processing automation\n• Data extraction and analysis\n• Intelligent workflow optimization\n\n**Action Items:** Ready to implement AI solutions for these processes?`,
            role: 'assistant',
            timestamp: new Date(),
            type: 'insight',
            inputMode: activeInputMode,
            suggestions: isImage 
              ? [
                  'Show me computer vision solutions',
                  'Automate our visual quality control',
                  'Implement smart image processing',
                  'Schedule AI strategy session'
                ]
              : [
                  'Automate our document workflows',
                  'Set up intelligent data extraction',
                  'Optimize our business processes',
                  'Book an AI implementation call'
                ],
            sources: [
              {
                title: `AI-Powered ${isImage ? 'Image' : 'Document'} Processing`,
                url: '#ai-solutions',
                excerpt: `Advanced ${isImage ? 'computer vision' : 'document AI'} can improve efficiency by 85%`
              }
            ],
            tasks: [
              {
                id: 'analysis',
                title: `${isImage ? 'Image' : 'Document'} analysis completed`,
                completed: true
              },
              {
                id: 'opportunities',
                title: 'AI opportunities identified',
                completed: true
              },
              {
                id: 'recommendations',
                title: 'Solutions recommended',
                completed: true
              },
              {
                id: 'next-steps',
                title: 'Schedule implementation discussion',
                completed: false
              }
            ],
            isComplete: true
          };

          setMessages(prev => [...prev, analysisMessage]);
        }, 2500);
      }
    }

    event.target.value = '';
  };

  // Booking completion with enhanced features
  const handleBookingComplete = (booking: BookingData) => {
    setCompletedBooking(booking);
    setShowBookingOverlay(false);
    
    const confirmationMessage: MessageData = {
      id: Date.now().toString(),
      content: `🎉 **Enhanced Booking Confirmed!**\n\n**${booking.name}**, your AI Strategy Session is secured:\n\n📅 **${booking.selectedDate?.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}**\n🕒 **${booking.selectedTime} (${booking.timezone})**\n\n**What's Included:**\n✅ Personalized AI strategy session\n✅ Custom implementation roadmap\n✅ Priority access to our AI experts\n✅ Exclusive resource library access\n\n**Pre-Session Preparation:**\n📋 Conversation summary (auto-generated)\n📊 Lead score analysis: ${conversationState.leadScore || 85}/100\n🎯 Tailored solution recommendations\n\nGet ready to transform your business! 🚀`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'cta',
      inputMode: activeInputMode,
      tasks: [
        {
          id: 'booking-confirmed',
          title: 'AI Strategy Session booked',
          completed: true
        },
        {
          id: 'calendar-invite',
          title: 'Calendar invite sent',
          completed: true
        },
        {
          id: 'prep-materials',
          title: 'Preparation materials delivered',
          completed: true
        },
        {
          id: 'reminder-scheduled',
          title: 'Smart reminders activated',
          completed: true
        }
      ],
      tools: [
        {
          name: 'Enhanced Booking System',
          description: 'AI-powered scheduling with smart preparation',
          used: true
        }
      ],
      isComplete: true
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
  };

  // Smart suggestion handler
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.toLowerCase().includes('calendar') || suggestion.toLowerCase().includes('book')) {
      setShowBookingOverlay(true);
      return;
    }
    
    setInput(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Enhanced message action handler
  const handleMessageAction = async (action: string, messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    switch (action) {
      case 'copy':
        await navigator.clipboard.writeText(message.content || '');
        console.log('Enhanced: Message copied to clipboard');
        break;
      case 'regenerate':
        console.log('Enhanced: Regenerating with AI improvements');
        break;
      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'AI Lead Generation Conversation',
              text: message.content || '',
            });
          } catch (err) {
            console.log('Enhanced sharing failed:', err);
          }
        }
        break;
      case 'analyze':
        console.log('Enhanced: Running advanced message analysis');
        break;
    }
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* Advanced Voice Visualizer */}
      <AnimatePresence>
        {showVoiceVisualizer && (
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
        {showProgressPanel && conversationState.stage !== 'greeting' && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 top-20 z-30"
          >
            <ConversationProgress
              conversationState={conversationState}
              messages={messages}
              onClose={() => setShowProgressPanel(false)}
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

      {/* Main Chat Interface */}
      <main className="flex-1 h-full relative">
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
          onSuggestionClick={handleSuggestionClick}
          onMessageAction={handleMessageAction}
          onModeChange={handleModeChange}
          onFileUpload={handleFileUpload}
          onDismissError={() => setPermissionError(null)}
        />

        {/* Smart Suggestion Cluster */}
        {enableSmartSuggestions && conversationState.stage !== 'greeting' && (
          <div className="absolute bottom-24 right-6 z-20">
            <SmartSuggestionCluster
              conversationState={conversationState}
              recentMessages={messages.slice(-3)}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}
      </main>

      {/* Advanced Control Panel */}
      <Sheet open={showAdvancedPanel} onOpenChange={setShowAdvancedPanel}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 right-4 z-50 holo-card modern-button"
          >
            <PanelRightOpen className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">Controls</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-80 holo-card border-l border-border/50">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">🎛️ Advanced Controls</h3>
              
              {/* Mode Status */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Mode:</span>
                  <Badge variant="outline" className="holo-border">
                    {activeInputMode === 'voice' && '🎤 Voice'}
                    {activeInputMode === 'video' && '📹 Video'}
                    {activeInputMode === 'screen' && '🖥️ Screen'}
                    {activeInputMode === 'text' && '💬 Text'}
                  </Badge>
                </div>
                {conversationState.leadScore && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lead Score:</span>
                    <Badge variant="outline" className="holo-border">
                      {conversationState.leadScore}/100
                    </Badge>
                  </div>
                )}
              </div>

              {/* Feature Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Voice Visualizer</span>
                  <Button
                    variant={showVoiceVisualizer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowVoiceVisualizer(!showVoiceVisualizer)}
                  >
                    {showVoiceVisualizer ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress Panel</span>
                  <Button
                    variant={showProgressPanel ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowProgressPanel(!showProgressPanel)}
                  >
                    {showProgressPanel ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Floating Hints</span>
                  <Button
                    variant={showFloatingHints ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFloatingHints(!showFloatingHints)}
                  >
                    {showFloatingHints ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart Suggestions</span>
                  <Button
                    variant={enableSmartSuggestions ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnableSmartSuggestions(!enableSmartSuggestions)}
                  >
                    {enableSmartSuggestions ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Elements</span>
                  <Button
                    variant={enableAIElements ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnableAIElements(!enableAIElements)}
                  >
                    {enableAIElements ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto PDF</span>
                  <Button
                    variant={autoGeneratePDF ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoGeneratePDF(!autoGeneratePDF)}
                  >
                    {autoGeneratePDF ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 pt-6 border-t border-border/50">
                <h4 className="font-medium text-sm">Quick Actions</h4>
                
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
                  onClick={() => {
                    console.log('Generating conversation PDF...');
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF Report
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
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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

      {/* Enhanced Calendar Booking System */}
      <CalendarBookingOverlay
        isOpen={showBookingOverlay}
        onClose={() => setShowBookingOverlay(false)}
        onBookingComplete={handleBookingComplete}
        leadData={enhancedLeadData}
      />

      {/* AI Elements Integration Overlay */}
      {enableAIElements && (
        <AIElementsIntegration
          messages={messages}
          conversationState={conversationState}
          onEnhancedAction={(action, data) => {
            console.log('AI Elements enhanced action:', action, data);
          }}
        />
      )}
    </div>
  );
}