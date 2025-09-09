"use client"

import React, { useState, useEffect } from "react"

// ONLY CORE COMPONENTS - NO PROBLEMATIC IMPORTS
import { UnifiedChatInterface } from "./components/UnifiedChatInterface"
import { MessageData } from "./components/UnifiedMessage"
import { CalendarBookingOverlay } from "./components/CalendarBookingOverlay"
import { useGeminiStreaming } from "./components/hooks/useGeminiStreaming"
import { getApiKey, isLayoutTestMode } from "./config/environment"

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

export default function CleanWorkingApp() {
  // Essential state only
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: '1',
      content: '🎯 **Welcome to the Clean AI Lead Generation System!**\n\nI\'m here to showcase our interactive AI components while helping you discover how AI can transform your business. What\'s your name?\n\n*Try typing "Demo" to see all AI Elements in action!*',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        'Demo - Show me AI Elements!',
        'My name is John Smith',
        'I\'m Sarah from TechCorp',
        'Call me Mike'
      ],
      tools: [
        {
          name: 'AI Elements System',
          description: 'Interactive components for enhanced conversations',
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
  
  // Minimal streaming state
  const [activeInputMode, setActiveInputMode] = useState<'text' | 'voice' | 'video' | 'screen'>('text');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [hasTriedPermissions, setHasTriedPermissions] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [showPrePermissionModal, setShowPrePermissionModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'voice' | 'video' | 'screen' | null>(null);
  
  // Booking system
  const [showBookingOverlay, setShowBookingOverlay] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingData | null>(null);

  // Initialize Gemini streaming (minimal setup)
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

  // Business logic functions (simplified)
  const analyzeCompanyFromEmail = async (email: string) => {
    const domain = email.split('@')[1];
    const genericDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
    
    if (genericDomains.includes(domain)) {
      return {
        name: "your company",
        domain: domain,
        industry: "various industries",
        insights: ["Many professionals are exploring AI automation to stay competitive"],
        challenges: ["improving operational efficiency", "staying ahead of industry trends"]
      };
    }

    const companyName = domain.replace('.com', '').replace('.co', '').replace(/[^a-zA-Z0-9]/g, ' ');
    const industries = ['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'consulting'];
    const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
    
    return {
      name: companyName,
      domain: domain,
      industry: randomIndustry,
      insights: [
        `${companyName} appears to be in the ${randomIndustry} sector`,
        `Companies in ${randomIndustry} are increasingly adopting AI solutions`,
        `Industry trend shows 40% growth in AI adoption this year`
      ],
      challenges: [`workflow automation in ${randomIndustry}`, "data-driven decision making", "competitive advantage through AI"]
    };
  };

  const calculateLeadScore = (state: ConversationState): number => {
    let score = 0;
    
    if (state.email && !['gmail.com', 'outlook.com', 'yahoo.com'].includes(state.email.split('@')[1])) {
      score += 20;
    }
    
    if (state.discoveredChallenges && state.discoveredChallenges.length > 0) {
      score += 15;
    }
    
    if (state.stage === 'discovery' || state.stage === 'solution_positioning') {
      score += 10;
    }
    
    if (state.preferredSolution) {
      score += 25;
    }
    
    return Math.min(score, 100);
  };

  // Enhanced permission checking
  const checkAndRequestPermissions = async (mode: 'voice' | 'video' | 'screen'): Promise<boolean> => {
    console.log(`🎤 Starting permission request for ${mode} mode...`);
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
              autoGainControl: true
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

      console.log(`✅ ${mode} permissions granted!`);
      stream.getTracks().forEach(track => track.stop());
      
      setIsRequestingPermission(false);
      return true;
      
    } catch (error: any) {
      console.error(`❌ Permission request failed for ${mode}:`, error);
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

  const handleModeChange = async (mode: 'text' | 'voice' | 'video' | 'screen') => {
    console.log(`🔄 User clicked ${mode} mode button...`);
    setPermissionError(null);

    if (mode === 'text') {
      setActiveInputMode(mode);
      if (streamingState.isConnected && !isLayoutTestMode()) {
        try {
          await stopStream();
        } catch (error) {
          console.error('Error stopping stream:', error);
        }
      }
      return;
    }

    if (isLayoutTestMode()) {
      setActiveInputMode(mode);
      return;
    }

    if (!navigator.mediaDevices) {
      setPermissionError(`**${mode.charAt(0).toUpperCase() + mode.slice(1)} mode not supported**\n\nYour browser doesn't support media devices.`);
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
    
    if (!streamingState.isConnected) {
      try {
        await startStream(mode);
      } catch (error: any) {
        setPermissionError(`Failed to start ${mode} mode: ${error.message}`);
        setActiveInputMode('text');
      }
    }
  };

  const handlePermissionModalConfirm = async () => {
    setShowPrePermissionModal(false);
    if (pendingMode) {
      await requestPermissionsForMode(pendingMode);
      setPendingMode(null);
    }
  };

  const handlePermissionModalCancel = () => {
    setShowPrePermissionModal(false);
    setPendingMode(null);
  };

  // Simplified send message handler
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
    const userInput = content;
    
    if (!messageContent) {
      setInput('');
    }
    
    if (currentMode === 'voice') {
      setPartialTranscript('');
    }
    
    setIsLoading(true);

    // If streaming is active, try to send through streaming API
    if (streamingState.isConnected && (currentMode === 'voice' || currentMode === 'video' || currentMode === 'screen')) {
      try {
        await sendStreamingMessage(userInput);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Streaming send failed:', error);
      }
    }

    // Conversation flow processing
    setTimeout(async () => {
      let aiResponse = '';
      let responseType: MessageData['type'] = 'text';
      let newState = { ...conversationState };
      let suggestions: string[] = [];
      let sources: MessageData['sources'] = [];
      let tasks: MessageData['tasks'] = [];
      let tools: MessageData['tools'] = [];

      switch (conversationState.stage) {
        case 'greeting':
          // Special AI Elements Demo Flow
          if (userInput.toLowerCase().includes('demo')) {
            newState.name = 'Demo User';
            newState.stage = 'email_request';
            aiResponse = `🚀 **AI Elements Demo Mode Activated!**\n\nGreat choice! I'll now showcase all our interactive AI components:\n\n✨ **Enhanced Response Formatting**\n📊 **Real-time Analysis Tools** \n🔗 **Source Citations & References**\n✅ **Interactive Task Management**\n💡 **Smart Suggestions**\n🎯 **Action Buttons & Controls**\n\nLet's start with some company research. What's your work email?`;
            
            suggestions = [
              'demo@techcorp.com',
              'user@startup.ai',
              'sarah@enterprise.com',
              'Show me more AI Elements!'
            ];
            
            tools = [
              {
                name: 'Demo Mode',
                description: 'Showcasing AI Elements capabilities',
                used: true
              },
              {
                name: 'Component Library',
                description: 'Interactive UI components',
                used: true
              }
            ];
            
            sources = [
              {
                title: 'AI Elements Documentation',
                url: '#demo-mode',
                excerpt: 'Interactive components for enhanced AI conversations with citations, tasks, and tools'
              }
            ];
            
            responseType = 'insight';
            break;
          }
          
          // Regular flow
          newState.name = userInput;
          newState.stage = 'email_request';
          aiResponse = `Nice to meet you, ${userInput}! To send you a personalized summary of our conversation, what's your work email?`;
          suggestions = [
            'john.smith@company.com',
            'sarah@techcorp.com',
            'I prefer not to share my email right now'
          ];
          break;

        case 'email_request':
          if (userInput.includes('@')) {
            newState.email = userInput;
            newState.stage = 'email_collected';
            aiResponse = `Perfect, ${newState.name}! I'm analyzing your company background now...`;
            
            tools = [
              {
                name: 'Company Research',
                description: 'Analyzing company domain and industry data',
                used: true
              },
              {
                name: 'Market Analysis',
                description: 'Researching industry trends and competitors',
                used: true
              }
            ];
            
            setTimeout(async () => {
              const companyInfo = await analyzeCompanyFromEmail(userInput);
              newState.companyInfo = companyInfo;
              
              const isDemo = newState.name === 'Demo User';
              
              const insightMessage: MessageData = {
                id: (Date.now() + 1).toString(),
                content: isDemo 
                  ? `🎉 **AI Elements Analysis Complete!**\n\nI see you're with ${companyInfo.name}. Here's what our AI discovered:\n\n📈 **Industry Insights:**\n${companyInfo.insights[0]}\n\n🚀 **Market Trends:** \nCompanies in ${companyInfo.industry} are increasingly adopting AI solutions\n\n⚡ **Automation Opportunities:**\n• ${companyInfo.challenges[0]}\n• Data-driven decision making\n• Competitive advantage through AI\n\nWhat's the biggest challenge you're currently facing with AI implementation?`
                  : `I see you're with ${companyInfo.name}. That's interesting - ${companyInfo.insights[0]}. Many businesses in ${companyInfo.industry} are facing challenges with ${companyInfo.challenges[0]}.\n\nWhat's the biggest challenge you're currently facing with AI implementation or business automation?`,
                role: 'assistant',
                timestamp: new Date(),
                type: 'insight',
                inputMode: currentMode,
                suggestions: isDemo ? [
                  '🔧 Workflow automation challenges',
                  '📞 Customer service efficiency',
                  '📊 Data analysis bottlenecks', 
                  '📈 Marketing ROI optimization',
                  'Show me task management features!'
                ] : [
                  'We need help with workflow automation',
                  'Customer service efficiency is our main concern',
                  'Data analysis and reporting takes too much time',
                  'We want to improve our marketing ROI'
                ],
                sources: [
                  {
                    title: `AI Trends in ${companyInfo.industry}`,
                    url: '#ai-trends',
                    excerpt: `Recent studies show 40% growth in AI adoption within the ${companyInfo.industry} sector`
                  },
                  ...(isDemo ? [
                    {
                      title: 'AI Elements Interactive Demo',
                      url: '#demo',
                      excerpt: 'Live demonstration of interactive AI conversation components'
                    }
                  ] : [])
                ],
                tools: [
                  {
                    name: 'Company Research',
                    description: 'Domain and industry analysis',
                    used: true
                  },
                  {
                    name: 'Market Intelligence',
                    description: 'Industry trends and insights',
                    used: true
                  }
                ],
                isComplete: true
              };
              
              setMessages(prev => [...prev, insightMessage]);
              setConversationState(prevState => ({ ...prevState, ...newState }));
              newState.stage = 'discovery';
            }, 2000);
            
          } else {
            aiResponse = `I'd love to help you get the most out of our conversation! Could you share your work email so I can send you a personalized summary?`;
            suggestions = [
              'Sure, it\'s user@company.com',
              'I\'d prefer to continue without sharing my email'
            ];
          }
          break;

        case 'discovery':
          newState.discoveredChallenges = [userInput];
          newState.stage = 'solution_positioning';
          newState.leadScore = calculateLeadScore(newState);
          
          const isDemo = newState.name === 'Demo User';
          
          if (isDemo && userInput.toLowerCase().includes('task')) {
            aiResponse = `🎯 **Task Management Demo Activated!**\n\nHere's how our AI Elements handle interactive task tracking:\n\n**Current Analysis Tasks:**\n✅ Company research completed\n✅ Industry insights gathered\n🔄 Challenge assessment in progress\n⏳ Solution matching pending\n\nI can see ${userInput} is a priority. Based on your ${newState.companyInfo?.industry} background, here are the solutions we recommend:\n\n🎓 **AI Training & Workshops** - Build internal capabilities\n🚀 **Done-for-You Consulting** - We handle implementation\n⚡ **Hybrid Approach** - Best of both worlds`;
            
            tasks = [
              {
                id: 'research',
                title: 'Company & industry research',
                completed: true
              },
              {
                id: 'challenges',
                title: 'Challenge identification',
                completed: true
              },
              {
                id: 'solutions',
                title: 'Solution matching',
                completed: false
              },
              {
                id: 'proposal',
                title: 'Custom proposal generation',
                completed: false
              }
            ];
            
            tools = [
              {
                name: 'Task Manager',
                description: 'Interactive task tracking system',
                used: true
              }
            ];
          } else {
            aiResponse = `That's a common challenge in ${newState.companyInfo?.industry}. Based on what you've shared, I can see how AI automation could help ${newState.companyInfo?.name} with ${userInput}.\n\nWould you be more interested in:\n- **AI Training & Workshops** for your team to implement solutions internally\n- **Done-for-You Consulting** where we implement and manage the AI systems\n- **Hybrid Approach** with both training and implementation support?`;
          }
          
          suggestions = isDemo ? [
            '🎓 Tell me about AI training programs',
            '🚀 I prefer done-for-you consulting',
            '⚡ Hybrid approach sounds perfect',
            '📅 Let\'s schedule a strategy call'
          ] : [
            'Tell me about the training programs',
            'I\'d prefer done-for-you consulting',
            'A hybrid approach sounds interesting',
            'Let\'s schedule a consultation call'
          ];
          
          responseType = 'summary';
          break;

        case 'solution_positioning':
          if (userInput.toLowerCase().includes('training')) {
            newState.preferredSolution = 'training';
          } else if (userInput.toLowerCase().includes('consulting') || userInput.toLowerCase().includes('done-for-you')) {
            newState.preferredSolution = 'consulting';
          } else {
            newState.preferredSolution = 'both';
          }
          
          newState.stage = 'booking_offer';
          newState.leadScore = calculateLeadScore(newState);
          
          aiResponse = `Perfect! Based on our conversation, I can see you're a great fit for our ${newState.preferredSolution} approach. Your lead score is ${newState.leadScore}/100.\n\n**Next Steps:**\n\n1. **Schedule a Strategy Session** - Let's discuss your specific needs and create a custom AI implementation plan\n2. **Get Your Personalized Report** - I'll generate a comprehensive AI strategy summary for ${newState.companyInfo?.name}\n\nWould you like to book a 30-minute strategy call to dive deeper into how we can help ${newState.companyInfo?.name} with ${newState.discoveredChallenges?.[0]}?`;
          
          suggestions = [
            'Yes, let\'s schedule a call',
            'Show me the calendar',
            'Send me the report first',
            'I need to discuss this with my team'
          ];
          
          responseType = 'cta';
          break;

        case 'booking_offer':
          if (userInput.toLowerCase().includes('schedule') || userInput.toLowerCase().includes('calendar') || userInput.toLowerCase().includes('call')) {
            setShowBookingOverlay(true);
            aiResponse = `Great! I'm opening the booking calendar for you. You can select your preferred date and time for our strategy session.`;
          } else {
            aiResponse = `I understand. Feel free to reach out when you're ready to move forward. In the meantime, would you like me to generate your personalized AI strategy report?`;
            suggestions = [
              'Yes, generate my report',
              'Schedule the call now',
              'I\'ll get back to you later'
            ];
          }
          responseType = 'cta';
          break;

        default:
          aiResponse = `I understand. How else can I help you explore AI opportunities for your business?`;
          suggestions = [
            'Tell me about AI automation',
            'What services do you offer?',
            'Schedule a consultation'
          ];
      }

      setConversationState(newState);

      const aiMessage: MessageData = {
        id: (Date.now() + 2).toString(),
        content: aiResponse || 'I apologize, there was an issue generating a response. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        type: responseType,
        inputMode: currentMode,
        suggestions,
        sources,
        tasks,
        tools,
        isComplete: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isDocument = file.type.includes('pdf') || 
                        file.type.includes('document') || 
                        file.type.includes('text/') ||
                        file.type.includes('application/');

      if (isImage || isDocument) {
        const fileMessage: MessageData = {
          id: Date.now().toString() + Math.random(),
          content: `📎 **File uploaded:** ${file.name}\n\n${isImage ? '🖼️ Image' : '📄 Document'} • ${(file.size / 1024).toFixed(1)}KB\n\nI'm analyzing this ${isImage ? 'image' : 'document'} for you...`,
          role: 'assistant',
          timestamp: new Date(),
          type: 'insight',
          inputMode: activeInputMode,
          tools: [
            {
              name: isImage ? 'Image Analysis' : 'Document Analysis',
              description: `Processing ${file.type}`,
              used: true
            }
          ]
        };

        setMessages(prev => [...prev, fileMessage]);
      }
    }

    event.target.value = '';
  };

  // Booking completion handler
  const handleBookingComplete = (booking: BookingData) => {
    setCompletedBooking(booking);
    setShowBookingOverlay(false);
    
    const confirmationMessage: MessageData = {
      id: Date.now().toString(),
      content: `🎉 **Booking Confirmed!**\n\n**${booking.name}**, your AI Strategy Session is scheduled for:\n\n📅 **${booking.selectedDate?.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}**\n🕒 **${booking.selectedTime} (${booking.timezone})**\n\nYou'll receive:\n✅ Calendar invite with meeting details\n✅ Personalized AI strategy summary\n✅ Pre-session preparation guide\n\nI'm excited to help you transform your business with AI! 🚀`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'cta',
      inputMode: activeInputMode,
      tasks: [
        {
          id: 'calendar-invite',
          title: 'Send calendar invite',
          completed: true
        },
        {
          id: 'summary-pdf',
          title: 'Generate strategy summary',
          completed: true
        },
        {
          id: 'prep-guide',
          title: 'Send preparation guide',
          completed: true
        }
      ],
      isComplete: true
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
  };

  // Suggestion click handler
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.toLowerCase().includes('calendar') || suggestion.toLowerCase().includes('booking')) {
      setShowBookingOverlay(true);
      return;
    }
    
    setInput(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Message action handler
  const handleMessageAction = async (action: string, messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    switch (action) {
      case 'copy':
        await navigator.clipboard.writeText(message.content || '');
        console.log('Message copied to clipboard');
        break;
      case 'regenerate':
        console.log('Regenerating message:', messageId);
        break;
      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'AI Assistant Message',
              text: message.content || '',
            });
          } catch (err) {
            console.log('Error sharing:', err);
          }
        }
        break;
    }
  };

  // Lead data for booking
  const leadDataForBooking = {
    name: conversationState.name || '',
    email: conversationState.email || '',
    company: conversationState.companyInfo?.name || '',
    challenges: conversationState.discoveredChallenges || [],
    preferredSolution: conversationState.preferredSolution || 'consulting'
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Clean, Full-Screen Chat Interface - No Floating Components */}
      <main className="flex-1 h-full">
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
          onPermissionModalConfirm={handlePermissionModalConfirm}
          onPermissionModalCancel={handlePermissionModalCancel}
          onSendMessage={handleSendMessage}
          onSuggestionClick={handleSuggestionClick}
          onMessageAction={handleMessageAction}
          onModeChange={handleModeChange}
          onFileUpload={handleFileUpload}
          onDismissError={() => setPermissionError(null)}
        />
      </main>

      {/* Calendar Booking Modal - Only Modal We Need */}
      <CalendarBookingOverlay
        isOpen={showBookingOverlay}
        onClose={() => setShowBookingOverlay(false)}
        onBookingComplete={handleBookingComplete}
        leadData={leadDataForBooking}
      />
    </div>
  );
}