import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Monitor,
  MonitorOff,
  Square,
  Maximize2,
  Minimize2,
  X,
  Brain,
  Scan,
  BarChart3,
  FileText,
  Clock,
  Pause,
  Play,
  AlertCircle,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface ScreenShareInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  analysisMode?: 'workflow' | 'ui' | 'data' | 'security';
  hasOtherWidgets?: boolean;
}

interface ScreenState {
  isSharing: boolean;
  isAnalyzing: boolean;
  isPaused: boolean;
  confidence: number;
}

interface AIAnalysis {
  id: string;
  type: 'workflow' | 'ui' | 'data' | 'security' | 'optimization' | 'issue';
  title: string;
  description: string;
  confidence: number;
  businessImpact?: string;
  recommendation?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export const ScreenShareInterface: React.FC<ScreenShareInterfaceProps> = ({
  isOpen,
  onClose,
  onMinimize,
  isMinimized = false,
  analysisMode = "workflow",
  hasOtherWidgets = false
}) => {
  const [screenState, setScreenState] = useState<ScreenState>({
    isSharing: false,
    isAnalyzing: false,
    isPaused: false,
    confidence: 0
  });

  const [showControls, setShowControls] = useState(true);
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysis[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);

  const screenRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Session timer
  useEffect(() => {
    if (screenState.isSharing && !screenState.isPaused) {
      const interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [screenState.isSharing, screenState.isPaused]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimer = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isMinimized) setShowControls(false);
      }, 4000);
    };

    if (isOpen) {
      resetControlsTimer();
      const handleMouseMove = () => resetControlsTimer();
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [isOpen, isMinimized]);

  // AI Analysis simulation
  useEffect(() => {
    if (screenState.isSharing && screenState.isAnalyzing && !screenState.isPaused) {
      const workflowAnalyses: Omit<AIAnalysis, 'id' | 'timestamp'>[] = [
        {
          type: 'workflow',
          title: 'Inefficient Task Switching',
          description: 'User switching between 8+ applications repeatedly - productivity loss detected',
          confidence: 94,
          businessImpact: 'Estimated 25% time loss daily',
          recommendation: 'Implement unified dashboard or workflow automation',
          priority: 'high'
        },
        {
          type: 'optimization',
          title: 'Manual Data Entry Detected',
          description: 'Repetitive form filling observed across multiple systems',
          confidence: 89,
          businessImpact: 'Automation potential: 60% effort reduction',
          recommendation: 'Deploy AI-powered form auto-fill solution',
          priority: 'high'
        },
        {
          type: 'ui',
          title: 'Poor Interface Design',
          description: 'Complex navigation requiring multiple clicks for common tasks',
          confidence: 87,
          businessImpact: 'User experience friction increasing training time',
          recommendation: 'Redesign interface with AI-suggested improvements',
          priority: 'medium'
        },
        {
          type: 'data',
          title: 'Scattered Information Sources',
          description: 'Data being pulled from 5+ different systems manually',
          confidence: 92,
          businessImpact: 'Integration opportunity - real-time insights missing',
          recommendation: 'Implement centralized AI data aggregation',
          priority: 'critical'
        },
        {
          type: 'security',
          title: 'Sensitive Data Exposed',
          description: 'Confidential information visible in multiple unsecured applications',
          confidence: 78,
          businessImpact: 'Security risk - potential data breach',
          recommendation: 'Implement AI-powered data classification and protection',
          priority: 'critical'
        }
      ];

      const runAnalysis = () => {
        if (aiAnalyses.length < 8) {
          setScreenState(prev => ({ ...prev, isAnalyzing: true }));
          
          setTimeout(() => {
            const randomAnalysis = workflowAnalyses[Math.floor(Math.random() * workflowAnalyses.length)];
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
            
            setScreenState(prev => ({ 
              ...prev, 
              isAnalyzing: false,
              confidence: Math.min(96, prev.confidence + Math.random() * 8)
            }));
          }, 1500 + Math.random() * 2500);
        }
      };

      analysisIntervalRef.current = setInterval(runAnalysis, 6000);
      return () => {
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
      };
    }
  }, [screenState.isSharing, screenState.isAnalyzing, screenState.isPaused, aiAnalyses.length, analysisMode]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      streamRef.current = stream;
      setScreenState(prev => ({ 
        ...prev, 
        isSharing: true,
        isAnalyzing: true 
      }));
      
      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        setScreenState(prev => ({ 
          ...prev, 
          isSharing: false,
          isAnalyzing: false,
          confidence: 0
        }));
        setAiAnalyses([]);
      };
    } catch (error) {
      console.error('Screen share failed:', error);
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScreenState(prev => ({ 
      ...prev, 
      isSharing: false,
      isAnalyzing: false,
      confidence: 0
    }));
    setAiAnalyses([]);
  }, []);

  const toggleAnalysis = useCallback(() => {
    setScreenState(prev => ({ 
      ...prev, 
      isPaused: !prev.isPaused 
    }));
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnalysisIcon = (type: AIAnalysis['type']) => {
    switch (type) {
      case 'workflow': return <BarChart3 className="w-4 h-4" />;
      case 'ui': return <Monitor className="w-4 h-4" />;
      case 'data': return <FileText className="w-4 h-4" />;
      case 'security': return <AlertCircle className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'issue': return <AlertCircle className="w-4 h-4" />;
      default: return <Scan className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: AIAnalysis['priority']) => {
    switch (priority) {
      case 'critical': return '⚠️';
      case 'high': return '🔸';
      case 'medium': return '📊';
      case 'low': return '✓';
      default: return '•';
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
                <Monitor className="w-5 h-5" />
                <motion.div 
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${
                    screenState.isSharing ? 'bg-white' : 'bg-muted'
                  }`}
                  animate={screenState.isSharing ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="text-sm font-medium">Screen Analysis</div>
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
              <span>{screenState.isSharing ? 'Analyzing' : 'Ready'}</span>
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
      {/* Header Bar */}
      <motion.div 
        className={`absolute top-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="glass-surface border-0 rounded-none p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">AI Screen Analysis</div>
                  <div className="text-xs text-muted-foreground">
                    Workflow optimization mode
                  </div>
                </div>
              </div>
              
              <Badge variant="outline" className={`flex items-center gap-1 glass-button ${
                screenState.isSharing ? 'text-primary' : ''
              }`}>
                <motion.div 
                  className={`w-2 h-2 rounded-full ${
                    screenState.isSharing ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
                  animate={screenState.isSharing ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {screenState.isSharing ? 'Analyzing' : 'Ready'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(sessionDuration)}
              </div>
              
              {screenState.confidence > 0 && (
                <Badge variant="outline" className="glass-button">
                  {Math.round(screenState.confidence)}% accuracy
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
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative pt-16">
        {/* Screen Analysis Area */}
        <div className="flex-1 relative" ref={screenRef}>
          {screenState.isSharing ? (
            <div className="w-full h-full bg-muted/5 flex items-center justify-center relative">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-2xl glass-card mx-auto mb-6 flex items-center justify-center">
                  <Monitor className="w-16 h-16" />
                </div>
                <div className="text-xl font-medium mb-2">Screen Analysis Active</div>
                <div className="text-muted-foreground mb-4">
                  AI is analyzing your screen for optimization opportunities
                </div>
                
                {screenState.isAnalyzing && !screenState.isPaused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-4 h-4" />
                    </motion.div>
                    AI analyzing workflow patterns...
                  </motion.div>
                )}
                
                {screenState.isPaused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <Pause className="w-4 h-4" />
                    Analysis paused
                  </motion.div>
                )}
              </motion.div>
              
              {/* Analysis Overlay Indicators */}
              {aiAnalyses.length > 0 && screenState.isSharing && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="flex flex-wrap gap-2">
                    {aiAnalyses.slice(0, 4).map((analysis, index) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="glass-card rounded-lg px-3 py-2 flex items-center gap-2"
                      >
                        <span className="text-xs">{getPriorityIcon(analysis.priority)}</span>
                        <span className="text-xs font-medium">{analysis.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-muted/5 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-2xl glass-card mx-auto mb-6 flex items-center justify-center">
                  <MonitorOff className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="text-xl font-medium mb-2">Ready to Analyze</div>
                <div className="text-muted-foreground mb-6">
                  Share your screen to begin AI-powered workflow analysis
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={startScreenShare}
                    size="lg"
                    className="rounded-xl glass-button"
                  >
                    <Monitor className="w-5 h-5 mr-2" />
                    Start Screen Analysis
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>

        {/* AI Analysis Sidebar */}
        <AnimatePresence>
          {(aiAnalyses.length > 0 || screenState.isAnalyzing) && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="w-96 glass-surface border-l border-border rounded-none"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <div>
                    <div className="font-medium">AI Screen Analysis</div>
                    <div className="text-sm text-muted-foreground">
                      Real-time workflow insights
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-muted-foreground">
                    {aiAnalyses.length} issues detected
                  </div>
                  {screenState.isAnalyzing && !screenState.isPaused && (
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
                  {aiAnalyses
                    .sort((a, b) => {
                      const priority = { critical: 4, high: 3, medium: 2, low: 1 };
                      return priority[b.priority] - priority[a.priority];
                    })
                    .map((analysis, index) => (
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs">{getPriorityIcon(analysis.priority)}</span>
                            <div className="font-medium">{analysis.title}</div>
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed mb-2">
                            {analysis.description}
                          </div>
                          {analysis.businessImpact && (
                            <div className="text-xs text-muted-foreground mb-1">
                              📊 {analysis.businessImpact}
                            </div>
                          )}
                          {analysis.recommendation && (
                            <div className="text-xs text-muted-foreground">
                              💡 {analysis.recommendation}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs glass-button">
                            {analysis.confidence}% confidence
                          </Badge>
                          <Badge variant="outline" className="text-xs glass-button capitalize">
                            {analysis.priority}
                          </Badge>
                        </div>
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
                
                {aiAnalyses.length === 0 && !screenState.isAnalyzing && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <div className="text-sm">
                      AI analysis will begin once screen sharing starts
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <motion.div 
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="glass-surface border-0 rounded-none p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Screen Share Toggle */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={screenState.isSharing ? "destructive" : "default"}
                size="lg"
                onClick={screenState.isSharing ? stopScreenShare : startScreenShare}
                className="rounded-xl glass-button px-6"
              >
                {screenState.isSharing ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop Analysis
                  </>
                ) : (
                  <>
                    <Monitor className="w-5 h-5 mr-2" />
                    Share Screen
                  </>
                )}
              </Button>
            </motion.div>
            
            {/* Analysis Control */}
            {screenState.isSharing && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleAnalysis}
                  className="rounded-xl glass-button px-6"
                >
                  {screenState.isPaused ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume Analysis
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause Analysis
                    </>
                  )}
                </Button>
              </motion.div>
            )}
            
            {/* Analysis Mode */}
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
          
          {/* Status */}
          {screenState.isSharing && (
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI analysis active
              </div>
              
              {screenState.confidence > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {Math.round(screenState.confidence)}% accuracy
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {aiAnalyses.length} insights found
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};