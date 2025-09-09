"use client"

import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Camera, 
  Monitor, 
  Upload, 
  Search, 
  GraduationCap, 
  X, 
  CheckCircle,
  Sparkles,
  Zap,
  Brain
} from 'lucide-react';

interface CanvasOverlayProps {
  activeTool: string | null;
  onClose: () => void;
}

export const CanvasOverlay = React.memo<CanvasOverlayProps>(({ activeTool, onClose }) => {
  const content = useMemo(() => {
    if (!activeTool) return null;

    const toolConfigs = {
      webcam: {
        title: 'AI Vision Analysis',
        description: 'Analyze real-world business environments through your device camera',
        icon: Camera,
        badge: 'Computer Vision',
        badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        features: [
          'Business environment analysis',
          'Real-time AI insights',
          'Process optimization suggestions',
          'Visual workflow mapping'
        ]
      },
      screen: {
        title: 'Screen Intelligence', 
        description: 'AI-powered analysis of your desktop workflows and processes',
        icon: Monitor,
        badge: 'Workflow AI',
        badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        features: [
          'Workflow analysis',
          'Process optimization',
          'Automation opportunities',
          'Efficiency recommendations'
        ]
      },
      docs: {
        title: 'Document Intelligence',
        description: 'Advanced AI analysis of business documents and content',
        icon: Upload,
        badge: 'Document AI',
        badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
        features: [
          'Smart document processing',
          'Content analysis',
          'Key insights extraction',
          'Strategic recommendations'
        ]
      },
      research: {
        title: 'Market Intelligence',
        description: 'AI-powered competitive analysis and market research',
        icon: Search,
        badge: 'Research AI',
        badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        features: [
          'Competitor analysis',
          'Market trend identification',
          'Strategic insights',
          'Growth opportunities'
        ]
      },
      workshop: {
        title: 'AI Strategy Academy',
        description: 'Executive-level AI education and strategic planning resources',
        icon: GraduationCap,
        badge: 'Executive AI',
        badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        features: [
          'Executive AI training',
          'Strategic planning',
          'Implementation roadmaps',
          'Best practices guide'
        ]
      }
    };

    return toolConfigs[activeTool as keyof typeof toolConfigs] || null;
  }, [activeTool]);

  useEffect(() => {
    if (activeTool) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeTool]);

  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tool-title"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl glass-card rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(255, 255, 255, 0.1)',
                    '0 0 0 8px rgba(255, 255, 255, 0.05)',
                    '0 0 0 0 rgba(255, 255, 255, 0.1)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <content.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 id="tool-title" className="font-medium text-holographic">
                    {content.title}
                  </h2>
                  <Badge variant="secondary" className={content.badgeColor}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {content.badge}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{content.description}</p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="rounded-xl glass-button"
                aria-label={`Close ${content.title}`}
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* AI Features Grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-holographic">AI Capabilities</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {content.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-4 rounded-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Status Section */}
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-holographic">AI System Status</div>
                    <div className="text-sm text-muted-foreground">All systems operational</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                    Ready
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="w-full rounded-xl glass-button"
                >
                  Maybe Later
                </Button>
              </motion.div>
              <motion.div 
                className="flex-1"
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="w-full rounded-xl glass-button bg-primary/15 hover:bg-primary/25 text-primary interactive-glow border-primary/20"
                  aria-label={`Start ${content.title}`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Launch {content.badge}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

CanvasOverlay.displayName = 'CanvasOverlay';