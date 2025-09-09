import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface AdvancedVoiceVisualizerProps {
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  aiPersonality: 'analytical' | 'creative' | 'focused';
  className?: string;
}

export const AdvancedVoiceVisualizer: React.FC<AdvancedVoiceVisualizerProps> = ({
  audioLevel,
  isListening,
  isSpeaking,
  aiPersonality,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const personalityConfigs = {
    analytical: {
      color: '#ffffff',
      pattern: 'waveform',
      frequency: 0.02,
      amplitude: 0.8
    },
    creative: {
      color: '#ffffff',
      pattern: 'spiral',
      frequency: 0.05,
      amplitude: 1.2
    },
    focused: {
      color: '#ffffff',
      pattern: 'bars',
      frequency: 0.03,
      amplitude: 1.0
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = personalityConfigs[aiPersonality];
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      
      // Set glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = config.color;
      
      if (config.pattern === 'waveform') {
        // Waveform pattern
        ctx.beginPath();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 2;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const wave = Math.sin(angle * 4 + time) * audioLevel * config.amplitude;
          const x = centerX + Math.cos(angle) * (radius + wave * 20);
          const y = centerY + Math.sin(angle) * (radius + wave * 20);
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      } else if (config.pattern === 'spiral') {
        // Spiral pattern
        ctx.beginPath();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 1.5;
        
        for (let i = 0; i < 500; i++) {
          const angle = i * 0.1;
          const spiralRadius = (i / 500) * radius;
          const wave = Math.sin(angle * 2 + time) * audioLevel * config.amplitude;
          const x = centerX + Math.cos(angle) * (spiralRadius + wave * 10);
          const y = centerY + Math.sin(angle) * (spiralRadius + wave * 10);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else if (config.pattern === 'bars') {
        // Bar pattern
        const bars = 32;
        const barWidth = (Math.PI * 2) / bars;
        
        for (let i = 0; i < bars; i++) {
          const angle = i * barWidth;
          const barHeight = Math.sin(time + i * 0.3) * audioLevel * config.amplitude * 40;
          
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          
          ctx.fillStyle = config.color;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(-1, -radius, 2, barHeight);
          
          ctx.restore();
        }
      }
      
      time += config.frequency;
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
  }, [audioLevel, isListening, isSpeaking, aiPersonality]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="absolute inset-0"
      />
      
      {/* Status Indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: isListening || isSpeaking ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isListening || isSpeaking ? Infinity : 0,
        }}
      >
        <div className={`w-8 h-8 rounded-full ${
          isListening 
            ? 'bg-blue-500/20 border-2 border-blue-400' 
            : isSpeaking 
            ? 'bg-green-500/20 border-2 border-green-400'
            : 'bg-white/10 border-2 border-white/30'
        } flex items-center justify-center backdrop-blur-sm`}>
          <div className={`w-2 h-2 rounded-full ${
            isListening 
              ? 'bg-blue-400 animate-pulse' 
              : isSpeaking 
              ? 'bg-green-400 animate-pulse'
              : 'bg-white/50'
          }`} />
        </div>
      </motion.div>
    </div>
  );
};