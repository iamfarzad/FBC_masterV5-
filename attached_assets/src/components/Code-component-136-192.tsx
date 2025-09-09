import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff,
  Camera,
  Monitor,
  X,
  Maximize2,
  Brain,
  Eye,
  BarChart3,
  RotateCcw
} from 'lucide-react';

interface MultimodalWidget {
  id: string;
  type: 'voice' | 'webcam' | 'screen';
  title: string;
  status: string;
  isActive: boolean;
  data?: {
    // Voice specific
    isRecording?: boolean;
    aiState?: 'idle' | 'thinking' | 'speaking' | 'browsing' | 'analyzing';
    // Camera specific
    facingMode?: 'user' | 'environment';
    insightCount?: number;
    confidence?: number;
    // Screen specific
    analysisProgress?: number;
  };
}

interface UnifiedMultimodalWidgetProps {
  widgets: MultimodalWidget[];
  onWidgetExpand: (widgetId: string) => void;
  onWidgetClose: (widgetId: string) => void;
  onCameraSwitch?: () => void;
  isVisible: boolean;
}

export const UnifiedMultimodalWidget: React.FC<UnifiedMultimodalWidgetProps> = ({
  widgets,
  onWidgetExpand,
  onWidgetClose,
  onCameraSwitch,
  isVisible
}) => {
  if (!isVisible || widgets.length === 0) return null;

  const getWidgetIcon = (type: string, data?: any) => {
    switch (type) {
      case 'voice':
        return data?.isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />;
      case 'webcam':
        return <Camera className="w-4 h-4" />;
      case 'screen':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getStatusColor = (type: string, data?: any) => {
    switch (type) {
      case 'voice':
        if (data?.isRecording) return 'text-red-500';
        if (data?.aiState === 'thinking') return 'text-blue-500';
        if (data?.aiState === 'speaking') return 'text-green-500';
        return 'text-muted-foreground';
      case 'webcam':
        return data?.confidence > 0 ? 'text-green-500' : 'text-primary';
      case 'screen':
        return data?.analysisProgress > 0 ? 'text-blue-500' : 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  // Single widget layout
  if (widgets.length === 1) {
    const widget = widgets[0];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="glass-card rounded-2xl p-4 shadow-2xl effect-noise min-w-80 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-2.5 h-2.5 rounded-full ${
                  widget.isActive ? 'bg-green-500' : 'bg-gray-500'
                }`}
                animate={widget.isActive ? { 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-sm font-medium text-holographic">{widget.title}</span>
              <Badge variant="outline" className="text-xs max-w-32 truncate">
                {widget.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {widget.type === 'webcam' && widget.isActive && onCameraSwitch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCameraSwitch}
                  className="w-6 h-6 p-0 rounded-lg hover:bg-primary/10"
                  title="Switch Camera"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onWidgetExpand(widget.id)}
                className="w-6 h-6 p-0 rounded-lg hover:bg-primary/10"
                aria-label="Expand"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onWidgetClose(widget.id)}
                className="w-6 h-6 p-0 rounded-lg hover:bg-primary/10"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Widget specific content */}
          <div className="flex items-center gap-3">
            <motion.div 
              className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ${
                getStatusColor(widget.type, widget.data)
              }`}
              animate={widget.isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getWidgetIcon(widget.type, widget.data)}
            </motion.div>
            
            <div className="flex-1">
              {widget.type === 'voice' && widget.data?.aiState && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 12 }, (_, i) => {
                    const height = widget.data?.isRecording 
                      ? 4 + Math.sin((Date.now() / 100) + (i * 0.5)) * 8
                      : widget.data?.aiState === 'speaking'
                      ? 4 + Math.sin((Date.now() / 80) + (i * 0.4)) * 6
                      : 4;
                    
                    return (
                      <motion.div
                        key={i}
                        className="w-0.5 rounded-full bg-current"
                        style={{ 
                          height: `${Math.max(2, height)}px`,
                          color: widget.data?.isRecording ? '#ef4444' : 
                                 widget.data?.aiState === 'speaking' ? '#10b981' : '#6b7280'
                        }}
                        animate={{ scaleY: widget.data?.isRecording ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                      />
                    );
                  })}
                </div>
              )}
              
              {widget.type === 'webcam' && (
                <div className="text-xs text-muted-foreground">
                  {widget.data?.insightCount || 0} insights • {widget.data?.facingMode === 'user' ? 'Front' : 'Back'} camera
                  {widget.data?.confidence && (
                    <span className="text-green-500 ml-2">• {Math.round(widget.data.confidence)}% accuracy</span>
                  )}
                </div>
              )}
              
              {widget.type === 'screen' && (
                <div className="text-xs text-muted-foreground">
                  Analysis: {widget.data?.analysisProgress || 0}% complete
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Multiple widgets layout - compact horizontal
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
    >
      <div className="glass-card rounded-2xl p-3 shadow-2xl effect-noise">
        <div className="flex items-center gap-3">
          {widgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass-surface hover:bg-primary/5 transition-colors group"
            >
              <motion.div 
                className={`w-1.5 h-1.5 rounded-full ${
                  widget.isActive ? 'bg-green-500' : 'bg-gray-500'
                }`}
                animate={widget.isActive ? { 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <motion.div 
                className={`w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center ${
                  getStatusColor(widget.type, widget.data)
                }`}
                animate={widget.isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getWidgetIcon(widget.type, widget.data)}
              </motion.div>
              
              <div className="text-sm font-medium text-holographic min-w-0 max-w-32">
                <div className="truncate">{widget.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {widget.status}
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {widget.type === 'webcam' && widget.isActive && onCameraSwitch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCameraSwitch}
                    className="w-5 h-5 p-0 rounded hover:bg-primary/20"
                    title="Switch Camera"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onWidgetExpand(widget.id)}
                  className="w-5 h-5 p-0 rounded hover:bg-primary/20"
                  aria-label="Expand"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onWidgetClose(widget.id)}
                  className="w-5 h-5 p-0 rounded hover:bg-primary/20"
                  aria-label="Close"
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Multimodal indicator */}
        <div className="text-xs text-muted-foreground text-center mt-2 border-t border-border/20 pt-2">
          <div className="flex items-center justify-center gap-1">
            <Brain className="w-3 h-3" />
            Multimodal AI System Active
          </div>
        </div>
      </div>
    </motion.div>
  );
};