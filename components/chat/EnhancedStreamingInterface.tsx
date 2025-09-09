"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { 
  Mic, 
  MicOff, 
  Camera, 
  Video,
  Monitor, 
  X, 
  Maximize, 
  Minimize,
  FlipHorizontal,
  Upload,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Signal,
  SignalHigh,
  SignalLow,
  AlertCircle,
  CheckCircle,
  Zap,
  Activity,
  Settings,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

interface StreamingState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface EnhancedStreamingInterfaceProps {
  mode: 'voice' | 'video' | 'screen';
  streamingState: StreamingState;
  transcript?: string;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onTogglePause: () => void;
  onEndSession: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchCamera?: () => void;
  onToggleFullscreen?: () => void;
  className?: string;
}

// Advanced Audio Visualizer Component
const AdvancedAudioVisualizer: React.FC<{
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  mode: 'voice' | 'video' | 'screen';
  className?: string;
}> = ({ audioLevel, isListening, isSpeaking, mode, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [bars, setBars] = useState<number[]>(new Array(32).fill(0));

  // Canvas-based visualization for voice mode
  useEffect(() => {
    if (mode !== 'voice') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.6;
      
      // Set glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = isListening ? '#60a5fa' : isSpeaking ? '#22c55e' : '#ffffff';
      
      // Waveform pattern
      ctx.beginPath();
      ctx.strokeStyle = isListening ? '#60a5fa' : isSpeaking ? '#22c55e' : '#ffffff';
      ctx.lineWidth = 2;
      
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const wave = Math.sin(angle * 4 + time) * audioLevel * 0.8;
        const x = centerX + Math.cos(angle) * (radius + wave * 15);
        const y = centerY + Math.sin(angle) * (radius + wave * 15);
        
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      
      time += 0.03;
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isListening || isSpeaking) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isListening, isSpeaking, mode]);

  // Bar visualization for other modes
  useEffect(() => {
    if (isListening || isSpeaking) {
      const interval = setInterval(() => {
        setBars(prev => prev.map((_, index) => {
          const baseLevel = audioLevel;
          const variation = Math.random() * 30;
          const frequency = Math.sin((Date.now() / 100) + index) * 20;
          return Math.max(5, Math.min(95, baseLevel + variation + frequency));
        }));
      }, 50);

      return () => clearInterval(interval);
    } else {
      setBars(prev => prev.map(bar => Math.max(0, bar - 5)));
    }
  }, [isListening, isSpeaking, audioLevel]);

  return (
    <div className={`relative ${className}`}>
      {mode === 'voice' && (
        <canvas
          ref={canvasRef}
          width={120}
          height={120}
          className="absolute inset-0 rounded-full"
        />
      )}
      
      {mode !== 'voice' && (
        <div className="flex items-center gap-0.5 h-6">
          {bars.slice(0, 16).map((height, index) => (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-100 ${
                isListening ? 'bg-blue-400' : isSpeaking ? 'bg-green-400' : 'bg-white/30'
              }`}
              style={{ 
                height: `${Math.max(2, height / 4)}px`,
                opacity: isListening || isSpeaking ? 1 : 0.3
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Connection Quality Indicator
const ConnectionQuality: React.FC<{
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  isConnected: boolean;
}> = ({ quality, isConnected }) => {
  const getIcon = () => {
    switch (quality) {
      case 'excellent': return <SignalHigh className="w-4 h-4 text-green-500" />;
      case 'good': return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <SignalLow className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getColor = () => {
    switch (quality) {
      case 'excellent': return 'border-green-500/30 bg-green-500/5 text-green-400';
      case 'good': return 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400';
      case 'poor': return 'border-red-500/30 bg-red-500/5 text-red-400';
      default: return 'border-muted/30 bg-muted/5 text-muted-foreground';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${getColor()} holo-card backdrop-blur-xl`}>
      {getIcon()}
      <span className="text-xs font-medium capitalize">{quality}</span>
      {isConnected && (
        <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
      )}
    </div>
  );
};

// Session Timer
const SessionTimer: React.FC<{ startTime: Date | null }> = ({ startTime }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!startTime) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl holo-card backdrop-blur-xl border border-holo-border">
      <Clock className="w-3 h-3 text-muted-foreground" />
      <span className="text-xs font-mono text-muted-foreground">
        {formatDuration(duration)}
      </span>
    </div>
  );
};

export const EnhancedStreamingInterface: React.FC<EnhancedStreamingInterfaceProps> = ({
  mode,
  streamingState,
  transcript,
  onToggleMic,
  onToggleCamera,
  onTogglePause,
  onEndSession,
  onFileUpload,
  onSwitchCamera,
  onToggleFullscreen,
  className = ""
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('environment');
  const [isMobile, setIsMobile] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Track session start time
  useEffect(() => {
    if (streamingState.isConnected && !sessionStartTime) {
      setSessionStartTime(new Date());
    } else if (!streamingState.isConnected) {
      setSessionStartTime(null);
    }
  }, [streamingState.isConnected, sessionStartTime]);

  // Handle pause/resume
  const handlePause = () => {
    setIsPaused(!isPaused);
    onTogglePause();
  };

  // Handle fullscreen toggle
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    onToggleFullscreen?.();
  };

  // Handle file upload click
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle camera switching
  const handleSwitchCamera = async () => {
    const newCamera = currentCamera === 'user' ? 'environment' : 'user';
    setCurrentCamera(newCamera);
    
    if (onSwitchCamera) {
      onSwitchCamera();
    }
    
    // Update camera stream if active
    if (mode === 'video' && streamingState.isConnected && videoRef.current) {
      await initializeCamera(newCamera);
    }
  };

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize camera stream
  const initializeCamera = async (cameraMode: 'user' | 'environment') => {
    if (!videoRef.current) return;

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get new stream with specified camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (error) {
      console.error('Camera initialization failed:', error);
      // Fallback to mock display
      if (videoRef.current) {
        videoRef.current.style.background = 'linear-gradient(45deg, #1a1a1a, #2a2a2a)';
      }
    }
  };

  // Camera initialization
  useEffect(() => {
    if (mode === 'video' && videoRef.current && streamingState.isConnected) {
      initializeCamera(currentCamera);
    }

    // Cleanup on unmount or mode change
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [mode, streamingState.isConnected, currentCamera]);

  return (
    <motion.div 
      className={`fixed inset-0 z-50 bg-gradient-to-br from-void-black via-deep-black to-carbon-black ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Enhanced Holographic Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'var(--grid-pattern)',
          backgroundSize: 'var(--grid-size)'
        }}
      />

      {/* Enhanced Header with Connection Status */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-deep-black/95 via-deep-black/70 to-transparent backdrop-blur-xl border-b border-holo-border/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Enhanced Live Session Indicator */}
            <motion.div 
              className="flex items-center gap-3 px-5 py-3 rounded-2xl holo-card backdrop-blur-xl border-2 border-holo-border shadow-xl"
              whileHover={{ scale: 1.02, y: -1 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div 
                className={`w-4 h-4 rounded-full relative ${
                  streamingState.isConnected ? 'bg-red-400 shadow-lg shadow-red-400/50' : 'bg-muted-foreground'
                }`}
                animate={streamingState.isConnected ? { 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {streamingState.isConnected && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-400"
                    animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div className="flex items-center gap-3">
                <span className="text-foreground font-semibold tracking-wide text-lg">Live Session</span>
                {streamingState.isConnected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded-full border border-red-500/30"
                  >
                    ACTIVE
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Mode Badges */}
            {mode === 'voice' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
              >
                <Badge variant="outline" className="px-4 py-2 rounded-2xl holo-card backdrop-blur-xl border-2 border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/20 font-medium tracking-wide">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Mode
                </Badge>
              </motion.div>
            )}
            {mode === 'video' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
              >
                <Badge variant="outline" className="px-4 py-2 rounded-2xl holo-card backdrop-blur-xl border-2 border-green-500/30 bg-green-500/10 text-green-300 shadow-lg shadow-green-500/20 font-medium tracking-wide">
                  <Camera className="w-4 h-4 mr-2" />
                  Video Mode
                </Badge>
              </motion.div>
            )}
            {mode === 'screen' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
              >
                <Badge variant="outline" className="px-4 py-2 rounded-2xl holo-card backdrop-blur-xl border-2 border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-lg shadow-purple-500/20 font-medium tracking-wide">
                  <Monitor className="w-4 h-4 mr-2" />
                  Screen Share
                </Badge>
              </motion.div>
            )}

            {/* Enhanced Status Indicators */}
            {streamingState.isConnected && (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ConnectionQuality 
                  quality={streamingState.connectionQuality || 'excellent'} 
                  isConnected={streamingState.isConnected} 
                />
                <SessionTimer startTime={sessionStartTime} />
                
                {/* Audio Level Indicator */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl holo-card backdrop-blur-xl border border-holo-border">
                  <AdvancedAudioVisualizer
                    audioLevel={streamingState.audioLevel}
                    isListening={streamingState.isListening}
                    isSpeaking={streamingState.isSpeaking}
                    mode={mode}
                    className="w-8 h-4"
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    {Math.round(streamingState.audioLevel)}dB
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced Header Controls */}
          <div className="flex items-center gap-2">
            {/* Advanced Settings Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.08, y: -1 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                    className={`group relative h-11 w-11 p-0 rounded-2xl holo-card backdrop-blur-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden ${
                      showAdvancedControls 
                        ? 'border-primary/40 bg-primary/10 text-primary' 
                        : 'border-holo-border text-foreground hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Settings className="size-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute inset-0 rounded-2xl scan-line opacity-0 group-hover:opacity-100" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="holo-card border-holo-border bg-deep-black/90 text-white">
                <div className="flex items-center gap-2">
                  <Settings className="size-3" />
                  {showAdvancedControls ? 'Hide' : 'Show'} Advanced Controls
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Camera Switch for Desktop */}
            {mode === 'video' && !isMobile && onSwitchCamera && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.08, y: -1 }} 
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSwitchCamera}
                      className="group relative h-11 w-11 p-0 rounded-2xl holo-card backdrop-blur-xl border-2 border-holo-border text-foreground hover:border-white/30 hover:bg-white/5 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <FlipHorizontal className="size-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                      <div className="absolute inset-0 rounded-2xl scan-line opacity-0 group-hover:opacity-100" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="holo-card border-holo-border bg-deep-black/90 text-white">
                  <div className="flex items-center gap-2">
                    <FlipHorizontal className="size-3" />
                    Switch Camera
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Fullscreen Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.08, y: -1 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="group relative h-11 w-11 p-0 rounded-2xl holo-card backdrop-blur-xl border-2 border-holo-border text-foreground hover:border-white/30 hover:bg-white/5 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {isFullscreen ? 
                      <Minimize className="size-4 relative z-10 group-hover:scale-110 transition-transform duration-200" /> : 
                      <Maximize className="size-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                    }
                    <div className="absolute inset-0 rounded-2xl scan-line opacity-0 group-hover:opacity-100" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="holo-card border-holo-border bg-deep-black/90 text-white">
                <div className="flex items-center gap-2">
                  {isFullscreen ? <Minimize className="size-3" /> : <Maximize className="size-3" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Advanced Controls Panel */}
        <AnimatePresence>
          {showAdvancedControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="p-4 rounded-2xl holo-card backdrop-blur-xl border border-holo-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Audio Quality</label>
                    <select className="w-full p-2 rounded-xl bg-card border border-holo-border text-sm">
                      <option>High (48kHz)</option>
                      <option>Medium (22kHz)</option>
                      <option>Low (16kHz)</option>
                    </select>
                  </div>
                  
                  {mode === 'video' && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Video Quality</label>
                      <select className="w-full p-2 rounded-xl bg-card border border-holo-border text-sm">
                        <option>HD (720p)</option>
                        <option>Medium (480p)</option>
                        <option>Low (360p)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Noise Cancellation
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Auto Quality
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-40">
        {mode === 'voice' && (
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Enhanced Voice Visualizer with Canvas */}
            <div className="relative">
              <motion.div 
                className={`w-48 h-48 rounded-full border-2 border-holo-border flex items-center justify-center holo-card backdrop-blur-xl relative ${
                  streamingState.isListening || streamingState.isSpeaking 
                    ? 'holo-glow-lg scan-line' 
                    : ''
                }`}
                animate={streamingState.isListening || streamingState.isSpeaking ? {
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 255, 0.1)',
                    '0 0 60px rgba(255, 255, 255, 0.3)',
                    '0 0 20px rgba(255, 255, 255, 0.1)'
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AdvancedAudioVisualizer
                  audioLevel={streamingState.audioLevel}
                  isListening={streamingState.isListening}
                  isSpeaking={streamingState.isSpeaking}
                  mode={mode}
                  className="absolute inset-6"
                />

                <motion.div
                  animate={streamingState.isListening || streamingState.isSpeaking ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10"
                >
                  <Mic className={`size-20 ${
                    streamingState.isListening 
                      ? 'text-blue-400' 
                      : streamingState.isSpeaking 
                      ? 'text-green-400' 
                      : 'text-foreground'
                  }`} />
                </motion.div>

                {/* Geometric accents */}
                <div className="absolute inset-6 rounded-full border border-holo-border opacity-30" />
                <div className="absolute inset-12 rounded-full border border-holo-border opacity-20" />
              </motion.div>
              
              {/* Enhanced Audio level rings */}
              {(streamingState.isListening || streamingState.isSpeaking) && (
                <div className="absolute inset-0">
                  <motion.div 
                    className="w-full h-full rounded-full border border-holo-border"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] rounded-full border border-holo-border"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.2, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              )}
            </div>

            {/* Enhanced Status Text */}
            <div className="space-y-4">
              <motion.div 
                className="text-foreground text-3xl font-medium tracking-wide"
                animate={streamingState.isListening || streamingState.isSpeaking ? {
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {streamingState.isListening 
                  ? '👂 Listening...' 
                  : streamingState.isSpeaking 
                  ? '🤖 AI responding...'
                  : isPaused 
                  ? '⏸️ Paused'
                  : '🎙️ Ready to talk'
                }
              </motion.div>
              
              {transcript && (
                <motion.div 
                  className="max-w-2xl mx-auto p-8 rounded-3xl holo-card backdrop-blur-xl border border-holo-border holo-glow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <p className="text-foreground text-lg leading-relaxed">
                    {transcript}
                    <motion.span 
                      className="ml-2 text-primary"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ▋
                    </motion.span>
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {mode === 'video' && (
          <motion.div 
            className="w-full h-full relative max-w-6xl max-h-4xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Enhanced Video Feed */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-holo-border holo-glow backdrop-blur-sm">
              <video
                ref={videoRef}
                className="w-full h-full object-cover bg-gradient-to-br from-carbon-black to-gunmetal"
                autoPlay
                muted
                playsInline
              />
              
              {/* Holographic frame overlay */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-holo-glow/5 to-transparent opacity-50" />
              </div>

              {/* Enhanced Audio Visualizer Overlay */}
              <div className="absolute bottom-6 left-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl holo-card backdrop-blur-xl border border-holo-border">
                  <AdvancedAudioVisualizer
                    audioLevel={streamingState.audioLevel}
                    isListening={streamingState.isListening}
                    isSpeaking={streamingState.isSpeaking}
                    mode={mode}
                    className="w-16 h-6"
                  />
                  <div className="text-xs">
                    <div className={`font-medium ${
                      streamingState.isListening ? 'text-blue-400' : streamingState.isSpeaking ? 'text-green-400' : 'text-muted-foreground'
                    }`}>
                      {streamingState.isListening ? 'Listening' : streamingState.isSpeaking ? 'AI Speaking' : 'Ready'}
                    </div>
                    <div className="text-muted-foreground font-mono">{Math.round(streamingState.audioLevel)}dB</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Camera Mode Indicator */}
            <motion.div 
              className="absolute top-6 left-6 z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Badge variant="outline" className="px-4 py-2 rounded-2xl holo-card backdrop-blur-xl border-2 border-holo-border text-foreground shadow-lg font-medium">
                <Camera className="w-4 h-4 mr-2" />
                {currentCamera === 'environment' ? 'Back Camera' : 'Front Camera'}
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </Badge>
            </motion.div>

            {/* Enhanced Live Transcript Overlay */}
            <AnimatePresence>
              {transcript && (
                <motion.div 
                  className="absolute top-1/3 left-6 right-6 z-10"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="p-6 rounded-3xl holo-card backdrop-blur-xl border border-holo-border holo-glow-lg shadow-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse mt-2" />
                      <p className="text-foreground text-lg leading-relaxed font-medium flex-1">
                        {transcript}
                        <motion.span 
                          className="ml-2 text-primary"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ▋
                        </motion.span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Camera Switch Button - Mobile */}
            {isMobile && onSwitchCamera && (
              <motion.div 
                className="absolute top-6 right-6 z-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.08, y: -2 }} 
                      whileTap={{ scale: 0.92 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button
                        onClick={handleSwitchCamera}
                        size="sm"
                        className="group relative h-14 w-14 p-0 rounded-3xl holo-card backdrop-blur-xl border-2 border-holo-border text-foreground hover:border-white/40 hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden"
                        variant="ghost"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <FlipHorizontal className="size-6 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                        <div className="absolute inset-0 rounded-3xl scan-line opacity-0 group-hover:opacity-100" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="holo-card border-holo-border bg-deep-black/90 text-white">
                    <div className="flex items-center gap-2">
                      <FlipHorizontal className="size-3" />
                      Switch Camera
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </motion.div>
        )}

        {mode === 'screen' && (
          <motion.div 
            className="text-center space-y-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Enhanced Screen Share Indicator */}
            <div className="relative">
              <motion.div 
                className="w-48 h-36 rounded-3xl border-2 border-holo-border flex items-center justify-center holo-card backdrop-blur-xl relative"
                animate={streamingState.isConnected ? {
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.2)',
                    '0 0 60px rgba(168, 85, 247, 0.4)',
                    '0 0 20px rgba(168, 85, 247, 0.2)'
                  ]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  animate={streamingState.isConnected ? {
                    scale: [1, 1.1, 1],
                    rotateY: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Monitor className="size-20 text-purple-400" />
                </motion.div>

                {/* Screen representation lines */}
                <div className="absolute inset-8 border border-holo-border rounded-2xl opacity-30">
                  <div className="absolute top-2 left-2 right-2 h-px bg-holo-border opacity-50" />
                  <div className="absolute top-4 left-2 right-2 h-px bg-holo-border opacity-30" />
                  <div className="absolute top-6 left-2 right-2 h-px bg-holo-border opacity-20" />
                </div>
              </motion.div>
              
              {/* Enhanced Screen sharing pulse effect */}
              {streamingState.isConnected && (
                <div className="absolute inset-0">
                  <motion.div 
                    className="w-full h-full rounded-3xl border border-purple-400/40"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 0.2, 0.6]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <motion.div 
                    className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] rounded-3xl border border-purple-400/30"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 0.3, 0.8]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
              )}
            </div>

            {/* Enhanced Status Text */}
            <div className="space-y-4">
              <motion.div 
                className="text-foreground text-3xl font-medium tracking-wide"
                animate={streamingState.isConnected ? {
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {streamingState.isConnected 
                  ? '🖥️ Sharing screen...'
                  : isPaused 
                  ? '⏸️ Screen share paused'
                  : '📺 Ready to share'
                }
              </motion.div>
              
              {transcript && (
                <motion.div 
                  className="max-w-2xl mx-auto p-8 rounded-3xl holo-card backdrop-blur-xl border border-holo-border holo-glow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <p className="text-foreground text-lg leading-relaxed">
                    {transcript}
                    <motion.span 
                      className="ml-2 text-primary"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ▋
                    </motion.span>
                  </p>
                </motion.div>
              )}
            </div>

            {/* Mobile hint for video mode */}
            {isMobile && mode === 'video' && (
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl holo-card backdrop-blur-xl border border-holo-border text-muted-foreground text-sm font-medium shadow-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  💡 Tap the camera switch button (top right) to change between front and back camera
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Enhanced Control Panel at Bottom */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-10 p-8 bg-gradient-to-t from-deep-black/95 via-deep-black/70 to-transparent backdrop-blur-xl border-t border-holo-border/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <div className="flex items-center justify-center gap-8">
          {/* Camera Toggle (Video Mode) - Polished */}
          {mode === 'video' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.1, y: -3 }} 
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    onClick={onToggleCamera}
                    className="group relative w-20 h-20 rounded-3xl holo-card backdrop-blur-xl border-2 border-holo-border text-foreground hover:border-white/40 hover:bg-white/5 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden"
                    variant="ghost"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Camera className="size-8 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                    
                    {/* Enhanced camera type indicator */}
                    <motion.div
                      className="absolute -top-2 -right-2 z-20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Badge className="w-7 h-7 p-0 rounded-full bg-blue-500 text-white text-xs border-2 border-deep-black shadow-lg flex items-center justify-center font-medium">
                        {currentCamera === 'environment' ? 'B' : 'F'}
                      </Badge>
                    </motion.div>
                    
                    <div className="absolute inset-0 rounded-3xl scan-line opacity-0 group-hover:opacity-100" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="holo-card border-holo-border bg-deep-black/90 text-white">
                <div className="flex items-center gap-2">
                  <Camera className="size-3" />
                  Toggle Camera
                  <Badge variant="outline" className="ml-2 text-xs border-blue-500/30 text-blue-300">
                    {currentCamera === 'environment' ? 'Back' : 'Front'}
                  </Badge>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Mic Toggle (Voice/Video Modes) - Polished */}
          {(mode === 'voice' || mode === 'video') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  whileHover={{ scale: 1.1, y: -3 }} 
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button
                    onClick={onToggleMic}
                    className={`group relative w-20 h-20 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300 shadow-2xl overflow-hidden ${
                      streamingState.isListening 
                        ? 'holo-card border-blue-500/40 bg-blue-500/20 text-blue-300 shadow-blue-500/25 scan-line' 
                        : 'holo-card border-holo-border text-foreground hover:border-white/40 hover:bg-white/5 hover:shadow-3xl'
                    }`}
                    variant="ghost"
                  >
                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      streamingState.isListening
                        ? 'bg-gradient-to-br from-blue-500/20 to-transparent opacity-100'
                        : 'bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100'
                    }`} />
                    
                    <AnimatePresence mode="wait">
                      {streamingState.isListening ? (
                        <motion.div
                          key="mic-active"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="relative z-10"
                        >
                          <Mic className="size-8 group-hover:scale-110 transition-transform duration-200" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="mic-inactive"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="relative z-10"
                        >
                          <MicOff className="size-8 group-hover:scale-110 transition-transform duration-200" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {streamingState.isListening && (
                      <motion.div
                        className="absolute inset-0 rounded-3xl border-2 border-blue-400/30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="top" className="holo-card border-holo-border bg-deep-black/90 text-white">
                <div className="flex items-center gap-2">
                  {streamingState.isListening ? <Mic className="size-3" /> : <MicOff className="size-3" />}
                  {streamingState.isListening ? 'Mute Microphone' : 'Unmute Microphone'}
                  {streamingState.isListening && (
                    <Badge variant="outline" className="ml-2 text-xs border-blue-500/30 text-blue-300 animate-pulse">
                      Live
                    </Badge>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {/* File Upload - Polished */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                whileHover={{ scale: 1.1, y: -3 }} 
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={handleFileUpload}
                  className="group relative w-20 h-20 rounded-3xl holo-card backdrop-blur-xl border-2 border-holo-border text-foreground hover:border-white/40 hover:bg-white/5 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden"
                  variant="ghost"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Upload className="size-8 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute inset-0 rounded-3xl scan-line opacity-0 group-hover:opacity-100" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="holo-card border-holo-border bg-deep-black/90 text-white">
              <div className="flex items-center gap-2">
                <Upload className="size-3" />
                Upload Files
                <Badge variant="outline" className="ml-2 text-xs border-muted-foreground/30 text-muted-foreground">
                  ⌘+U
                </Badge>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Pause/Resume - Polished */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                whileHover={{ scale: 1.1, y: -3 }} 
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={handlePause}
                  className={`group relative w-20 h-20 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300 shadow-2xl overflow-hidden ${
                    isPaused 
                      ? 'holo-card border-yellow-500/40 bg-yellow-500/20 text-yellow-300 shadow-yellow-500/25'
                      : 'holo-card border-holo-border text-foreground hover:border-white/40 hover:bg-white/5 hover:shadow-3xl'
                  }`}
                  variant="ghost"
                >
                  <div className={`absolute inset-0 transition-opacity duration-300 ${
                    isPaused
                      ? 'bg-gradient-to-br from-yellow-500/20 to-transparent opacity-100'
                      : 'bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100'
                  }`} />
                  
                  <AnimatePresence mode="wait">
                    {isPaused ? (
                      <motion.div
                        key="play"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="relative z-10"
                      >
                        <Play className="size-8 group-hover:scale-110 transition-transform duration-200" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pause"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="relative z-10"
                      >
                        <Pause className="size-8 group-hover:scale-110 transition-transform duration-200" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="absolute inset-0 rounded-3xl scan-line opacity-0 group-hover:opacity-100" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="holo-card border-holo-border bg-deep-black/90 text-white">
              <div className="flex items-center gap-2">
                {isPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
                {isPaused ? 'Resume Session' : 'Pause Session'}
                {isPaused && (
                  <Badge variant="outline" className="ml-2 text-xs border-yellow-500/30 text-yellow-300">
                    Paused
                  </Badge>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* End Session - Polished */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                whileHover={{ scale: 1.1, y: -3 }} 
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  onClick={onEndSession}
                  className="group relative w-20 h-20 rounded-3xl backdrop-blur-xl border-2 border-red-500/40 bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:border-red-500/60 transition-all duration-300 shadow-2xl shadow-red-500/30 hover:shadow-red-500/40 overflow-hidden"
                  variant="ghost"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                  <X className="size-8 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute inset-0 rounded-3xl scan-line opacity-0 group-hover:opacity-100" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="holo-card border-holo-border bg-deep-black/90 text-white">
              <div className="flex items-center gap-2">
                <X className="size-3" />
                End Session
                <Badge variant="outline" className="ml-2 text-xs border-red-500/30 text-red-300">
                  ⎋ ESC
                </Badge>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        multiple
      />
    </motion.div>
  );
};