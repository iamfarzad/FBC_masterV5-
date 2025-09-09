import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Camera, 
  CameraOff, 
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Brain,
  Eye,
  Scan,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react';

interface WebcamInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  analysisMode?: 'business' | 'product' | 'document' | 'environment';
  hasOtherWidgets?: boolean;
  onCameraSwitch?: () => void;
}

interface CameraState {
  isActive: boolean;
  facingMode: 'user' | 'environment';
  isAnalyzing: boolean;
  confidence: number;
}

interface AIAnalysis {
  id: string;
  type: 'object' | 'text' | 'person' | 'business' | 'opportunity' | 'issue';
  title: string;
  description: string;
  confidence: number;
  businessValue?: string;
  action?: string;
  timestamp: Date;
}

export const WebcamInterface: React.FC<WebcamInterfaceProps> = ({
  isOpen,
  onClose,
  onMinimize,
  isMinimized = false,
  analysisMode = "business",
  hasOtherWidgets = false,
  onCameraSwitch
}) => {
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    facingMode: 'environment',
    isAnalyzing: false,
    confidence: 0
  });

  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysis[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Session timer
  useEffect(() => {
    if (cameraState.isActive) {
      const interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cameraState.isActive]);

  // AI Analysis simulation
  useEffect(() => {
    if (cameraState.isActive && cameraState.isAnalyzing) {
      const businessAnalyses: Omit<AIAnalysis, 'id' | 'timestamp'>[] = [
        {
          type: 'business',
          title: 'Team Collaboration Opportunity',
          description: 'Multiple people detected in collaborative workspace environment',
          confidence: 92,
          businessValue: 'Team productivity optimization potential',
          action: 'Analyze workflow patterns and communication effectiveness'
        },
        {
          type: 'object',
          title: 'Technology Infrastructure',
          description: 'Multiple screens and devices identified in workspace',
          confidence: 87,
          businessValue: 'Digital transformation assessment opportunity',
          action: 'Evaluate current tech stack and integration possibilities'
        },
        {
          type: 'opportunity',
          title: 'Process Optimization',
          description: 'Repetitive manual tasks observed in workspace',
          confidence: 84,
          businessValue: 'Automation potential identified',
          action: 'Recommend AI-powered workflow solutions'
        },
        {
          type: 'text',
          title: 'Document Analysis',
          description: 'Business documents and charts visible',
          confidence: 89,
          businessValue: 'Data insights and reporting optimization',
          action: 'Suggest intelligent document processing solutions'
        }
      ];

      const runAnalysis = () => {
        if (aiAnalyses.length < 6) {
          setCameraState(prev => ({ ...prev, isAnalyzing: true }));
          
          setTimeout(() => {
            const randomAnalysis = businessAnalyses[Math.floor(Math.random() * businessAnalyses.length)];
            const newAnalysis: AIAnalysis = {
              ...randomAnalysis,
              id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date()
            };
            
            setAiAnalyses(prev => {
              const exists = prev.some(a => a.title === newAnalysis.title);
              if (!exists) {
                return [...prev, newAnalysis];
              }
              return prev;
            });
            
            setCameraState(prev => ({ 
              ...prev, 
              isAnalyzing: false,
              confidence: Math.min(95, prev.confidence + Math.random() * 6)
            }));
          }, 2000 + Math.random() * 3000);
        }
      };

      analysisIntervalRef.current = setInterval(runAnalysis, 8000);
      return () => {
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
      };
    }
  }, [cameraState.isActive, cameraState.isAnalyzing, aiAnalyses.length]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraState.facingMode }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      setCameraState(prev => ({ 
        ...prev, 
        isActive: true,
        isAnalyzing: true 
      }));
    } catch (error) {
      console.error('Camera access failed:', error);
    }
  }, [cameraState.facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraState(prev => ({ 
      ...prev, 
      isActive: false,
      isAnalyzing: false,
      confidence: 0
    }));
    setAiAnalyses([]);
  }, []);

  const switchCamera = useCallback(async () => {
    if (cameraState.isActive) {
      const newFacingMode = cameraState.facingMode === 'user' ? 'environment' : 'user';
      
      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        streamRef.current = stream;
        setCameraState(prev => ({ 
          ...prev, 
          facingMode: newFacingMode
        }));
        
        if (onCameraSwitch) {
          onCameraSwitch();
        }
      } catch (error) {
        console.error('Camera switch failed:', error);
      }
    }
  }, [cameraState.isActive, cameraState.facingMode, onCameraSwitch]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnalysisIcon = (type: AIAnalysis['type']) => {
    switch (type) {
      case 'business': return <TrendingUp className="w-4 h-4" />;
      case 'object': return <Scan className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'person': return <Eye className="w-4 h-4" />;
      case 'opportunity': return <Target className="w-4 h-4" />;
      case 'issue': return <AlertCircle className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  // Minimized state
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-32 left-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
      >
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                <Camera className="w-5 h-5" />
                <motion.div 
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${
                    cameraState.isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                  animate={cameraState.isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="text-sm font-medium">AI Vision</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(sessionDuration)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className="w-8 h-8 p-0 glass-button"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 p-0 glass-button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="w-3 h-3" />
              <span>{cameraState.isActive ? 'Analyzing' : 'Ready'}</span>
            </div>
            <Badge variant="outline" className="glass-button">
              {aiAnalyses.length} insights
            </Badge>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="glass-surface p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-medium">AI Vision Analysis</div>
                <div className="text-xs text-muted-foreground">
                  Business intelligence mode
                </div>
              </div>
            </div>
            
            <Badge variant="outline" className={`flex items-center gap-1 glass-button ${
              cameraState.isActive ? 'text-primary' : ''
            }`}>
              <motion.div 
                className={`w-2 h-2 rounded-full ${
                  cameraState.isActive ? 'bg-primary' : 'bg-muted-foreground'
                }`}
                animate={cameraState.isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {cameraState.isActive ? 'Analyzing' : 'Ready'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDuration(sessionDuration)}
            </div>
            
            {cameraState.confidence > 0 && (
              <Badge variant="outline" className="glass-button">
                {Math.round(cameraState.confidence)}% accuracy
              </Badge>
            )}
            
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className="w-8 h-8 p-0 glass-button"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 p-0 glass-button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Camera View */}
        <div className="flex-1 relative bg-muted/5 flex items-center justify-center">
          {cameraState.isActive ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full h-full"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Analysis indicators */}
              {cameraState.isAnalyzing && (
                <div className="absolute top-4 left-4 right-4">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-lg p-3 flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-4 h-4" />
                    </motion.div>
                    <span className="text-sm">AI analyzing visual content...</span>
                  </motion.div>
                </div>
              )}
              
              {/* Recent insights overlay */}
              {aiAnalyses.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {aiAnalyses.slice(-3).map((analysis, index) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card rounded-lg px-3 py-2 flex items-center gap-2 whitespace-nowrap"
                      >
                        {getAnalysisIcon(analysis.type)}
                        <span className="text-xs font-medium">{analysis.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-32 h-32 rounded-2xl glass-card mx-auto mb-6 flex items-center justify-center">
                <CameraOff className="w-16 h-16 text-muted-foreground" />
              </div>
              <div className="text-xl font-medium mb-2">Ready for AI Vision</div>
              <div className="text-muted-foreground mb-6">
                Start camera to begin intelligent business analysis
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={startCamera}
                  size="lg"
                  className="rounded-xl glass-button"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Analysis Sidebar */}
        <AnimatePresence>
          {(aiAnalyses.length > 0 || cameraState.isAnalyzing) && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="w-96 glass-surface border-l border-border"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">AI Vision Insights</div>
                    <div className="text-sm text-muted-foreground">
                      Real-time analysis
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-muted-foreground">
                    {aiAnalyses.length} insights found
                  </div>
                  {cameraState.isAnalyzing && (
                    <motion.div
                      className="flex items-center gap-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Analyzing...
                    </motion.div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-modern p-6 space-y-4">
                <AnimatePresence>
                  {aiAnalyses.map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-4 rounded-xl"
                      whileHover={{ scale: 1.01, y: -2 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center flex-shrink-0">
                          {getAnalysisIcon(analysis.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium mb-1">{analysis.title}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed mb-2">
                            {analysis.description}
                          </div>
                          {analysis.businessValue && (
                            <div className="text-xs text-muted-foreground mb-1">
                              💼 {analysis.businessValue}
                            </div>
                          )}
                          {analysis.action && (
                            <div className="text-xs text-muted-foreground">
                              🎯 {analysis.action}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs glass-button">
                          {analysis.confidence}% confidence
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {analysis.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {aiAnalyses.length === 0 && !cameraState.isAnalyzing && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <div className="text-sm">
                      AI analysis will begin once camera starts
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="glass-surface border-t border-border p-6">
        <div className="flex items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={cameraState.isActive ? "destructive" : "default"}
              size="lg"
              onClick={cameraState.isActive ? stopCamera : startCamera}
              className="rounded-xl glass-button px-6"
            >
              {cameraState.isActive ? (
                <>
                  <CameraOff className="w-5 h-5 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </motion.div>
          
          {cameraState.isActive && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={switchCamera}
                className="rounded-xl glass-button px-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Switch Camera
              </Button>
            </motion.div>
          )}
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Mode:</span>
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-sm font-medium rounded-xl glass-button flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              <span className="capitalize">{analysisMode}</span>
            </Badge>
          </div>
        </div>
        
        {cameraState.isActive && (
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              AI vision active
            </div>
            
            {cameraState.confidence > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {Math.round(cameraState.confidence)}% accuracy
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {aiAnalyses.length} insights found
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};