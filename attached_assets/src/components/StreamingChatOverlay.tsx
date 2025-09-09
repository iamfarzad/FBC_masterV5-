import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Minimize, 
  Maximize, 
  X,
  MessageSquare,
  Zap,
  User,
  Settings,
  Copy,
  Download,
  Share,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  Database,
  Signal
} from 'lucide-react';
import { LiveStreamingInterface } from './LiveStreamingInterface';
import { StreamingAudioVisualizer, CompactAudioVisualizer } from './StreamingAudioVisualizer';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface StreamingMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  type?: 'text' | 'audio' | 'partial';
  isComplete?: boolean;
}

interface StreamingChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamStart: (mode: 'voice' | 'video' | 'screen') => Promise<void>;
  onStreamStop: () => Promise<void>;
  onToggleMic: () => Promise<void>;
  onToggleCamera: () => Promise<void>;
  onToggleScreenShare: () => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
  messages: StreamingMessage[];
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}

export const StreamingChatOverlay: React.FC<StreamingChatOverlayProps> = ({
  isOpen,
  onClose,
  onStreamStart,
  onStreamStop,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onSendMessage,
  messages,
  isConnected,
  isListening,
  isSpeaking,
  audioLevel
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track session duration
  useEffect(() => {
    if (isConnected && !sessionStartTime) {
      setSessionStartTime(new Date());
    } else if (!isConnected) {
      setSessionStartTime(null);
      setSessionDuration(0);
    }
  }, [isConnected, sessionStartTime]);

  // Update session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStartTime) {
      interval = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStartTime]);

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async () => {
    if (textInput.trim()) {
      await onSendMessage(textInput);
      setTextInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed ${isMinimized ? 'bottom-6 right-6 w-96' : 'inset-8'} transition-all duration-500 ease-in-out`}
          >
            <Card className={`h-full flex flex-col holo-card shadow-2xl border-0 ${isMinimized ? 'max-h-[500px]' : ''} ${isConnected ? 'scan-line' : ''}`}>
              {/* Polished Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/20 bg-gradient-to-r from-card/80 to-muted/10 backdrop-blur-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="relative"
                      animate={isConnected ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className={`p-3 rounded-2xl holo-card ${isConnected ? 'holo-glow-lg bg-primary/5' : 'bg-muted/20'}`}>
                        <Zap className={`w-6 h-6 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      {isConnected && (
                        <>
                          <motion.div 
                            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping"></div>
                        </>
                      )}
                    </motion.div>
                    <div className="space-y-1">
                      <h2 className="font-semibold text-lg text-gradient">Live AI Assistant</h2>
                      <motion.div 
                        className="flex items-center gap-2"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          isConnected 
                            ? isListening 
                              ? 'bg-blue-400 animate-pulse' 
                              : isSpeaking 
                              ? 'bg-green-400 animate-pulse'
                              : 'bg-green-400'
                            : 'bg-muted-foreground'
                        }`}></div>
                        <p className="text-sm text-muted-foreground">
                          {isConnected 
                            ? isListening 
                              ? 'Listening for your voice...' 
                              : isSpeaking 
                              ? 'AI is responding...'
                              : 'Connected and ready'
                            : 'Ready to connect...'
                          }
                        </p>
                      </motion.div>
                    </div>
                  </div>
                  
                  {isConnected && (
                    <motion.div 
                      className="flex items-center gap-4 ml-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Badge variant="secondary" className="text-xs holo-border bg-green-500/10 text-green-400 border-green-500/30 px-3 py-1">
                        <Activity className="w-3 h-3 mr-1 animate-pulse" />
                        LIVE
                      </Badge>
                      <div className="flex items-center gap-2 holo-card px-3 py-1 rounded-full">
                        <CompactAudioVisualizer 
                          isActive={isListening || isSpeaking} 
                          level={audioLevel}
                          className={`${isListening ? 'text-blue-400' : isSpeaking ? 'text-green-400' : 'text-muted-foreground'}`}
                        />
                        <span className="text-xs font-mono text-muted-foreground">
                          {Math.round(audioLevel)}dB
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {formatDuration(sessionDuration)}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowControls(!showControls)}
                          className={`h-10 w-10 p-0 rounded-xl modern-button holo-border transition-all duration-300 ${
                            showControls ? 'bg-primary/10 text-primary holo-glow border-primary/30' : 'hover:holo-glow hover:border-primary/20'
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <span>{showControls ? 'Hide' : 'Show'} Controls</span>
                        <kbd className="text-xs bg-muted px-1 py-0.5 rounded">Ctrl+K</kbd>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMinimized(!isMinimized)}
                          className="h-10 w-10 p-0 rounded-xl modern-button holo-border hover:holo-glow hover:border-primary/20 transition-all duration-300"
                        >
                          {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <span>{isMinimized ? 'Maximize' : 'Minimize'}</span>
                        <kbd className="text-xs bg-muted px-1 py-0.5 rounded">Escape</kbd>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <div className="w-px h-6 bg-border/30 mx-2"></div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onClose}
                          className="h-10 w-10 p-0 rounded-xl modern-button holo-border hover:holo-glow hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Close Session</TooltipContent>
                  </Tooltip>
                </div>
          </div>

          <div className="flex-1 flex min-h-0">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Polished Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-modern">
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <motion.div 
                      key="empty-state"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center justify-center h-full text-center space-y-8"
                    >
                      <div className="relative">
                        <motion.div 
                          className="w-24 h-24 rounded-3xl holo-card holo-glow-lg flex items-center justify-center"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <MessageSquare className="w-12 h-12 text-primary" />
                        </motion.div>
                        <motion.div 
                          className="absolute inset-0 rounded-3xl border-2 border-primary/20"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <div className="space-y-3 max-w-lg">
                        <h3 className="text-xl font-semibold text-gradient">Start a Live Conversation</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Experience real-time AI assistance with advanced voice, video, and screen sharing capabilities. 
                          Your conversation is enhanced with live audio visualization and intelligent response streaming.
                        </p>
                      </div>
                      <motion.div 
                        className="flex flex-wrap gap-3 justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Badge variant="outline" className="text-sm holo-border bg-transparent px-4 py-2">
                          🎤 Voice Chat
                        </Badge>
                        <Badge variant="outline" className="text-sm holo-border bg-transparent px-4 py-2">
                          📹 Video Call
                        </Badge>
                        <Badge variant="outline" className="text-sm holo-border bg-transparent px-4 py-2">
                          🖥️ Screen Share
                        </Badge>
                      </motion.div>
                    </motion.div>
                  ) : (
                    messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className={`flex gap-6 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <motion.div 
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground holo-glow shadow-lg' 
                              : 'holo-card holo-glow'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {message.role === 'user' ? (
                            <User className="w-6 h-6" />
                          ) : (
                            <Zap className="w-6 h-6" />
                          )}
                        </motion.div>

                        <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`mb-3 text-sm text-muted-foreground flex items-center gap-3 ${
                            message.role === 'user' ? 'justify-end' : ''
                          }`}>
                            <span className="font-medium">{message.role === 'user' ? 'You' : 'AI Assistant'}</span>
                            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                            <span className="font-mono">{message.timestamp.toLocaleTimeString()}</span>
                            {message.type === 'audio' && (
                              <Badge variant="outline" className="text-xs holo-border bg-transparent px-2 py-1">
                                <Volume2 className="w-3 h-3 mr-1" />
                                Audio
                              </Badge>
                            )}
                          </div>

                          <motion.div 
                            className={`inline-block p-5 rounded-3xl backdrop-blur-sm ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground holo-glow shadow-lg'
                                : 'holo-card border border-border/30'
                            } ${!message.isComplete && message.role === 'assistant' ? 'scan-line' : ''} ${
                              message.role === 'user' ? 'rounded-tr-lg' : 'rounded-tl-lg'
                            }`}
                            layout
                          >
                            <p className="text-sm leading-relaxed">
                              {message.content}
                              {!message.isComplete && message.role === 'assistant' && (
                                <motion.span 
                                  className="ml-2 text-primary"
                                  animate={{ opacity: [1, 0, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  ▋
                                </motion.span>
                              )}
                            </p>
                          </motion.div>

                          {message.role === 'assistant' && (
                            <motion.div 
                              className="flex items-center gap-2 mt-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 rounded-xl modern-button hover:holo-glow"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>Copy message</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 rounded-xl modern-button hover:holo-glow"
                                    >
                                      <Share className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>Share message</TooltipContent>
                              </Tooltip>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                {/* Enhanced Partial transcript display */}
                <AnimatePresence>
                  {partialTranscript && (
                    <motion.div 
                      key="partial-transcript"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-6"
                    >
                      <motion.div 
                        className="w-12 h-12 rounded-2xl holo-card holo-glow flex items-center justify-center flex-shrink-0"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <User className="w-6 h-6" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="mb-3 text-sm text-muted-foreground flex items-center gap-3">
                          <span className="font-medium">You</span>
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-400">Live transcription</span>
                        </div>
                        <motion.div 
                          className="inline-block max-w-[80%] p-5 rounded-3xl rounded-tl-lg bg-muted/30 border border-blue-400/20 scan-line backdrop-blur-sm"
                          layout
                        >
                          <p className="text-sm leading-relaxed text-muted-foreground italic">
                            {partialTranscript}
                            <motion.span 
                              className="ml-2 text-blue-400"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ▋
                            </motion.span>
                          </p>
                          <motion.div 
                            className="flex items-center gap-2 mt-3"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-blue-400 font-medium">Processing speech...</span>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Polished Text Input Area */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 border-t border-border/20 bg-gradient-to-t from-muted/5 to-transparent backdrop-blur-sm"
                  >
                    <div className="relative">
                      <div className={`modern-input-focus overflow-hidden rounded-3xl border transition-all duration-300 ${
                        isConnected 
                          ? 'border-border/30 holo-border bg-background/90 shadow-lg' 
                          : 'border-border/20 bg-muted/20'
                      } backdrop-blur-lg`}>
                        <Textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={isConnected ? "Type your message or use voice..." : "Connect to start chatting"}
                          className="resize-none border-none bg-transparent py-6 pl-6 pr-20 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                          rows={2}
                          disabled={!isConnected}
                        />
                        
                        <div className="absolute bottom-3 right-3 flex items-center gap-3">
                          <AnimatePresence>
                            {isListening && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              >
                                <motion.div 
                                  className="w-2 h-2 bg-blue-400 rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                                <span className="text-sm font-medium">Listening</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          <motion.div 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={handleSendText}
                              disabled={!textInput.trim() || !isConnected}
                              size="sm"
                              className={`h-12 w-12 p-0 rounded-2xl modern-button transition-all duration-300 ${
                                textInput.trim() && isConnected
                                  ? 'bg-primary text-primary-foreground holo-glow-lg scale-100 shadow-lg' 
                                  : 'bg-muted text-muted-foreground scale-90 opacity-50'
                              }`}
                            >
                              <Send className="w-5 h-5" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <motion.div 
                      className="flex items-center justify-between mt-4 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className={`flex items-center gap-2 ${
                            isConnected 
                              ? isListening 
                                ? 'text-blue-400' 
                                : isSpeaking 
                                ? 'text-green-400' 
                                : 'text-green-400'
                              : 'text-muted-foreground'
                          }`}
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className={`w-3 h-3 rounded-full ${
                            isConnected 
                              ? isListening 
                                ? 'bg-blue-400 animate-pulse' 
                                : isSpeaking 
                                ? 'bg-green-400 animate-pulse' 
                                : 'bg-green-400'
                              : 'bg-muted-foreground'
                          }`}></div>
                          <span className="font-medium">
                            {isConnected 
                              ? isListening 
                                ? "Voice input active" 
                                : isSpeaking 
                                ? "AI is responding..." 
                                : "Connected • Ready to chat"
                              : "Disconnected"
                            }
                          </span>
                        </motion.div>
                        {isConnected && (
                          <Badge variant="outline" className="text-xs holo-border bg-transparent px-3 py-1">
                            <Activity className="w-3 h-3 mr-1" />
                            Live Session
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <kbd className="bg-muted px-2 py-1 rounded-md">Enter</kbd> to send
                        </span>
                        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                        <span className="flex items-center gap-1">
                          <kbd className="bg-muted px-2 py-1 rounded-md">Shift+Enter</kbd> new line
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Polished Streaming Controls Sidebar */}
            <AnimatePresence>
              {showControls && !isMinimized && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="w-96 border-l border-border/20 bg-gradient-to-b from-muted/10 via-background/50 to-card/30 backdrop-blur-lg"
                >
                  <div className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gradient">Live Controls</h3>
                      <Badge variant="outline" className={`text-sm holo-border px-3 py-1 ${
                        isConnected ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-transparent'
                      }`}>
                        {isConnected ? (
                          <>
                            <Wifi className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3 mr-1" />
                            Ready
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Audio Visualizer */}
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Audio Activity</span>
                        <div className="flex items-center gap-2">
                          <Signal className="w-4 h-4 text-muted-foreground" />
                          <span className={`text-sm font-mono font-medium ${
                            isListening ? 'text-blue-400' : isSpeaking ? 'text-green-400' : 'text-muted-foreground'
                          }`}>
                            {Math.round(audioLevel)}dB
                          </span>
                        </div>
                      </div>
                      <div className="holo-card p-4 rounded-2xl">
                        <StreamingAudioVisualizer
                          isListening={isListening}
                          isSpeaking={isSpeaking}
                          audioLevel={audioLevel}
                          size="md"
                        />
                      </div>
                    </motion.div>

                    {/* Enhanced Status Grid */}
                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="p-4 rounded-2xl holo-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-muted-foreground'}`} />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Connection</span>
                        </div>
                        <div className={`text-sm font-semibold ${
                          isConnected ? 'text-green-400' : 'text-muted-foreground'
                        }`}>
                          {isConnected ? 'Stable' : 'Disconnected'}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl holo-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Latency</span>
                        </div>
                        <div className="text-sm font-semibold text-green-400">
                          {isConnected ? '~45ms' : '--'}
                        </div>
                      </div>
                    </motion.div>

                    {/* Streaming Interface */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <LiveStreamingInterface
                        onStartStream={onStreamStart}
                        onStopStream={onStreamStop}
                        onToggleMic={onToggleMic}
                        onToggleCamera={onToggleCamera}
                        onToggleScreenShare={onToggleScreenShare}
                      />
                    </motion.div>

                    {/* Enhanced Session Info */}
                    <AnimatePresence>
                      {isConnected && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: 0.4 }}
                          className="p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-card/30 border border-border/20 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Database className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Session Statistics</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Messages</div>
                              <div className="font-semibold">{messages.length}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Duration</div>
                              <div className="font-semibold font-mono">{formatDuration(sessionDuration)}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Quality</div>
                              <div className="font-semibold text-green-400">High</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground">Data Used</div>
                              <div className="font-semibold">2.1 MB</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};