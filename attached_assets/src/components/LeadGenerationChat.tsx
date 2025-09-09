import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { SpeechToSpeechPopover } from './SpeechToSpeechPopover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { 
  Send, 
  Brain,
  User,
  Calendar,
  Mail,
  Building,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Video,
  Monitor,
  Sparkles,
  Search,
  Image,
  Layout,
  ChevronDown,
  Camera,
  Plus,
  Menu,
  X,
  MessageCircle,
  FileText,
  Paperclip,
  GraduationCap,
  BookOpen,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'insight' | 'summary' | 'cta';
  isPlaying?: boolean;
}

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

interface VoiceState {
  isSpeaking: boolean;
  audioEnabled: boolean;
  currentlyPlaying?: string;
}

interface LeadGenerationChatProps {
  brandName?: string;
  assistantName?: string;
}

// Clean Voice Visualizer Component for TTS only
const CleanVoiceVisualizer: React.FC<{ 
  isActive: boolean; 
  type: 'speaking';
}> = ({ isActive, type }) => {
  if (!isActive) return null;
  
  const color = 'rgba(255, 255, 255, 0.7)';
  const barCount = 2;
  
  return (
    <div className="flex items-center gap-0.5 ml-1">
      {[...Array(barCount)].map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-150"
          style={{
            width: '1.5px',
            height: `${2 + Math.sin(Date.now() / 300 + i) * 2}px`,
            backgroundColor: color,
            opacity: 0.8 + Math.sin(Date.now() / 250 + i) * 0.2
          }}
        />
      ))}
    </div>
  );
};

// AI Response Processor - Convert content to React elements
function renderAIResponse(content: string) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-current">
        {content}
      </div>
    </div>
  );
}

export const LeadGenerationChat: React.FC<LeadGenerationChatProps> = ({
  brandName = "F.B/c AI Consulting",
  assistantName = "AI Strategy Assistant"
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi! I\'m here to help you discover how AI can transform your business. What\'s your name?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'greeting'
  });

  const [voiceState, setVoiceState] = useState<VoiceState>({
    isSpeaking: false,
    audioEnabled: true
  });

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [feature, setFeature] = useState<'chat' | 'webcam' | 'screen' | 'document' | 'video' | 'workshop'>('chat');
  const [showCanvasOverlay, setShowCanvasOverlay] = useState(false);
  const [theme, setTheme] = useState('dark');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Tool Items
  const toolItems = [
    {
      id: 'webcam' as const,
      icon: Camera,
      label: 'Webcam Capture',
      shortcut: 'W',
      description: 'Record videos and capture high-quality photos',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'screen' as const,
      icon: Monitor,
      label: 'Screen Share',
      shortcut: 'S',
      description: 'Share your screen with AI-powered analysis',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'document' as const,
      icon: FileText,
      label: 'Document Analysis',
      shortcut: 'D',
      description: 'Upload and analyze documents',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'video' as const,
      icon: BookOpen,
      label: 'Video to App',
      shortcut: 'V',
      description: 'Convert videos to applications',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'workshop' as const,
      icon: GraduationCap,
      label: 'Workshop',
      shortcut: 'L',
      description: 'Educational resources and learning paths',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Text-to-Speech functionality
  const speakMessage = (text: string, messageId: string) => {
    if (!synthRef.current || !voiceState.audioEnabled) return;

    if (currentUtteranceRef.current) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Neural') || 
      voice.name.includes('Premium') ||
      voice.name.includes('Enhanced') ||
      (voice.lang === 'en-US' && voice.name.includes('Female'))
    ) || voices.find(voice => voice.lang === 'en-US') || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setVoiceState(prev => ({ ...prev, isSpeaking: true, currentlyPlaying: messageId }));
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isPlaying: true } : { ...msg, isPlaying: false }
      ));
    };

    utterance.onend = () => {
      setVoiceState(prev => ({ ...prev, isSpeaking: false, currentlyPlaying: undefined }));
      setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
    };

    utterance.onerror = () => {
      setVoiceState(prev => ({ ...prev, isSpeaking: false, currentlyPlaying: undefined }));
      setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setVoiceState(prev => ({ ...prev, isSpeaking: false, currentlyPlaying: undefined }));
      setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
    }
  };

  const toggleAudio = () => {
    setVoiceState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
    if (voiceState.isSpeaking) {
      stopSpeaking();
    }
  };

  // Handle speech input from SpeechToSpeechPopover
  const handleSpeechInput = (text: string) => {
    setNewMessage(text);
    // Auto-submit the message
    setTimeout(() => {
      if (text.trim()) {
        handleSendMessage();
      }
    }, 500);
  };

  // Handle audio toggle from SpeechToSpeechPopover
  const handlePopoverAudioToggle = (enabled: boolean) => {
    setVoiceState(prev => ({ ...prev, audioEnabled: enabled }));
  };

  // Tool Selection Handler
  const handleToolSelect = (toolId: typeof feature) => {
    setFeature(toolId);
    console.log('Tool selected:', toolId);
  };

  // Tool Action Handler
  const handleToolAction = useCallback((tool: string) => {
    console.log('Tool action:', tool);
    switch(tool) {
      case 'webcam':
        console.log('Opening webcam capture...');
        break;
      case 'screen':
        console.log('Opening screen share...');
        break;
      case 'document':
        console.log('Opening document analysis...');
        break;
      case 'video':
        console.log('Opening video-to-app...');
        break;
      case 'workshop':
        console.log('Opening workshop...');
        break;
      default:
        console.log('Unknown tool action:', tool);
    }
  }, []);

  // Simulate company analysis from email domain
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = newMessage;
    setNewMessage('');
    setIsTyping(true);

    setTimeout(async () => {
      let aiResponse = '';
      let responseType: Message['type'] = 'text';
      let newState = { ...conversationState };

      switch (conversationState.stage) {
        case 'greeting':
          newState.name = userInput;
          newState.stage = 'email_request';
          aiResponse = `Nice to meet you, ${userInput}! To send you a personalized summary of our conversation, what's your work email?`;
          break;

        case 'email_request':
          if (userInput.includes('@')) {
            newState.email = userInput;
            newState.stage = 'email_collected';
            aiResponse = `Perfect, ${newState.name}! I'm analyzing your company background now...`;
            
            setTimeout(async () => {
              const companyInfo = await analyzeCompanyFromEmail(userInput);
              newState.companyInfo = companyInfo;
              
              const insightMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `I see you're with ${companyInfo.name}. That's interesting - ${companyInfo.insights[0]}. Many businesses in ${companyInfo.industry} are facing challenges with ${companyInfo.challenges[0]}.\n\nWhat's the biggest challenge you're currently facing with AI implementation or business automation?`,
                sender: 'ai',
                timestamp: new Date(),
                type: 'insight'
              };
              
              setMessages(prev => [...prev, insightMessage]);
              setConversationState({ ...newState, stage: 'discovery' });
              
              if (voiceState.audioEnabled) {
                setTimeout(() => {
                  speakMessage(insightMessage.content, insightMessage.id);
                }, 500);
              }
            }, 2000);
          } else {
            aiResponse = `I need your work email to send you the personalized summary. Could you please provide your business email address?`;
          }
          break;

        case 'discovery':
          newState.discoveredChallenges = [userInput];
          newState.stage = 'solution_positioning';
          aiResponse = `Based on what you've shared, ${newState.name}, I see two ways we could help:\n\n**1. AI Training for Your Team** 🎓\nGet your employees up to speed with hands-on AI training programs\n\n**2. Done-for-You AI Consulting** 🚀\nWe implement AI solutions directly for your business\n\nWhich approach feels more aligned with where ${newState.companyInfo?.name || 'your company'} is right now?`;
          responseType = 'text';
          break;

        case 'solution_positioning':
          if (userInput.toLowerCase().includes('training') || userInput.toLowerCase().includes('team')) {
            newState.preferredSolution = 'training';
          } else if (userInput.toLowerCase().includes('consulting') || userInput.toLowerCase().includes('implement')) {
            newState.preferredSolution = 'consulting';
          } else {
            newState.preferredSolution = 'both';
          }
          newState.stage = 'summary_offer';
          newState.leadScore = calculateLeadScore(newState);
          
          aiResponse = `Excellent choice! I can see why ${newState.preferredSolution === 'training' ? 'AI training' : newState.preferredSolution === 'consulting' ? 'consulting services' : 'a combined approach'} would work well for ${newState.companyInfo?.name || 'your business'}.\n\nLet me create a personalized summary of our conversation, ${newState.name}. Would you like me to email this to ${newState.email} or would you prefer to download it now?`;
          break;

        case 'summary_offer':
          newState.stage = 'booking_offer';
          aiResponse = `Perfect! I'm preparing your personalized AI strategy summary now. This will include:\n\n✅ Your business context and challenges\n✅ Recommended AI solutions for ${newState.companyInfo?.name || 'your company'}\n✅ Implementation roadmap\n✅ Next steps and resources\n\nI'd love to dive deeper with a free 15-minute AI Strategy Session. This is where we can discuss specific solutions for your ${newState.companyInfo?.industry || 'business'} challenges. Would you like to grab a spot on my calendar?`;
          responseType = 'cta';
          break;

        case 'booking_offer':
          aiResponse = `Fantastic! I'll send you the calendar link right after our chat. In the meantime, your personalized summary is being sent to ${newState.email}.\n\nThank you for this great conversation, ${newState.name}! I'm excited to help ${newState.companyInfo?.name || 'your business'} leverage AI for better results. 🚀`;
          
          setTimeout(() => {
            const summaryMessage: Message = {
              id: (Date.now() + 2).toString(),
              content: `📧 **Summary sent to ${newState.email}!**\n\n📅 **Ready to book your strategy session?**\n[Book Your Free 15-Minute AI Strategy Call](https://calendly.com/ai-strategy-session)\n\nCheck your inbox (and spam folder) for your personalized summary!`,
              sender: 'ai',
              timestamp: new Date(),
              type: 'cta'
            };
            setMessages(prev => [...prev, summaryMessage]);
            
            if (voiceState.audioEnabled) {
              setTimeout(() => {
                speakMessage("Summary sent to your email! Ready to book your strategy session? Check your inbox for your personalized summary!", summaryMessage.id);
              }, 500);
            }
          }, 3000);
          break;

        default:
          aiResponse = `I appreciate your interest! Let's continue our conversation about how AI can transform your business.`;
      }

      if (aiResponse) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          type: responseType
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (voiceState.audioEnabled && !voiceState.isSpeaking) {
          setTimeout(() => {
            speakMessage(aiResponse, aiMessage.id);
          }, 500);
        }
      }

      setConversationState(newState);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Holographic Sidebar */}
        <div className="relative flex w-16 flex-col holo-border bg-background/95 backdrop-blur-sm py-4">
          {/* Logo */}
          <div className="mb-6 px-3">
            <div className="relative">
              <div className="modern-hover flex size-10 items-center justify-center rounded-xl holo-card holo-glow">
                <Brain className="w-5 h-5 text-foreground" />
              </div>
              <div className="absolute inset-0 -z-10 animate-pulse rounded-xl bg-foreground/5 blur-md"></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={feature === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  className={`modern-button relative size-12 rounded-xl p-0 transition-all duration-300 ${
                    feature === 'chat'
                      ? 'holo-glow bg-primary text-primary-foreground'
                      : 'holo-border hover:holo-glow text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setFeature('chat')}
                >
                  <MessageCircle className="size-5" />
                  {feature === 'chat' && (
                    <div className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-lg"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Chat</span>
                  <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">C</kbd>
                </div>
              </TooltipContent>
            </Tooltip>

            {toolItems.map((tool) => {
              const Icon = tool.icon;
              const isActive = feature === tool.id;
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={`modern-button relative size-12 rounded-xl p-0 transition-all duration-300 ${
                        isActive
                          ? 'holo-glow bg-primary text-primary-foreground'
                          : 'holo-border hover:holo-glow text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <Icon className="size-5" />
                      {isActive && (
                        <div className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-lg"></div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex items-center gap-2">
                      <span>{tool.label}</span>
                      <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {tool.shortcut}
                      </kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* System Controls */}
          <div className="space-y-1 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="modern-button size-12 rounded-xl p-0 holo-border hover:holo-glow text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCanvasOverlay(!showCanvasOverlay)}
                >
                  <Layers className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Canvas Overlay</span>
                  <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">Ctrl+O</kbd>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="modern-button size-12 rounded-xl p-0 holo-border hover:holo-glow text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Toggle Theme</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1">
          <div className="flex-1 bg-background">
            {/* Enhanced Header for Tools */}
            {feature !== 'chat' && (
              <header className="flex h-16 items-center justify-between holo-border geometric-accent bg-background/95 backdrop-blur-sm px-8">
                <div className="flex items-center gap-4">
                  <div className="flex size-8 items-center justify-center rounded-xl holo-card holo-glow">
                    {React.createElement(toolItems.find(t => t.id === feature)?.icon || MessageCircle, {
                      className: "h-4 w-4 text-foreground"
                    })}
                  </div>
                  <h1 className="text-xl text-foreground tracking-wide">
                    {toolItems.find(t => t.id === feature)?.label || feature}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="animate-pulse holo-border bg-transparent text-xs text-foreground"
                  >
                    ● ACTIVE
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="modern-button holo-border text-foreground hover:holo-glow hover:text-foreground"
                  onClick={() => setFeature('chat')}
                >
                  Back to Chat
                </Button>
              </header>
            )}

            {/* Main Panel - Chat Content Area */}
            <main className={`overflow-hidden bg-background ${
              feature === 'chat' ? "h-full" : "h-[calc(100vh-4rem)]"
            }`}>
              {/* Chat Interface Content */}
              <div className="flex h-full">
                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col bg-background">
                  {/* Messages Area */}
                  <div className="scrollbar-modern flex-1 overflow-y-auto px-6 py-8">
                    <div className="mx-auto max-w-4xl space-y-8">
                      {messages.length === 0 && !isTyping ? (
                        <div className="animate-smooth-fade-in space-y-8 py-16 text-center">
                          <div className="space-y-4">
                            <div className="relative">
                              <div className="mx-auto mb-6 flex size-16 animate-pulse items-center justify-center rounded-2xl holo-card holo-glow">
                                <Sparkles className="size-8 text-foreground" />
                              </div>
                              <div className="absolute -inset-2 animate-pulse rounded-3xl bg-foreground/5 opacity-50 blur-xl"></div>
                            </div>
                            <h1 className="text-gradient mb-2 text-3xl leading-tight tracking-wide">What can we build together?</h1>
                            <p className="mx-auto max-w-md text-lg text-muted-foreground">
                              Share your business goals and let's explore AI solutions that can transform your operations
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {messages.map((message, index) => (
                            <div
                              key={message.id}
                              className="animate-smooth-fade-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              {message.sender === 'user' ? (
                                // User message
                                <div className="flex justify-end">
                                  <div className="flex max-w-2xl gap-4">
                                    <div className="flex flex-1 flex-col items-end">
                                      <div className="mb-2 text-right text-sm text-muted-foreground tracking-widest uppercase">
                                        User
                                      </div>
                                      <div className="modern-button max-w-full rounded-2xl rounded-tr-md px-6 py-4 bg-primary text-primary-foreground holo-glow">
                                        <p className="text-sm leading-relaxed">
                                          {message.content}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
                                      <User className="size-5 text-foreground" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // AI message
                                <div className="flex justify-start">
                                  <div className="flex max-w-3xl gap-4">
                                    <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
                                      <Brain className="size-5 text-foreground" />
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                      <div className="mb-2 text-sm text-muted-foreground tracking-widest uppercase">
                                        {assistantName} {message.type === 'insight' && <Badge variant="secondary" className="ml-2 text-xs holo-border bg-transparent">Analysis</Badge>}
                                        {message.type === 'cta' && <Badge variant="secondary" className="ml-2 text-xs holo-border bg-transparent">Action Required</Badge>}
                                      </div>
                                      <div className={`rounded-2xl rounded-tl-md px-6 py-4 ${
                                        message.type === 'insight'
                                          ? 'holo-card geometric-accent'
                                          : message.type === 'cta'
                                          ? 'holo-card scan-line'
                                          : 'holo-card'
                                      }`}>
                                        {message.content && message.content.trim() ? (
                                          renderAIResponse(message.content)
                                        ) : (
                                          <div className="prose prose-sm max-w-none">
                                            <div className="flex items-center gap-2">
                                              <div className="size-2 animate-pulse rounded-full bg-foreground/40"></div>
                                              <div className="size-2 animate-pulse rounded-full bg-foreground/40" style={{ animationDelay: '0.2s' }}></div>
                                              <div className="size-2 animate-pulse rounded-full bg-foreground/40" style={{ animationDelay: '0.4s' }}></div>
                                              <span className="ml-2 text-sm text-muted-foreground tracking-wide">Processing...</span>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Voice Controls for AI messages */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/10">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs holo-border bg-transparent">
                                              {formatTime(message.timestamp)}
                                            </Badge>
                                          </div>
                                          
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={
                                              message.isPlaying 
                                                ? stopSpeaking 
                                                : () => speakMessage(message.content, message.id)
                                            }
                                            className="h-6 w-6 p-0 rounded-full holo-border hover:holo-glow transition-all duration-200"
                                            disabled={voiceState.isSpeaking && voiceState.currentlyPlaying !== message.id}
                                          >
                                            {message.isPlaying ? (
                                              <Square className="w-3 h-3" />
                                            ) : (
                                              <Play className="w-3 h-3" />
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {isTyping && (
                            <div className="animate-smooth-fade-in">
                              <div className="flex justify-start">
                                <div className="flex max-w-3xl gap-4">
                                  <div className="mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
                                    <Brain className="size-5 text-foreground" />
                                  </div>
                                  <div className="flex flex-1 flex-col">
                                    <div className="mb-2 text-sm text-muted-foreground tracking-widest uppercase">
                                      {assistantName}
                                    </div>
                                    <div className="holo-card rounded-2xl rounded-tl-md px-6 py-4 scan-line">
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Holographic Input Area */}
                  <div className="holo-border geometric-accent bg-background/95 backdrop-blur-sm p-6">
                    <div className="mx-auto max-w-4xl">
                      <div className="modern-input-focus relative overflow-hidden rounded-3xl holo-card transition-all duration-200 hover:holo-glow">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder={
                            conversationState.stage === 'greeting' ? "What's your name?" :
                            conversationState.stage === 'email_request' ? 'Enter your work email...' :
                            'Ask anything...'
                          }
                          className="resize-none rounded-3xl border-none bg-transparent py-6 pl-16 pr-20 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                          disabled={isTyping}
                        />

                        <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
                          {/* Multimodal Input Trigger */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="modern-button size-10 rounded-full p-0 text-muted-foreground hover:text-foreground hover:holo-glow"
                              >
                                <Plus className="size-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-56 holo-card">
                              <div className="p-2">
                                <div className="mb-2 text-xs tracking-widest uppercase text-muted-foreground">Add to conversation</div>
                                
                                <DropdownMenuItem
                                  onClick={() => handleToolAction('webcam')}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:holo-glow"
                                >
                                  <div className="flex size-8 items-center justify-center rounded-lg holo-card">
                                    <Camera className="size-4 text-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Webcam</div>
                                    <div className="text-xs text-muted-foreground">Capture video and photos</div>
                                  </div>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem
                                  onClick={() => handleToolAction('screen')}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:holo-glow"
                                >
                                  <div className="flex size-8 items-center justify-center rounded-lg holo-card">
                                    <Monitor className="size-4 text-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Screen Share</div>
                                    <div className="text-xs text-muted-foreground">Share screen for analysis</div>
                                  </div>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem
                                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:holo-glow"
                                >
                                  <div className="flex size-8 items-center justify-center rounded-lg holo-card">
                                    <Paperclip className="size-4 text-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Upload File</div>
                                    <div className="text-xs text-muted-foreground">Documents, images, videos</div>
                                  </div>
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator className="bg-foreground/10" />
                                
                                <DropdownMenuItem
                                  onClick={() => handleToolAction('video')}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:holo-glow"
                                >
                                  <div className="flex size-8 items-center justify-center rounded-lg holo-card">
                                    <FileText className="size-4 text-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Video to App</div>
                                    <div className="text-xs text-muted-foreground">Convert videos to apps</div>
                                  </div>
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem
                                  onClick={() => handleToolAction('workshop')}
                                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:holo-glow"
                                >
                                  <div className="flex size-8 items-center justify-center rounded-lg holo-card">
                                    <GraduationCap className="size-4 text-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">Workshop</div>
                                    <div className="text-xs text-muted-foreground">Learning modules and courses</div>
                                  </div>
                                </DropdownMenuItem>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
                          {/* Voice Interface */}
                          <SpeechToSpeechPopover
                            onSpeechInput={handleSpeechInput}
                            onAudioToggle={handlePopoverAudioToggle}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="modern-button size-10 rounded-full p-0 text-muted-foreground hover:text-foreground hover:holo-glow"
                                disabled={isTyping}
                              >
                                <Mic className="size-5" />
                              </Button>
                            }
                          />
                          
                          {/* Send Button */}
                          {newMessage.trim() && (
                            <Button
                              onClick={handleSendMessage}
                              size="sm"
                              className="modern-button size-10 rounded-full p-0 bg-primary text-primary-foreground holo-glow transition-all duration-200 disabled:opacity-40 disabled:holo-glow-none hover:holo-glow-lg"
                              disabled={isTyping}
                            >
                              <Send className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Status Indicators */}
                      {conversationState.name && (
                        <div className="mt-4 text-center">
                          <div className="text-xs text-muted-foreground geometric-accent">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-1 h-1 bg-foreground rounded-full holo-glow animate-pulse"></div>
                              <span className="block sm:inline tracking-wider uppercase">Session: {conversationState.name}</span>
                              <span className="block sm:inline sm:ml-2">• Progress: {Math.round((Object.keys(conversationState).filter(key => conversationState[key as keyof ConversationState]).length / 7) * 100)}%</span>
                              {conversationState.leadScore && <span className="block sm:inline sm:ml-2">• Score: {conversationState.leadScore}</span>}
                              <div className="w-1 h-1 bg-foreground rounded-full holo-glow animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center mt-4">
                        <div className="text-xs text-muted-foreground tracking-widest uppercase">
                          {brandName} can make mistakes. Please verify important information.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};