import React, { useRef, useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StreamingAudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isListening,
  isSpeaking,
  audioLevel = 0,
  className = '',
  size = 'md'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [bars, setBars] = useState<number[]>(new Array(32).fill(0));

  const sizeClasses = {
    sm: 'w-32 h-16',
    md: 'w-48 h-24',
    lg: 'w-64 h-32'
  };

  // Audio visualization animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bars.length;
      const maxHeight = canvas.height - 10;

      bars.forEach((bar, index) => {
        const x = index * barWidth;
        const height = (bar / 100) * maxHeight;
        const y = canvas.height - height - 5;

        // Create gradient based on activity
        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        if (isSpeaking) {
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)'); // Green for AI speaking
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.3)');
        } else if (isListening) {
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // Blue for listening
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
        } else {
          gradient.addColorStop(0, 'rgba(156, 163, 175, 0.4)'); // Gray for inactive
          gradient.addColorStop(1, 'rgba(156, 163, 175, 0.1)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);

        // Add glow effect
        if (isListening || isSpeaking) {
          ctx.shadowColor = isSpeaking ? '#22c55e' : '#3b82f6';
          ctx.shadowBlur = 3;
          ctx.fillRect(x + 1, y, barWidth - 2, height);
          ctx.shadowBlur = 0;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bars, isListening, isSpeaking]);

  // Update bars based on audio activity
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
      // Fade to zero when inactive
      setBars(prev => prev.map(bar => Math.max(0, bar - 5)));
    }
  }, [isListening, isSpeaking, audioLevel]);

  return (
    <div className={`${className}`}>
      <Card className="p-4 holo-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full transition-all duration-300 ${
              isSpeaking 
                ? 'bg-green-500/20 text-green-400' 
                : isListening 
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-muted text-muted-foreground'
            }`}>
              {isSpeaking ? (
                <Volume2 className="w-4 h-4" />
              ) : isListening ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex flex-col">
              <Badge 
                variant="secondary" 
                className={`text-xs holo-border bg-transparent w-fit ${
                  isSpeaking 
                    ? 'text-green-400 border-green-500/30' 
                    : isListening 
                    ? 'text-blue-400 border-blue-500/30'
                    : 'text-muted-foreground border-muted/30'
                }`}
              >
                {isSpeaking ? 'AI Speaking' : isListening ? 'Listening' : 'Standby'}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">
                {isSpeaking ? 'Processing response...' : isListening ? 'Voice detection active' : 'Ready for input'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-mono tabular-nums">
              {Math.round(audioLevel)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Level
            </div>
          </div>
        </div>

        <div className={`relative ${sizeClasses[size]} mx-auto`}>
          <canvas
            ref={canvasRef}
            width={size === 'sm' ? 128 : size === 'md' ? 192 : 256}
            height={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
            className="w-full h-full rounded-xl"
          />
          
          {/* Enhanced overlay effects */}
          <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 ${
            isListening || isSpeaking 
              ? 'border-2 border-primary/30 holo-glow' 
              : 'border border-border/20'
          }`} />
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-background/20 via-transparent to-background/10 pointer-events-none" />
          
          {/* Activity indicator with enhanced design */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isSpeaking 
                ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' 
                : isListening 
                ? 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50'
                : 'bg-muted-foreground/50'
            }`} />
            {(isListening || isSpeaking) && (
              <div className="text-xs font-mono tabular-nums text-muted-foreground bg-background/80 px-1 py-0.5 rounded">
                {Math.round(audioLevel)}
              </div>
            )}
          </div>
          
          {/* Center frequency indicator */}
          {(isListening || isSpeaking) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-4 h-4 rounded-full border-2 animate-ping ${
                isSpeaking ? 'border-green-400/50' : 'border-blue-400/50'
              }`} />
            </div>
          )}
        </div>

        {/* Enhanced Frequency Display */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20Hz</span>
            <span className="font-medium">1kHz</span>
            <span>20kHz</span>
          </div>
          
          {/* Real-time stats */}
          {(isListening || isSpeaking) && (
            <div className="flex justify-between items-center text-xs">
              <div className={`flex items-center gap-1 ${
                isSpeaking ? 'text-green-400' : 'text-blue-400'
              }`}>
                <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                <span>Active</span>
              </div>
              <div className="text-muted-foreground">
                Quality: {audioLevel > 70 ? 'High' : audioLevel > 40 ? 'Medium' : 'Low'}
              </div>
              <div className="text-muted-foreground font-mono">
                {Math.round(audioLevel * 0.8 + 20)}dB
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Compact version for inline use
export const CompactAudioVisualizer: React.FC<{
  isActive: boolean;
  level?: number;
  className?: string;
}> = ({ isActive, level = 0, className = '' }) => {
  const [bars, setBars] = useState<number[]>(new Array(8).fill(0));

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.random() * level + 10));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setBars(new Array(8).fill(0));
    }
  }, [isActive, level]);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 bg-current transition-all duration-100 ${
            isActive ? 'opacity-100' : 'opacity-30'
          }`}
          style={{ 
            height: `${Math.max(2, height / 5)}px`,
            transition: 'height 0.1s ease-out'
          }}
        />
      ))}
    </div>
  );
};