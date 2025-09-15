import React from 'react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { 
  User, 
  Zap, 
  Copy, 
  RefreshCw, 
  Share, 
  Play, 
  Square,
  Volume2
} from 'lucide-react';

// Import AI Elements
import { Response } from '../ai-elements/response';
import { Suggestion } from '../ai-elements/suggestion';
import { Source } from '../ai-elements/source';
import { Task } from '../ai-elements/task';
import { Tool } from '../ai-elements/tool';
import { Actions } from '../ai-elements/actions';
import { Loader } from '../ai-elements/loader';
import { PDFGenerator } from './PDFGenerator';
import { ROIInlineCard } from '../ai-elements/roi-inline-card';

export interface MessageData {
  id: string;
  content?: string;
  sender: 'user' | 'ai';
  role?: 'user' | 'assistant' | 'system'; // Backward compatibility
  timestamp: Date;
  type?: 'text' | 'insight' | 'summary' | 'cta' | 'audio' | 'video' | 'screen';
  isPlaying?: boolean;
  isComplete?: boolean;
  inputMode?: 'text' | 'voice' | 'video' | 'screen';
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
  stage: string;
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

interface UnifiedMessageProps {
  message: MessageData;
  onSuggestionClick: (suggestion: string) => void;
  onMessageAction: (action: string, messageId: string) => void;
  onPlayMessage: (messageId: string) => void;
  onStopMessage: () => void;
  isPlaying?: boolean;
  conversationState: ConversationState;
  completedBooking?: BookingData | null;
}

export const UnifiedMessage: React.FC<UnifiedMessageProps> = ({
  message,
  onSuggestionClick,
  onMessageAction,
  onPlayMessage,
  onStopMessage,
  isPlaying,
  conversationState,
  completedBooking
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInputModeIcon = () => {
    switch (message.inputMode) {
      case 'voice': return '🎤';
      case 'video': return '📹';
      case 'screen': return '🖥️';
      default: return null;
    }
  };

  // Check if this is a user message (support both sender and role properties)
  const isUserMessage = message.sender === 'user' || message.role === 'user';
  
  // Keyword-based tool suggestion detection on AI text
  const lower = (message.content || '').toLowerCase()
  const suggestROI = /\broi\b|return on investment|payback/.test(lower)
  const suggestVoice = /\b(voice|talk|speak|audio chat)\b/.test(lower)
  const suggestScreen = /\b(screen|share|workflow|audit)\b/.test(lower)
  const suggestResearch = /\b(search|research|find|look up|latest|news|competitor)\b/.test(lower)
  
  if (isUserMessage) {
    return (
      <motion.div 
        className="flex justify-end mb-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-2xl">
          <motion.div 
            className={`inline-block rounded-2xl px-4 py-2 ${
              message.inputMode === 'voice' ? 'bg-blue-500 text-white' :
              message.inputMode === 'video' ? 'bg-green-500 text-white' :
              message.inputMode === 'screen' ? 'bg-purple-500 text-white' :
              'bg-primary text-primary-foreground'
            }`}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content || ''}
              {!message.isComplete && message.inputMode !== 'text' && (
                <motion.span 
                  className="ml-1 text-white/80"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ▋
                </motion.span>
              )}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="group mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3 max-w-4xl" onClick={(e) => {
        const target = e.target as HTMLElement
        const btn = target.closest('button[data-tool]') as HTMLElement | null
        if (btn) {
          const tool = btn.getAttribute('data-tool') || ''
          const query = btn.getAttribute('data-query') || ''
          if (tool === 'voice') onMessageAction('tool:voice', message.id)
          else if (tool === 'screen') onMessageAction('tool:screen', message.id)
          else if (tool === 'search') onMessageAction('tool:research', message.id)
          else if (tool === 'roi-inline') onMessageAction('tool:roi-inline', message.id)
          else onMessageAction(`tool:${tool}`, message.id)
        }
      }}>
        {/* Simple AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Clean AI header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-primary">F.B/c AI Assistant</span>
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.timestamp)}
            </span>
            {message.type === 'cta' && (
              <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/20">
                Action Required
              </Badge>
            )}
          </div>
          
          {/* Clean message content */}
          <div className="text-sm leading-relaxed text-foreground">
            <Response 
              content={message.content || ''} 
              className="whitespace-pre-wrap"
            />

            {/* Show loading indicator for incomplete messages */}
            {!message.isComplete && (message.sender === 'ai' || message.role === 'assistant') && (
              <motion.span 
                className="ml-1 text-primary"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ▋
              </motion.span>
            )}
          </div>

          {/* Minimal inline sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {message.sources.map((source, index) => (
                <Source
                  key={index}
                  title={source.title}
                  url={source.url}
                  excerpt={source.excerpt}
                />
              ))}
            </div>
          )}

          {/* Minimal inline tasks */}
          {message.tasks && message.tasks.length > 0 && (
            <div className="mt-1 space-y-0">
              {message.tasks.map((task) => (
                <Task
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  completed={task.completed}
                  onToggle={(taskId) => console.log('Task toggled:', taskId)}
                />
              ))}
            </div>
          )}

          {/* Minimal inline tools */}
          {message.tools && message.tools.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {message.tools.map((tool, index) => (
                <Tool
                  key={index}
                  name={tool.name}
                  description={tool.description}
                  used={tool.used}
                />
              ))}
            </div>
          )}

          {/* Inline tool buttons & ROI card */}
          {(suggestROI || suggestVoice || suggestScreen || suggestResearch) && (
            <div className="mt-3 space-y-2">
              {suggestROI && <ROIInlineCard />}
              <div className="flex flex-wrap gap-2">
                {suggestVoice && (
                  <Button size="sm" variant="outline" className="h-7" onClick={() => onMessageAction('tool:voice', message.id)}>
                    Start Voice Chat
                  </Button>
                )}
                {suggestScreen && (
                  <Button size="sm" variant="outline" className="h-7" onClick={() => onMessageAction('tool:screen', message.id)}>
                    Share Screen
                  </Button>
                )}
                {suggestResearch && (
                  <Button size="sm" variant="outline" className="h-7" onClick={() => onMessageAction('tool:research', message.id)}>
                    Search Web
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Simple actions row */}
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Actions
              actions={[
                {
                  label: 'Copy',
                  icon: Copy,
                  action: () => onMessageAction('copy', message.id)
                },
                {
                  label: isPlaying ? 'Stop' : 'Read aloud',
                  icon: isPlaying ? Square : Play,
                  action: isPlaying ? onStopMessage : () => onPlayMessage(message.id)
                },
                {
                  label: 'Regenerate',
                  icon: RefreshCw,
                  action: () => onMessageAction('regenerate', message.id)
                }
              ]}
            />
          </div>

          {/* Clean Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <Suggestion
                  key={index}
                  text={suggestion}
                  onClick={() => onSuggestionClick(suggestion)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Clean Typing Indicator Component  
export const UnifiedTypingIndicator: React.FC<{ assistantName: string }> = ({ assistantName }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-4"
  >
    <div className="flex gap-3 max-w-4xl">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-primary">{assistantName}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <Loader
            type="dots"
            className="text-current"
            message="Thinking..."
          />
        </div>
      </div>
    </div>
  </motion.div>
);
