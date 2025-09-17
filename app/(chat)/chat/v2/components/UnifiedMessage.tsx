import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Sparkles, Copy, RefreshCw, Share, Play, Square, Mic, Camera, Monitor, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useUnifiedChatMessages } from '@/src/core/chat/state/unified-chat-store'
import type { UnifiedMessage as UnifiedChatMessageType } from '@/src/core/chat/unified-types'

export interface MessageData {
  id: string;
  content?: string;
  sender: 'user' | 'ai';
  role?: 'user' | 'assistant' | 'system';
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

interface UnifiedMessageProps {
  message: MessageData;
  onSuggestionClick: (suggestion: string) => void;
  onMessageAction?: (action: string, messageId: string) => void;
  onPlayMessage?: (messageId: string) => void;
  onStopMessage?: () => void;
  onRetry?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onPlayAudio?: () => void;
  onStopAudio?: () => void;
  isPlaying?: boolean;
  conversationState?: any;
  completedBooking?: any;
  isUser?: boolean;
  className?: string;
}

export const UnifiedMessage: React.FC<UnifiedMessageProps> = ({
  message,
  onSuggestionClick,
  onMessageAction,
  onPlayMessage,
  onStopMessage,
  isPlaying,
  conversationState,
  isUser,
  className = ""
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isUserMessage = message.sender === 'user' || message.role === 'user' || isUser;
  
  if (isUserMessage) {
    return (
      <motion.div 
        className={`flex justify-end mb-4 ${className}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-2xl">
          <motion.div 
            className="inline-block rounded-2xl px-4 py-2 bg-brand text-surface"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content || ''}
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`group mb-4 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3 max-w-4xl">
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* AI header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-brand">F.B/c AI Assistant</span>
            <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.timestamp)}
            </span>
            {message.type === 'cta' && (
              <Badge variant="secondary" className="text-xs bg-brand/10 text-brand border-brand/20">
                Action Required
              </Badge>
            )}
          </div>
          
          {/* Message content */}
          <div className="text-sm leading-relaxed text-text">
            <div className="whitespace-pre-wrap">
              {message.content || ''}
            </div>

            {/* Loading indicator for incomplete messages */}
            {!message.isComplete && message.sender === 'ai' && (
              <motion.span 
                className="ml-1 text-brand"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ▋
              </motion.span>
            )}
          </div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg bg-surface-elevated border border-border hover:border-brand transition-colors"
                  title={`${source.title} - ${source.excerpt}`}
                >
                  <span className="truncate max-w-24 font-medium">{source.title}</span>
                </a>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction?.('copy', message.id)}
              className="h-7 w-7 p-0 text-text-muted hover:text-text"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? onStopMessage : () => onPlayMessage?.(message.id)}
              className="h-7 w-7 p-0 text-text-muted hover:text-text"
            >
              {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMessageAction?.('regenerate', message.id)}
              className="h-7 w-7 p-0 text-text-muted hover:text-text"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-xl bg-surface-elevated border border-border hover:border-brand hover:bg-brand/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Simple placeholder components
export const SettingsOverlay = ({ isOpen, onClose, theme, onThemeChange }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <p className="text-text-muted">Settings panel - AI SDK Tools integration</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const FileUploadOverlay = ({ isOpen, onClose, onFilesUploaded }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
        <p className="text-text-muted">File upload - AI SDK Tools integration</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const UnifiedCanvasSystem = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Canvas System</h2>
        <p className="text-text-muted">Canvas tools - AI SDK Tools integration</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const CalendarBookingOverlay = ({ isOpen, onClose, onBookingComplete, leadData }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Book Consultation</h2>
        <p className="text-text-muted">Calendar booking - AI SDK Tools integration</p>
        <Button onClick={() => { onBookingComplete({}); onClose(); }} className="mt-4 mr-2">Book Now</Button>
        <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const SpeechToSpeechPopover = ({ isOpen, onClose, onVoiceComplete, isMinimized, onMinimize }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Voice Input</h2>
        <p className="text-text-muted">Voice recording - AI SDK Tools integration</p>
        <Button onClick={() => { onVoiceComplete('Test voice input'); onClose(); }} className="mt-4 mr-2">Complete</Button>
        <Button onClick={onClose} variant="outline" className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const WebcamInterface = ({ isOpen, onClose, onMinimize, isMinimized, cameraFacing, onCameraSwitch }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Webcam Interface</h2>
        <p className="text-text-muted">Camera analysis - AI SDK Tools integration</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const ScreenShareInterface = ({ isOpen, onClose, onMinimize, isMinimized }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Screen Share</h2>
        <p className="text-text-muted">Screen sharing - AI SDK Tools integration</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export const UnifiedMultimodalWidget = ({
  onVoiceToggle,
  onWebcamToggle,
  onScreenShareToggle,
}: any) => {
  const messages = useUnifiedChatMessages()

  const latestBySource = (source: string) => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const meta = messages[i]?.metadata
      if (meta && meta.source === source) {
        return messages[i]
      }
    }
    return null
  }

  const formatStatus = (message: UnifiedChatMessageType | null) => {
    if (!message) {
      return { label: 'Idle', tone: 'muted' as const }
    }
    if (message.metadata?.error) {
      return { label: 'Attention', tone: 'destructive' as const }
    }
    return { label: 'Active', tone: 'positive' as const }
  }

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return 'Never'
    try {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Recently'
    }
  }

  const voiceMessage = latestBySource('voice-input') || latestBySource('voice-test')
  const webcamMessage = latestBySource('webcam-analysis') || latestBySource('webcam-test')
  const screenMessage = latestBySource('screen-analysis') || latestBySource('screen-share')

  const cards = [
    {
      id: 'voice',
      label: 'Voice',
      icon: Mic,
      message: voiceMessage,
      onClick: onVoiceToggle,
    },
    {
      id: 'webcam',
      label: 'Webcam',
      icon: Camera,
      message: webcamMessage,
      onClick: onWebcamToggle,
    },
    {
      id: 'screen',
      label: 'Screen Share',
      icon: Monitor,
      message: screenMessage,
      onClick: onScreenShareToggle,
    },
  ]

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-text">Multimodal Tools</div>
        <Badge variant="secondary" className="text-xs bg-brand/10 text-brand border-brand/20">
          Gemini Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {cards.map(({ id, label, icon: Icon, message, onClick }) => {
          const status = formatStatus(message)
          const IconStatus = message?.metadata?.error ? AlertTriangle : CheckCircle2
          return (
            <button
              key={id}
              type="button"
              onClick={onClick}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-surface-elevated/70 p-3 text-left transition hover:border-brand/60 hover:bg-brand/5"
            >
              <div className="flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-text">
                  <Icon className="h-4 w-4 text-brand" />
                  {label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    status.tone === 'positive'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : status.tone === 'destructive'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-surface border border-border text-text-muted'
                  }`}
                >
                  <IconStatus className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-text-muted">
                {message?.content || 'No recent activity'}
              </p>
              <span className="text-[11px] text-text-muted">
                {message ? formatTimestamp(message.timestamp) : 'Never used'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const InlineROICalculator = ({ onComplete }: any) => {
  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-4 mt-4">
      <h3 className="font-semibold mb-2">ROI Calculator</h3>
      <p className="text-text-muted text-sm mb-4">AI SDK Tools integration</p>
      <Button onClick={() => onComplete?.({ roi: 150, paybackPeriod: 8, netProfit: 50000 })}>
        Calculate ROI
      </Button>
    </div>
  );
};

export const StageEventLogger = () => {
  if (process.env.NODE_ENV === 'production') return null;
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-surface border border-border rounded-lg p-3 text-xs">
      <div className="font-medium mb-1">Stage Events (dev)</div>
      <div className="text-text-muted">AI SDK Tools connected</div>
    </div>
  );
};
