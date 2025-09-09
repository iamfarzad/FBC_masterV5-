import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { User, Zap, Play, Square, Copy, RefreshCw, Share } from 'lucide-react';

// Import AI Elements
import { Response } from '../ai-elements/response';
import { Source } from '../ai-elements/source';
import { Task } from '../ai-elements/task';
import { Tool } from '../ai-elements/tool';
import { Actions } from '../ai-elements/actions';

// Import business components
import { PDFGenerator } from '../PDFGenerator';

interface MessageData {
  id: string;
  content?: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  type?: 'text' | 'insight' | 'summary' | 'cta';
  isPlaying?: boolean;
  suggestions?: string[];
  sources?: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  tools?: Array<{
    name: string;
    description: string;
    used: boolean;
  }>;
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

interface BookingData {
  name: string;
  email: string;
  company: string;
  message: string;
  selectedDate: Date | null;
  selectedTime: string;
  timezone: string;
}

interface EnhancedMessageProps {
  message: MessageData;
  onSuggestionClick: (suggestion: string) => void;
  onMessageAction: (action: string, messageId: string) => void;
  onPlayMessage: (messageId: string) => void;
  onStopMessage: () => void;
  isPlaying?: boolean;
  conversationState: ConversationState;
  completedBooking?: BookingData | null;
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const EnhancedMessage: React.FC<EnhancedMessageProps> = ({ 
  message, 
  onSuggestionClick, 
  onMessageAction, 
  onPlayMessage, 
  onStopMessage, 
  isPlaying, 
  conversationState, 
  completedBooking 
}) => {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-2xl gap-4">
          <div className="flex flex-1 flex-col items-end">
            <div className="mb-2 text-right text-sm text-muted-foreground">
              You
            </div>
            <div className="modern-button max-w-full rounded-2xl rounded-tr-md bg-gradient-to-r from-primary to-primary px-6 py-4 text-primary-foreground holo-glow">
              <p className="text-sm leading-relaxed">{message.content || ''}</p>
            </div>
          </div>
          <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
            <User className="size-5 text-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-3xl gap-4">
        <div className="modern-hover mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
          <Zap className="size-5 text-foreground" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-2 text-sm text-muted-foreground">
            F.B/c AI Assistant
            {message.type === 'insight' && <Badge variant="secondary" className="ml-2 text-xs holo-border bg-transparent">Analysis</Badge>}
            {message.type === 'cta' && <Badge variant="secondary" className="ml-2 text-xs holo-border bg-transparent">Action Required</Badge>}
          </div>
          
          <div className={`rounded-2xl rounded-tl-md px-6 py-4 ${
            message.type === 'insight'
              ? 'holo-card geometric-accent'
              : message.type === 'cta'
              ? 'holo-card scan-line'
              : 'holo-card'
          }`}>
            <Response 
              content={message.content || ''} 
              className="text-sm leading-relaxed whitespace-pre-wrap text-current"
            />

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">Sources</div>
                {message.sources.map((source, index) => (
                  <Source
                    key={index}
                    title={source.title}
                    url={source.url}
                    excerpt={source.excerpt}
                    className="holo-border rounded-lg p-3 hover:holo-glow transition-all duration-200"
                  />
                ))}
              </div>
            )}

            {/* Tasks */}
            {message.tasks && message.tasks.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">Tasks</div>
                {message.tasks.map((task) => (
                  <Task
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    completed={task.completed}
                    className="holo-border rounded-lg p-3"
                    onToggle={(taskId) => console.log('Task toggled:', taskId)}
                  />
                ))}
              </div>
            )}

            {/* Tools Used */}
            {message.tools && message.tools.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-widest">Tools Used</div>
                <div className="flex flex-wrap gap-2">
                  {message.tools.map((tool, index) => (
                    <Tool
                      key={index}
                      name={tool.name}
                      description={tool.description}
                      used={tool.used}
                      className="holo-border rounded-full px-3 py-1 text-xs"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Message Actions and Controls */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs holo-border bg-transparent">
                  {formatTime(message.timestamp)}
                </Badge>
                
                {/* PDF Generator for CTA messages */}
                {message.type === 'cta' && conversationState.email && (
                  <div className="ml-2">
                    <PDFGenerator
                      leadData={{
                        name: conversationState.name,
                        email: conversationState.email,
                        company: conversationState.companyInfo,
                        discoveredChallenges: conversationState.discoveredChallenges,
                        preferredSolution: conversationState.preferredSolution,
                        leadScore: conversationState.leadScore
                      }}
                      bookingData={completedBooking}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {/* Voice Control */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isPlaying ? onStopMessage : () => onPlayMessage(message.id)}
                  className="h-6 w-6 p-0 rounded-full holo-border hover:holo-glow transition-all duration-200"
                >
                  {isPlaying ? (
                    <Square className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>

                {/* Message Actions */}
                <Actions
                  actions={[
                    {
                      label: 'Copy',
                      icon: Copy,
                      action: () => onMessageAction('copy', message.id)
                    },
                    {
                      label: 'Regenerate',
                      icon: RefreshCw,
                      action: () => onMessageAction('regenerate', message.id)
                    },
                    {
                      label: 'Share',
                      icon: Share,
                      action: () => onMessageAction('share', message.id)
                    }
                  ]}
                  className="flex gap-1"
                  buttonClassName="h-6 w-6 p-0 rounded-full holo-border hover:holo-glow transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="holo-border rounded-full px-3 py-1.5 text-sm hover:holo-glow transition-all duration-200 cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};