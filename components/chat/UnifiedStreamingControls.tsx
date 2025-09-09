import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { 
  Mic, 
  MicOff, 
  Camera, 
  Video, 
  VideoOff, 
  Monitor, 
  ScreenShare, 
  ScreenShareOff,
  Activity,
  Wifi,
  WifiOff,
  Paperclip
} from 'lucide-react';
import { CompactAudioVisualizer } from './StreamingAudioVisualizer';

interface StreamingState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}

interface UnifiedStreamingControlsProps {
  activeInputMode: 'text' | 'voice' | 'video' | 'screen';
  streamingState: StreamingState;
  onModeChange: (mode: 'text' | 'voice' | 'video' | 'screen') => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export const UnifiedStreamingControls: React.FC<UnifiedStreamingControlsProps> = ({
  activeInputMode,
  streamingState,
  onModeChange,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onFileUpload,
  className = "",
  disabled = false
}) => {

  const handleModeClick = (mode: 'text' | 'voice' | 'video' | 'screen') => {
    if (disabled) return;
    onModeChange(mode);
  };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* File Upload */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <input
              type="file"
              id="unified-file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={onFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
              multiple
            />
            <Button
              variant="ghost"
              size="sm"
              className="modern-button size-10 rounded-full p-0 text-muted-foreground hover:text-primary hover:holo-glow transition-all duration-200"
              asChild
            >
              <label htmlFor="unified-file-upload" className="cursor-pointer flex items-center justify-center">
                <Paperclip className="size-5" />
              </label>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col items-center gap-1">
            <span>Upload files</span>
            <span className="text-xs text-muted-foreground">Images, PDFs, Documents</span>
            <kbd className="text-xs bg-muted px-1 py-0.5 rounded">⌘+U</kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Mode Toggle Buttons */}
      <div className="flex items-center gap-1 p-1 rounded-xl holo-card">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={disabled ? {} : { scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModeClick('voice')}
                disabled={disabled}
                className={`h-8 w-8 p-0 rounded-lg modern-button transition-all duration-300 relative ${
                  activeInputMode === 'voice' 
                    ? 'bg-blue-500/20 text-blue-400 holo-glow border border-blue-500/30' 
                    : disabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-blue-400 hover:holo-glow'
                }`}
              >
                <Mic className="size-4" />
                {streamingState.isConnected && activeInputMode === 'voice' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse border-2 border-background"></div>
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col items-center gap-1">
              <span>Voice Mode</span>
              <kbd className="text-xs bg-muted px-1 py-0.5 rounded">V</kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={disabled ? {} : { scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModeClick('video')}
                disabled={disabled}
                className={`h-8 w-8 p-0 rounded-lg modern-button transition-all duration-300 relative ${
                  activeInputMode === 'video' 
                    ? 'bg-green-500/20 text-green-400 holo-glow border border-green-500/30' 
                    : disabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-green-400 hover:holo-glow'
                }`}
              >
                <Camera className="size-4" />
                {streamingState.isConnected && activeInputMode === 'video' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-background"></div>
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>Video Mode</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={disabled ? {} : { scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleModeClick('screen')}
                disabled={disabled}
                className={`h-8 w-8 p-0 rounded-lg modern-button transition-all duration-300 relative ${
                  activeInputMode === 'screen' 
                    ? 'bg-purple-500/20 text-purple-400 holo-glow border border-purple-500/30' 
                    : disabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-purple-400 hover:holo-glow'
                }`}
              >
                <Monitor className="size-4" />
                {streamingState.isConnected && activeInputMode === 'screen' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse border-2 border-background"></div>
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>Screen Share</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

// Unified Status Bar Component
export const UnifiedStatusBar: React.FC<{
  activeInputMode: 'text' | 'voice' | 'video' | 'screen';
  streamingState: StreamingState;
  onEndSession: () => void;
}> = ({
  activeInputMode,
  streamingState,
  onEndSession
}) => {
  return (
    <AnimatePresence>
      {streamingState.isConnected && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="border-b border-border/30 bg-gradient-to-r from-card/80 to-muted/10 backdrop-blur-lg p-3"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-full holo-card ${
                streamingState.isConnected ? 'holo-glow' : ''
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  streamingState.isConnected 
                    ? streamingState.isListening 
                      ? 'bg-blue-400 animate-pulse' 
                      : streamingState.isSpeaking 
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-green-400'
                    : 'bg-muted-foreground'
                }`}></div>
                <Badge variant="outline" className="text-sm holo-border bg-transparent">
                  {activeInputMode === 'voice' && (
                    <>
                      <Mic className="w-3 h-3 mr-1" />
                      Voice Mode
                    </>
                  )}
                  {activeInputMode === 'video' && (
                    <>
                      <Camera className="w-3 h-3 mr-1" />
                      Video Mode
                    </>
                  )}
                  {activeInputMode === 'screen' && (
                    <>
                      <Monitor className="w-3 h-3 mr-1" />
                      Screen Share
                    </>
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {streamingState.isConnected 
                    ? streamingState.isListening 
                      ? 'Listening...' 
                      : streamingState.isSpeaking 
                      ? 'AI responding...'
                      : 'Connected'
                    : 'Ready'
                  }
                </span>
              </div>

              {streamingState.isConnected && (
                <div className="flex items-center gap-3">
                  <CompactAudioVisualizer 
                    isActive={streamingState.isListening || streamingState.isSpeaking} 
                    level={streamingState.audioLevel}
                    className={`${streamingState.isListening ? 'text-blue-400' : streamingState.isSpeaking ? 'text-green-400' : 'text-muted-foreground'}`}
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    {Math.round(streamingState.audioLevel)}dB
                  </span>
                </div>
              )}
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEndSession}
                className="h-8 px-3 rounded-lg modern-button text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                End Session
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Live Status Card Component
export const LiveStatusCard: React.FC<{
  activeInputMode: 'text' | 'voice' | 'video' | 'screen';
  streamingState: StreamingState;
}> = ({ activeInputMode, streamingState }) => {
  return (
    <AnimatePresence>
      {(streamingState.isConnected || activeInputMode !== 'text') && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="holo-card rounded-2xl p-6 backdrop-blur-xl border shadow-lg"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                streamingState.isConnected 
                  ? streamingState.isListening 
                    ? 'bg-blue-400 animate-pulse' 
                    : streamingState.isSpeaking 
                    ? 'bg-green-400 animate-pulse'
                    : 'bg-green-400'
                  : 'bg-muted-foreground'
              }`}></div>
              <Badge variant="outline" className="text-xs holo-border bg-transparent">
                {activeInputMode === 'voice' && '🎤 Voice'}
                {activeInputMode === 'video' && '📹 Video'}
                {activeInputMode === 'screen' && '🖥️ Screen'}
                {activeInputMode === 'text' && '💬 Text'}
              </Badge>
            </div>
            
            <div className="text-xs text-center text-muted-foreground">
              {streamingState.isConnected 
                ? streamingState.isListening 
                  ? 'Listening...' 
                  : streamingState.isSpeaking 
                  ? 'AI responding...'
                  : 'Connected'
                : 'Ready'
              }
            </div>

            {streamingState.isConnected && (
              <div className="flex flex-col items-center gap-2">
                <CompactAudioVisualizer 
                  isActive={streamingState.isListening || streamingState.isSpeaking} 
                  level={streamingState.audioLevel}
                  className={`${streamingState.isListening ? 'text-blue-400' : streamingState.isSpeaking ? 'text-green-400' : 'text-muted-foreground'}`}
                />
                <div className="text-xs font-mono text-muted-foreground">
                  {Math.round(streamingState.audioLevel)}dB
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};