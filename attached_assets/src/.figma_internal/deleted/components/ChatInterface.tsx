import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { 
  Send, 
  Mic, 
  MicOff,
  Upload, 
  Video,
  Monitor,
  User,
  Brain,
  Circle,
  FileText,
  Camera
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'file' | 'analysis';
}

interface ChatInterfaceProps {
  activeConversationTitle?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeConversationTitle = 'Business Strategy'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you with business analysis, document processing, voice interactions, and more. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 600000)
    },
    {
      id: '2',
      content: 'I need help analyzing our Q3 business performance and identifying areas for improvement.',
      sender: 'user',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '3',
      content: 'I\'d be happy to help analyze your Q3 performance. To provide the most accurate insights, I\'ll need some data. You can share documents, spreadsheets, or provide specific metrics. What key areas would you like to focus on - revenue, costs, customer acquisition, or operational efficiency?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 100000)
    },
    {
      id: '4',
      content: 'Let me share some additional context. Our revenue for Q3 was $2.4M, which represents a 15% increase from Q2. However, our customer acquisition costs have risen by 28%, and we\'re seeing a slight decline in customer retention rates.',
      sender: 'user',
      timestamp: new Date(Date.now() - 50000)
    },
    {
      id: '5',
      content: 'Thank you for the detailed information. Based on your Q3 data, I can see some concerning trends that need immediate attention:\n\n**Customer Acquisition Cost (CAC) vs Revenue Growth**: While revenue grew 15%, CAC increased 28% - this suggests acquisition efficiency is declining.\n\n**Retention Issues**: Declining retention rates could compound the CAC problem.\n\n**Key Recommendations**:\n• Audit your marketing channels to identify which are driving the CAC increase\n• Implement retention programs to reduce churn\n• Focus on customer lifetime value optimization\n\nWould you like me to dive deeper into any of these areas?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 25000)
    },
    {
      id: '6',
      content: 'This is very helpful! Yes, I\'d like to focus on the customer retention aspect. Can you help me understand what specific metrics I should be tracking and what strategies typically work best for SaaS businesses?',
      sender: 'user',
      timestamp: new Date(Date.now() - 10000)
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeFeatures, setActiveFeatures] = useState({
    video: false,
    screen: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        'For SaaS customer retention, focus on these key metrics:\n\n**Core Retention Metrics**:\n• Monthly/Annual Churn Rate\n• Customer Lifetime Value (CLV)\n• Net Revenue Retention (NRR)\n• Product Adoption Score\n• Customer Health Score\n\n**Proven Retention Strategies**:\n• **Onboarding Optimization** - Reduce time-to-value\n• **Proactive Support** - Identify at-risk customers early\n• **Feature Adoption Programs** - Drive deeper product engagement\n• **Success Milestones** - Celebrate customer wins\n• **Feedback Loops** - Regular check-ins and surveys\n\nWould you like me to help you set up a retention tracking dashboard?',
        'Thank you for sharing those details. Let me analyze this information and provide you with actionable insights based on your specific situation.',
        'I can help you create a comprehensive retention strategy. Based on industry benchmarks, SaaS companies with strong retention programs see 5-25% improvement in customer lifetime value.',
        'Great question! Let me break down the most effective approaches for improving customer retention in your specific context.'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleFeature = (feature: 'video' | 'screen') => {
    setActiveFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Minimalist Header */}
      <div className="border-b border-border/60 bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-foreground/90 text-sm tracking-wide">{activeConversationTitle}</span>
              {(activeFeatures.video || activeFeatures.screen || isRecording) && (
                <div className="flex items-center gap-1 ml-2">
                  {activeFeatures.video && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full opacity-80"></div>
                  )}
                  {activeFeatures.screen && (
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-80"></div>
                  )}
                  {isRecording && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground tracking-wider uppercase">
              AI Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - Using proper flex layout for scrolling */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 group ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Brain className="w-4 h-4 text-primary/70" />
                  </div>
                )}

                <div className={`max-w-[75%] ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block rounded-2xl px-5 py-4 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 border border-border/40'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                  <div className={`text-xs text-muted-foreground/60 mt-2 px-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-primary/70" />
                </div>
                <div className="bg-muted/50 border border-border/40 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Minimalist Input Area */}
      <div className="border-t border-border/60 bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto p-6">
          {/* Feature Controls - Subtle Design */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                className={`h-8 px-3 text-xs rounded-full transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/15' 
                    : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {isRecording ? <MicOff className="w-3 h-3 mr-1.5" /> : <Mic className="w-3 h-3 mr-1.5" />}
                Voice
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFeature('video')}
                className={`h-8 px-3 text-xs rounded-full transition-all duration-200 ${
                  activeFeatures.video
                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/15'
                    : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Video className="w-3 h-3 mr-1.5" />
                Video
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFeature('screen')}
                className={`h-8 px-3 text-xs rounded-full transition-all duration-200 ${
                  activeFeatures.screen
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15'
                    : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Monitor className="w-3 h-3 mr-1.5" />
                Screen
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 text-xs rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <Upload className="w-3 h-3 mr-1.5" />
              Attach
            </Button>
          </div>

          {/* Message Input */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[52px] max-h-32 resize-none rounded-2xl border-border/60 bg-muted/20 backdrop-blur-sm focus:bg-background/80 transition-all duration-200 px-4 py-4 text-sm leading-relaxed"
                disabled={isTyping}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        </div>
      </div>
    </div>
  );
};