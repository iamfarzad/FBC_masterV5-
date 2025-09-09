import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  X,
  Settings
} from 'lucide-react';

interface SpeechState {
  isRecording: boolean;
  isListening: boolean;
  aiState: 'idle' | 'thinking' | 'speaking' | 'browsing' | 'analyzing';
  audioEnabled: boolean;
  audioLevel?: number;
  transcript?: string;
  aiResponse?: string;
  error?: string;
}

interface SpeechToSpeechPopoverProps {
  onSpeechInput?: (text: string) => void;
  onAudioToggle?: (enabled: boolean) => void;
  onTranscriptComplete?: (transcript: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  audioEnabled?: boolean;
  assistantName?: string;
  isMinimized?: boolean;
}

// Animated Soundwave Visualizer
const SoundwaveVisualizer: React.FC<{ 
  isRecording: boolean;
  audioLevel?: number;
  aiState: SpeechState['aiState'];
}> = ({ isRecording, audioLevel = 0.3, aiState }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate more bars for a fuller soundwave effect
  const barCount = 25;
  const centerIndex = Math.floor(barCount / 2);

  const getBars = () => {
    return Array.from({ length: barCount }, (_, i) => {
      const distance = Math.abs(i - centerIndex);
      const normalizedDistance = distance / centerIndex;
      
      let baseHeight = 8;
      let animatedHeight = 0;
      
      if (isRecording) {
        // Recording - reactive to audio level
        const audioReactivity = audioLevel * 40;
        const wavePattern = Math.sin((time / 150) + (i * 0.3)) * 15;
        const proximityMultiplier = 1 - (normalizedDistance * 0.7);
        animatedHeight = baseHeight + (audioReactivity + wavePattern) * proximityMultiplier;
      } else if (aiState === 'thinking') {
        // Thinking - pulsing pattern
        const pulsePattern = Math.sin((time / 200) + (i * 0.2)) * 12;
        animatedHeight = baseHeight + pulsePattern * (1 - normalizedDistance * 0.5);
      } else if (aiState === 'speaking') {
        // Speaking - wave pattern
        const wavePattern = Math.sin((time / 120) + (i * 0.4)) * 18;
        animatedHeight = baseHeight + wavePattern * (1 - normalizedDistance * 0.3);
      } else {
        // Idle - gentle wave
        const gentleWave = Math.sin((time / 800) + (i * 0.1)) * 4;
        animatedHeight = baseHeight + gentleWave * (1 - normalizedDistance * 0.8);
      }

      return Math.max(2, animatedHeight);
    });
  };

  const getBarColor = () => {
    if (isRecording) return '#ef4444'; // Red for recording
    if (aiState === 'thinking') return '#3b82f6'; // Blue for thinking
    if (aiState === 'speaking') return '#10b981'; // Green for speaking
    return '#6b7280'; // Gray for idle
  };

  const getGlowColor = () => {
    if (isRecording) return 'rgba(239, 68, 68, 0.4)';
    if (aiState === 'thinking') return 'rgba(59, 130, 246, 0.4)';
    if (aiState === 'speaking') return 'rgba(16, 185, 129, 0.4)';
    return 'rgba(107, 114, 128, 0.2)';
  };

  const bars = getBars();
  const barColor = getBarColor();
  const glowColor = getGlowColor();

  return (
    <div className="flex items-center justify-center gap-1 h-20">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full transition-all duration-100"
          style={{
            height: `${height}px`,
            backgroundColor: barColor,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
          animate={{
            scaleY: isRecording ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.02,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export const SpeechToSpeechPopover: React.FC<SpeechToSpeechPopoverProps> = ({
  onSpeechInput,
  onAudioToggle,
  onTranscriptComplete,
  isOpen = false,
  onClose,
  onMinimize,
  audioEnabled = true,
  assistantName = "AI Assistant",
  isMinimized = false
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>({
    isRecording: false,
    isListening: false,
    aiState: 'idle',
    audioEnabled: audioEnabled
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  // Audio level monitoring
  const monitorAudioLevel = (stream: MediaStream) => {
    if (!audioContextRef.current) return;
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyser) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const level = average / 255;
      
      setSpeechState(prev => ({ ...prev, audioLevel: level }));
      
      if (speechState.isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  // Start voice recording
  const startVoiceRecording = async () => {
    // Clear any previous errors
    setSpeechState(prev => ({ ...prev, error: undefined }));

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      monitorAudioLevel(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorder.start();
      setSpeechState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isListening: true,
        aiState: 'idle',
        error: undefined
      }));

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopVoiceRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      let errorMessage = 'Unable to access microphone';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings and try again.';
            break;
          case 'NotFoundError':
            errorMessage = 'No microphone found. Please connect a microphone and try again.';
            break;
          case 'NotSupportedError':
            errorMessage = 'Microphone not supported in this browser.';
            break;
          case 'NotReadableError':
            errorMessage = 'Microphone is already in use by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Microphone constraints cannot be satisfied.';
            break;
          default:
            errorMessage = error.message || 'Unknown microphone error';
        }
      }
      
      setSpeechState(prev => ({ ...prev, error: errorMessage }));
      
      // Try fallback to Web Speech API only if it's not a permission error
      if (error.name !== 'NotAllowedError') {
        setTimeout(() => {
          startWebSpeechRecording();
        }, 1000);
      }
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setSpeechState(prev => ({ 
      ...prev, 
      isRecording: false, 
      isListening: false, 
      audioLevel: 0 
    }));
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Fallback to Web Speech API
  const startWebSpeechRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechState(prev => ({ 
        ...prev, 
        error: 'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.'
      }));
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setSpeechState(prev => ({ 
          ...prev, 
          isRecording: true, 
          isListening: true,
          error: undefined
        }));
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isListening: false,
          transcript,
          error: undefined
        }));
        if (onSpeechInput) {
          onSpeechInput(transcript);
        }
        if (onTranscriptComplete) {
          onTranscriptComplete(transcript);
        }
        simulateAIProcessing(transcript);
      };

      recognition.onerror = (event: any) => {
        let errorMessage = 'Speech recognition failed';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking more clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone.';
            break;
          case 'network':
            errorMessage = 'Network error during speech recognition. Please check your connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
          case 'bad-grammar':
            errorMessage = 'Speech recognition grammar error.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported for speech recognition.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        setSpeechState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isListening: false,
          error: errorMessage
        }));
      };

      recognition.onend = () => {
        setSpeechState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isListening: false 
        }));
      };

      recognition.start();
    } catch (error) {
      console.error('Web Speech API error:', error);
      setSpeechState(prev => ({ 
        ...prev, 
        error: 'Failed to start speech recognition. Please try again.'
      }));
    }
  };

  // Process voice input
  const processVoiceInput = async (audioBlob: Blob) => {
    setSpeechState(prev => ({ ...prev, isListening: false }));
    
    // Simulate speech-to-text processing
    setTimeout(() => {
      const mockTranscript = "I'm interested in learning about your AI solutions for my business";
      setSpeechState(prev => ({ ...prev, transcript: mockTranscript }));
      if (onSpeechInput) {
        onSpeechInput(mockTranscript);
      }
      if (onTranscriptComplete) {
        onTranscriptComplete(mockTranscript);
      }
      simulateAIProcessing(mockTranscript);
    }, 1000);
  };

  // Simulate AI processing and response
  const simulateAIProcessing = async (input: string) => {
    // Thinking phase
    setSpeechState(prev => ({ ...prev, aiState: 'thinking' }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Analyzing phase
    setSpeechState(prev => ({ ...prev, aiState: 'analyzing' }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate response
    const responses = [
      "That's great! I'd be happy to help you explore AI solutions for your business. Based on your needs, I can recommend several approaches that could significantly improve your operations and efficiency.",
      "Excellent question! AI can transform businesses in many ways. Let me walk you through some specific solutions that might be perfect for your industry and current challenges.",
      "I understand you're interested in AI solutions. There are several powerful options we could explore together, from automation tools to advanced analytics systems."
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    setSpeechState(prev => ({ ...prev, aiResponse: response }));
    
    // Speaking phase
    if (speechState.audioEnabled) {
      speakResponse(response);
    } else {
      setSpeechState(prev => ({ ...prev, aiState: 'idle' }));
    }
  };

  // Text-to-Speech
  const speakResponse = (text: string) => {
    if (!synthRef.current || !speechState.audioEnabled) return;

    if (currentUtteranceRef.current) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Neural') || 
      voice.name.includes('Premium') ||
      (voice.lang === 'en-US' && voice.name.includes('Female'))
    ) || voices.find(voice => voice.lang === 'en-US') || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setSpeechState(prev => ({ ...prev, aiState: 'speaking' }));
    };

    utterance.onend = () => {
      setSpeechState(prev => ({ ...prev, aiState: 'idle' }));
    };

    utterance.onerror = () => {
      setSpeechState(prev => ({ ...prev, aiState: 'idle' }));
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeechState(prev => ({ ...prev, aiState: 'idle' }));
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    const newAudioEnabled = !speechState.audioEnabled;
    setSpeechState(prev => ({ ...prev, audioEnabled: newAudioEnabled }));
    if (onAudioToggle) {
      onAudioToggle(newAudioEnabled);
    }
    if (speechState.aiState === 'speaking') {
      stopSpeaking();
    }
  };

  const getStatusText = () => {
    if (speechState.error) return "Connection Error";
    if (speechState.isRecording) return "Listening...";
    if (speechState.aiState === 'thinking') return "Processing...";
    if (speechState.aiState === 'speaking') return "Speaking...";
    return "System Ready";
  };

  const getInstructionText = () => {
    if (speechState.error) return "Check microphone permissions";
    if (speechState.isRecording) return "Speak clearly into your microphone";
    if (speechState.aiState === 'thinking') return "Processing your request";
    if (speechState.aiState === 'speaking') return "AI is responding";
    return "Click the microphone to start speaking";
  };

  if (!isOpen) return null;

  // Minimized state - compact version for chat input integration
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="glass-card rounded-2xl p-4 shadow-2xl effect-noise min-w-80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-2.5 h-2.5 rounded-full ${
                  speechState.isRecording ? 'bg-red-500' : 
                  speechState.aiState === 'thinking' ? 'bg-blue-500' :
                  speechState.aiState === 'speaking' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}
                animate={speechState.isRecording || speechState.aiState !== 'idle' ? { 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-sm font-medium text-holographic">Voice AI</span>
              <Badge variant="outline" className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMinimize && onMinimize()}
                className="w-6 h-6 p-0 rounded-lg hover:bg-primary/10"
                aria-label="Expand voice assistant"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-6 h-6 p-0 rounded-lg hover:bg-primary/10"
                aria-label="Close voice assistant"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Compact visualizer */}
          <div className="flex justify-center mb-3">
            <div className="flex items-center gap-0.5 h-8">
              {Array.from({ length: 12 }, (_, i) => {
                const height = speechState.isRecording 
                  ? 4 + Math.sin((Date.now() / 100) + (i * 0.5)) * 8
                  : speechState.aiState === 'speaking'
                  ? 4 + Math.sin((Date.now() / 80) + (i * 0.4)) * 6
                  : 4;
                
                return (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full bg-current"
                    style={{ 
                      height: `${Math.max(2, height)}px`,
                      color: speechState.isRecording ? '#ef4444' : 
                             speechState.aiState === 'speaking' ? '#10b981' : '#6b7280'
                    }}
                    animate={{ scaleY: speechState.isRecording ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Compact controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={speechState.isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={speechState.aiState === 'speaking'}
              size="sm"
              className={`w-10 h-10 rounded-full transition-all ${
                speechState.isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              aria-label={speechState.isRecording ? 'Stop recording' : 'Start recording'}
            >
              {speechState.isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
              className={`w-8 h-8 rounded-full ${
                speechState.audioEnabled 
                  ? 'text-green-600 border-green-200' 
                  : 'text-muted-foreground'
              }`}
            >
              {speechState.audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            </Button>
          </div>
          
          {speechState.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <div className="text-xs text-destructive">{speechState.error}</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-assistant-title"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-background/95 backdrop-blur-xl rounded-3xl border border-border shadow-2xl overflow-hidden modern-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-3 h-3 rounded-full ${
                  speechState.isRecording ? 'bg-red-500' : 
                  speechState.aiState === 'thinking' ? 'bg-blue-500' :
                  speechState.aiState === 'speaking' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}
                animate={speechState.isRecording || speechState.aiState !== 'idle' ? { 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div>
                <h2 id="voice-assistant-title" className="text-lg font-medium text-holographic">
                  {assistantName}
                </h2>
                <motion.div 
                  className="text-sm text-muted-foreground"
                  animate={speechState.isRecording ? { opacity: [1, 0.7, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {getStatusText()}
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className="w-8 h-8 p-0 rounded-lg hover:bg-primary/10"
                  aria-label="Minimize voice assistant"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0 rounded-lg hover:bg-primary/10"
                aria-label="Close voice assistant"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Scanning line accent */}
          <div className="absolute inset-0 rounded-t-3xl overflow-hidden pointer-events-none">
            <motion.div 
              className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Soundwave Visualizer */}
          <div className="flex justify-center mb-8">
            <SoundwaveVisualizer
              isRecording={speechState.isRecording}
              audioLevel={speechState.audioLevel}
              aiState={speechState.aiState}
            />
          </div>

          {/* Transcript Display */}
          <AnimatePresence>
            {speechState.transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-2xl bg-muted/20 border border-border/30"
              >
                <div className="text-xs font-medium text-muted-foreground mb-2">You said:</div>
                <div className="text-sm leading-relaxed">{speechState.transcript}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Response Display */}
          <AnimatePresence>
            {speechState.aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20"
              >
                <div className="text-xs font-medium text-primary/70 mb-2">{assistantName}:</div>
                <div className="text-sm leading-relaxed">{speechState.aiResponse}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {speechState.error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-2xl bg-destructive/5 border border-destructive/20"
              >
                <div className="text-xs font-medium text-destructive/70 mb-2">Connection Error:</div>
                <div className="text-sm text-destructive/80 leading-relaxed mb-3">{speechState.error}</div>
                {speechState.error.includes('denied') || speechState.error.includes('access') ? (
                  <div className="text-xs text-destructive/60 p-3 bg-destructive/10 rounded-lg">
                    <strong>💡 How to fix:</strong> Click the microphone icon in your browser's address bar and allow microphone access.
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Main Microphone Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={speechState.isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={speechState.aiState === 'speaking'}
                className={`w-16 h-16 rounded-full transition-all interactive-glow ${
                  speechState.isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : speechState.error
                    ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30'
                }`}
                aria-label={speechState.isRecording ? 'Stop recording' : 'Start recording'}
              >
                <motion.div
                  animate={speechState.isRecording ? { 
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  {speechState.isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </motion.div>
              </Button>
            </motion.div>

            {/* Audio Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  speechState.audioEnabled 
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400' 
                    : 'border-muted-foreground/30 text-muted-foreground hover:bg-muted/50'
                }`}
                aria-label={speechState.audioEnabled ? 'Disable audio' : 'Enable audio'}
              >
                {speechState.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </motion.div>
          </div>

          {/* Instructions */}
          <motion.div 
            className="text-center text-sm text-muted-foreground"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {getInstructionText()}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};