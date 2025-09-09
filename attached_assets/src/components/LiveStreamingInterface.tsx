import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Monitor, 
  MonitorOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Signal,
  SignalHigh,
  SignalLow,
  AlertCircle,
  CheckCircle,
  Loader,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { isApiConfigured, config } from '../config/environment';

interface StreamingState {
  isConnected: boolean;
  isConnecting: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenShareEnabled: boolean;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  currentMode: 'voice' | 'video' | 'screen';
}

interface LiveStreamingInterfaceProps {
  onStartStream: (mode: 'voice' | 'video' | 'screen') => Promise<void>;
  onStopStream: () => Promise<void>;
  onToggleMic: () => Promise<void>;
  onToggleCamera: () => Promise<void>;
  onToggleScreenShare: () => Promise<void>;
  className?: string;
}

export const LiveStreamingInterface: React.FC<LiveStreamingInterfaceProps> = ({
  onStartStream,
  onStopStream,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  className = ''
}) => {
  const [streamState, setStreamState] = useState<StreamingState>({
    isConnected: false,
    isConnecting: false,
    micEnabled: false,
    cameraEnabled: false,
    screenShareEnabled: false,
    audioLevel: 0,
    connectionQuality: 'disconnected',
    currentMode: 'voice'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Audio level visualization
  useEffect(() => {
    if (streamState.isConnected && streamState.micEnabled) {
      const interval = setInterval(() => {
        // Simulate audio level changes - replace with actual audio analysis
        setStreamState(prev => ({
          ...prev,
          audioLevel: Math.random() * 100
        }));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [streamState.isConnected, streamState.micEnabled]);

  const handleStartStream = async (mode: 'voice' | 'video' | 'screen') => {
    setStreamState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      await onStartStream(mode);
      setStreamState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        currentMode: mode,
        connectionQuality: 'excellent',
        micEnabled: true,
        cameraEnabled: mode === 'video',
        screenShareEnabled: mode === 'screen'
      }));
    } catch (error) {
      setStreamState(prev => ({
        ...prev,
        isConnecting: false,
        connectionQuality: 'disconnected'
      }));
    }
  };

  const handleStopStream = async () => {
    await onStopStream();
    setStreamState({
      isConnected: false,
      isConnecting: false,
      micEnabled: false,
      cameraEnabled: false,
      screenShareEnabled: false,
      audioLevel: 0,
      connectionQuality: 'disconnected',
      currentMode: 'voice'
    });
  };

  const getConnectionIcon = () => {
    switch (streamState.connectionQuality) {
      case 'excellent': return <SignalHigh className="w-4 h-4 text-green-500" />;
      case 'good': return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <SignalLow className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getConnectionColor = () => {
    switch (streamState.connectionQuality) {
      case 'excellent': return 'border-green-500/30 bg-green-500/5';
      case 'good': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'poor': return 'border-red-500/30 bg-red-500/5';
      default: return 'holo-card';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status Header */}
      <div className={`p-4 rounded-xl border transition-all duration-300 ${getConnectionColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getConnectionIcon()}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Live AI Session</h3>
                {streamState.isConnected && (
                  <Badge variant="secondary" className="text-xs holo-border bg-transparent">
                    {streamState.currentMode.toUpperCase()}
                  </Badge>
                )}
                {config.isDemoMode && (
                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600/30 bg-yellow-600/10">
                    Demo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {streamState.isConnecting
                  ? 'Connecting to AI assistant...'
                  : streamState.isConnected
                  ? `Connected - ${streamState.connectionQuality} quality${config.isDemoMode ? ' (Demo Mode)' : ''}`
                  : config.isDemoMode 
                  ? 'Ready to start demo session'
                  : 'Ready to start live session'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {streamState.isConnected && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="h-8 w-8 p-0 rounded-full holo-border hover:holo-glow"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Advanced Settings</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8 p-0 rounded-full holo-border hover:holo-glow"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Fullscreen</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Audio Level Indicator */}
        {streamState.isConnected && streamState.micEnabled && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Mic className="w-3 h-3" />
              <span>Voice Activity</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100 ease-out"
                style={{ width: `${streamState.audioLevel}%` }}
              />
              <div className="absolute inset-0 holo-glow" />
            </div>
          </div>
        )}
      </div>

      {/* Video/Screen Display Area */}
      {streamState.isConnected && (streamState.cameraEnabled || streamState.screenShareEnabled) && (
        <Card className={`p-6 ${isFullscreen ? 'fixed inset-4 z-50' : ''} holo-card`}>
          <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {streamState.cameraEnabled && (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            )}
            
            {streamState.screenShareEnabled && (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain bg-black"
              />
            )}

            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {streamState.currentMode === 'video' ? 'Camera' : 'Screen Share'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCamera}
                    className="h-8 w-8 p-0 rounded-full bg-black/30 hover:bg-black/50"
                  >
                    {streamState.cameraEnabled ? (
                      <Camera className="w-4 h-4 text-white" />
                    ) : (
                      <CameraOff className="w-4 h-4 text-red-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Control Panel */}
      <Card className="p-6 holo-card">
        {!streamState.isConnected ? (
          /* Start Session Controls */
          <div className="space-y-4">
            <h4 className="font-medium">Start Live AI Session</h4>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => handleStartStream('voice')}
                disabled={streamState.isConnecting}
                className="flex items-center gap-3 h-auto py-4 px-4 modern-button holo-border hover:holo-glow transition-all duration-300 text-left"
                variant="outline"
              >
                <div className="p-2 rounded-lg holo-card">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Voice Chat</div>
                  <div className="text-xs text-muted-foreground">High-quality audio conversation</div>
                </div>
                <div className="text-xs text-muted-foreground">Recommended</div>
              </Button>

              <Button
                onClick={() => handleStartStream('video')}
                disabled={streamState.isConnecting}
                className="flex items-center gap-3 h-auto py-4 px-4 modern-button holo-border hover:holo-glow transition-all duration-300 text-left"
                variant="outline"
              >
                <div className="p-2 rounded-lg holo-card">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Video Call</div>
                  <div className="text-xs text-muted-foreground">Face-to-face with AI assistant</div>
                </div>
                <div className="text-xs text-muted-foreground">HD Quality</div>
              </Button>

              <Button
                onClick={() => handleStartStream('screen')}
                disabled={streamState.isConnecting}
                className="flex items-center gap-3 h-auto py-4 px-4 modern-button holo-border hover:holo-glow transition-all duration-300 text-left"
                variant="outline"
              >
                <div className="p-2 rounded-lg holo-card">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Screen Share</div>
                  <div className="text-xs text-muted-foreground">Share your screen for analysis</div>
                </div>
                <div className="text-xs text-muted-foreground">Interactive</div>
              </Button>
            </div>

            {streamState.isConnecting && (
              <div className="flex flex-col items-center gap-3 text-center animate-smooth-fade-in">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                  <span>Initializing secure connection...</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Setting up encrypted AI session with real-time capabilities
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Active Session Controls */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Session Controls</h4>
              <Badge variant="secondary" className="holo-border bg-transparent">
                Live Session Active
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-3">
              {/* Microphone Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onToggleMic}
                    variant={streamState.micEnabled ? "default" : "secondary"}
                    size="lg"
                    className={`h-12 w-12 rounded-full modern-button ${
                      streamState.micEnabled 
                        ? 'bg-primary text-primary-foreground holo-glow' 
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {streamState.micEnabled ? (
                      <Mic className="w-5 h-5" />
                    ) : (
                      <MicOff className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {streamState.micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                </TooltipContent>
              </Tooltip>

              {/* Camera Toggle (if in video mode) */}
              {streamState.currentMode === 'video' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onToggleCamera}
                      variant={streamState.cameraEnabled ? "default" : "secondary"}
                      size="lg"
                      className={`h-12 w-12 rounded-full modern-button ${
                        streamState.cameraEnabled 
                          ? 'bg-primary text-primary-foreground holo-glow' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {streamState.cameraEnabled ? (
                        <Camera className="w-5 h-5" />
                      ) : (
                        <CameraOff className="w-5 h-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {streamState.cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Screen Share Toggle (if in screen mode) */}
              {streamState.currentMode === 'screen' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onToggleScreenShare}
                      variant={streamState.screenShareEnabled ? "default" : "secondary"}
                      size="lg"
                      className={`h-12 w-12 rounded-full modern-button ${
                        streamState.screenShareEnabled 
                          ? 'bg-primary text-primary-foreground holo-glow' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {streamState.screenShareEnabled ? (
                        <Monitor className="w-5 h-5" />
                      ) : (
                        <MonitorOff className="w-5 h-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {streamState.screenShareEnabled ? 'Stop Screen Share' : 'Start Screen Share'}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* End Call */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleStopStream}
                    variant="destructive"
                    size="lg"
                    className="h-12 w-12 rounded-full modern-button bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End Session</TooltipContent>
              </Tooltip>
            </div>

            {/* Advanced Settings Panel */}
            {showAdvanced && (
              <div className="mt-4 p-4 border border-border rounded-lg bg-muted/50">
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Stream Quality</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Video Quality</label>
                      <select className="w-full mt-1 p-2 rounded border bg-background text-sm">
                        <option>High (720p)</option>
                        <option>Medium (480p)</option>
                        <option>Low (360p)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground">Audio Quality</label>
                      <select className="w-full mt-1 p-2 rounded border bg-background text-sm">
                        <option>High (48kHz)</option>
                        <option>Medium (22kHz)</option>
                        <option>Low (16kHz)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Noise Cancellation</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Auto-adjust Quality</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Connection Quality Indicator */}
      {streamState.isConnected && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {getConnectionIcon()}
            <span>Connection: {streamState.connectionQuality}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>AI: Connected</span>
          </div>

          <div className="flex items-center gap-1">
            {streamState.micEnabled ? (
              <Volume2 className="w-3 h-3 text-green-500" />
            ) : (
              <VolumeX className="w-3 h-3 text-muted-foreground" />
            )}
            <span>Audio: {streamState.micEnabled ? 'Active' : 'Muted'}</span>
          </div>
        </div>
      )}
    </div>
  );
};