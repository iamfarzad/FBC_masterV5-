import { useState, useRef, useCallback, useEffect } from 'react';
import { isApiConfigured } from '../../config/environment';

interface StreamingMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  type?: 'text' | 'audio' | 'partial';
  isComplete?: boolean;
}

interface StreamingState {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  currentMode: 'voice' | 'video' | 'screen' | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenShareEnabled: boolean;
}

interface UseGeminiStreamingProps {
  apiKey?: string;
  model?: string;
  onMessage?: (message: StreamingMessage) => void;
  onPartialTranscript?: (transcript: string) => void;
  onError?: (error: Error) => void;
}

export const useGeminiStreaming = ({
  apiKey,
  model = 'models/gemini-2.5-flash-exp-native-audio-thinking-dialog',
  onMessage,
  onPartialTranscript,
  onError
}: UseGeminiStreamingProps = {}) => {
  const [state, setState] = useState<StreamingState>({
    isConnected: false,
    isConnecting: false,
    isListening: false,
    isSpeaking: false,
    audioLevel: 0,
    connectionQuality: 'disconnected',
    currentMode: null,
    micEnabled: false,
    cameraEnabled: false,
    screenShareEnabled: false
  });

  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const sessionRef = useRef<any>(null);
  const responseQueueRef = useRef<any[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context for level monitoring
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Audio level monitoring
  const monitorAudioLevel = useCallback((stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const analyser = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateLevel = () => {
      if (!state.isConnected) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const level = (average / 128) * 100;
      
      setState(prev => ({ ...prev, audioLevel: level }));
      requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, [state.isConnected]);

  // Handle WebSocket messages
  const handleMessage = useCallback((message: any) => {
    responseQueueRef.current.push(message);
    
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent.modelTurn.parts[0];
      
      if (part?.text) {
        const newMessage: StreamingMessage = {
          id: Date.now().toString(),
          content: part.text,
          role: 'assistant',
          timestamp: new Date(),
          type: 'text',
          isComplete: message.serverContent.turnComplete
        };
        
        setMessages(prev => {
          const existing = prev.find(m => m.id === newMessage.id);
          if (existing) {
            return prev.map(m => m.id === newMessage.id ? newMessage : m);
          }
          return [...prev, newMessage];
        });
        
        onMessage?.(newMessage);
      }
      
      if (part?.inlineData) {
        // Handle audio data
        setState(prev => ({ ...prev, isSpeaking: true }));
        
        const audioMessage: StreamingMessage = {
          id: Date.now().toString(),
          content: 'Audio response received',
          role: 'assistant',
          timestamp: new Date(),
          type: 'audio',
          isComplete: true
        };
        
        setMessages(prev => [...prev, audioMessage]);
        onMessage?.(audioMessage);
      }
    }
    
    if (message.serverContent?.turnComplete) {
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [onMessage]);

  // Start streaming session with enhanced error handling
  const startStream = useCallback(async (mode: 'voice' | 'video' | 'screen') => {
    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      // Check if we're in a secure context first
      if (!window.isSecureContext) {
        throw new Error('Media access requires a secure context (HTTPS)');
      }

      // Check for media device support
      if (!navigator.mediaDevices) {
        throw new Error('Media devices not supported in this browser');
      }

      // Get user media based on mode
      let mediaConstraints: MediaStreamConstraints = {};
      
      switch (mode) {
        case 'voice':
          mediaConstraints = { 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          };
          break;
        case 'video':
          mediaConstraints = { 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            }
          };
          break;
        case 'screen':
          // Screen sharing requires different API
          if (!navigator.mediaDevices.getDisplayMedia) {
            throw new Error('Screen sharing not supported in this browser');
          }
          
          mediaStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
            video: {
              displaySurface: 'browser',
              selfBrowserSurface: 'exclude',
              systemAudio: 'exclude'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          break;
      }

      if (mode !== 'screen') {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      }

      if (mediaStreamRef.current) {
        // Add event listener for stream ended (user stopped screen share)
        mediaStreamRef.current.getVideoTracks().forEach(track => {
          track.addEventListener('ended', () => {
            console.log('Media stream ended by user');
            stopStream();
          });
        });

        monitorAudioLevel(mediaStreamRef.current);
      }

      // Initialize Gemini session (simulate for now)
      if (apiKey && isApiConfigured()) {
        // Real Gemini connection would go here
        console.log('Connecting with API key:', apiKey?.substring(0, 8) + '...');
      } else {
        console.log('Running in demo mode without API key');
      }
      
      await simulateGeminiConnection(mode);

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        currentMode: mode,
        connectionQuality: apiKey ? 'excellent' : 'good',
        micEnabled: true,
        cameraEnabled: mode === 'video',
        screenShareEnabled: mode === 'screen',
        isListening: mode === 'voice' || mode === 'video'
      }));

      // Start simulated transcription for voice modes
      if (mode === 'voice' || mode === 'video') {
        simulateTranscription();
      }

    } catch (error) {
      console.error('Stream start failed:', error);
      
      // Clean up any partial media streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        connectionQuality: 'disconnected'
      }));
      
      // Enhanced error handling
      const enhancedError = new Error();
      if (error instanceof Error) {
        enhancedError.name = error.name;
        enhancedError.message = error.message;
      } else {
        enhancedError.name = 'UnknownError';
        enhancedError.message = 'An unknown error occurred while starting the stream';
      }
      
      onError?.(enhancedError);
    }
  }, [apiKey, onError, monitorAudioLevel]);

  // Simulate transcription for demo purposes
  const simulateTranscription = useCallback(() => {
    if (!state.isListening || !onPartialTranscript) return;

    const sampleTranscripts = [
      "Hello, I'm interested in",
      "Hello, I'm interested in AI solutions for my business",
      "Hello, I'm interested in AI solutions for my business and would like to know more"
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (!state.isConnected || currentIndex >= sampleTranscripts.length) {
        clearInterval(interval);
        return;
      }

      onPartialTranscript(sampleTranscripts[currentIndex]);
      currentIndex++;
    }, 1000);

    // Clear after final transcript
    setTimeout(() => {
      clearInterval(interval);
      onPartialTranscript('');
    }, sampleTranscripts.length * 1000 + 500);
  }, [state.isListening, state.isConnected, onPartialTranscript]);

  // Simulate Gemini connection (replace with actual implementation)
  const simulateGeminiConnection = async (mode: string) => {
    // This would be replaced with actual Gemini Live API connection
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  // Stop streaming session
  const stopStream = useCallback(async () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      isListening: false,
      isSpeaking: false,
      audioLevel: 0,
      connectionQuality: 'disconnected',
      currentMode: null,
      micEnabled: false,
      cameraEnabled: false,
      screenShareEnabled: false
    });
  }, []);

  // Toggle microphone
  const toggleMic = useCallback(async () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setState(prev => ({ ...prev, micEnabled: !prev.micEnabled }));
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      
      setState(prev => ({ ...prev, cameraEnabled: !prev.cameraEnabled }));
    }
  }, []);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (state.currentMode === 'screen') {
      try {
        if (state.screenShareEnabled) {
          // Stop screen share
          mediaStreamRef.current?.getTracks().forEach(track => track.stop());
          setState(prev => ({ ...prev, screenShareEnabled: false }));
        } else {
          // Start screen share
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
          });
          mediaStreamRef.current = stream;
          setState(prev => ({ ...prev, screenShareEnabled: true }));
        }
      } catch (error) {
        onError?.(error as Error);
      }
    }
  }, [state.currentMode, state.screenShareEnabled, onError]);

  // Send text message
  const sendMessage = useCallback(async (content: string) => {
    if (!state.isConnected) return;

    const userMessage: StreamingMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      type: 'text',
      isComplete: true
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to Gemini (simulate for now)
    if (sessionRef.current) {
      // sessionRef.current.sendClientContent({ turns: [content] });
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: StreamingMessage = {
        id: (Date.now() + 1).toString(),
        content: `I understand you said: "${content}". How can I help you further?`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text',
        isComplete: true
      };
      
      setMessages(prev => [...prev, aiResponse]);
      onMessage?.(aiResponse);
    }, 1000);
  }, [state.isConnected, onMessage]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    state,
    messages,
    startStream,
    stopStream,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendMessage,
    clearMessages
  };
};