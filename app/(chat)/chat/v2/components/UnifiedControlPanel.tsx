"use client"

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Calendar,
  FileText,
  Brain,
  TrendingUp,
  Mic,
  X,
  MoreHorizontal
} from 'lucide-react';

interface SystemState {
  currentStage: any;
  stageProgress: { current: number; total: number; percentage: number };
  capabilityUsage: { used: number; total: number };
  activeCapabilities: Array<{ id: string; name: string }>;
  allCapabilities: Array<{ id: string; name: string }>;
  allStages: any[];
  intelligenceScore: number;
}

interface UnifiedControlPanelProps {
  systemState: SystemState;
  conversationState: any;
  activeTools: string[];
  onToolSelect: (toolId: string) => void;
  onGeneratePDF: () => void;
  onShowSettings: () => void;
  onShowBooking: () => void;
  className?: string;
}

export const UnifiedControlPanel = React.memo<UnifiedControlPanelProps>(({
  systemState,
  conversationState,
  activeTools,
  onToolSelect,
  onGeneratePDF,
  onShowSettings,
  onShowBooking,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <motion.div 
      className={`fixed top-6 right-6 ${isExpanded ? 'z-[60]' : 'z-30'} ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Collapsed State */}
        {isCollapsed ? (
          <motion.div
            className="p-2.5 cursor-pointer"
            onClick={toggleCollapsed}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-medium text-text">F.B/c</span>
            </div>
          </motion.div>
        ) : (
          <div className="min-w-72 relative z-10">
            {/* Status Header */}
            <div className="p-3 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div>
                    <div className="font-medium text-text">F.B/c AI Assistant</div>
                    <div className="text-sm text-text-muted">Business Intelligence</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleExpanded}
                    className="w-7 h-7 p-0 rounded-lg hover:bg-surface-elevated"
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </motion.div>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapsed}
                    className="w-7 h-7 p-0 rounded-lg hover:bg-surface-elevated"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Display */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-surface-elevated flex items-center justify-center">
                  <Brain className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text">
                    Stage {systemState.stageProgress.current}/{systemState.stageProgress.total} • {systemState.intelligenceScore}% Complete
                  </div>
                  <div className="text-xs text-text-muted">
                    Capabilities: {systemState.capabilityUsage.used}/{systemState.capabilityUsage.total}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand to-brand-hover rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${systemState.intelligenceScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Expanded Actions */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* Quick Actions */}
                  <div className="p-3 border-b border-border/20">
                    <div className="text-sm font-medium text-text-muted mb-3">Quick Actions</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToolSelect('voice')}
                        className="w-full h-8 rounded-xl bg-surface-elevated hover:bg-brand/10"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Voice
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onShowSettings}
                        className="w-full h-8 rounded-xl bg-surface-elevated hover:bg-brand/10"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>

                  {/* Business Actions */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-3 h-3 text-brand" />
                      <span className="text-sm font-medium text-text-muted">Business Actions</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={onGeneratePDF}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 rounded-xl border-border hover:border-brand hover:bg-brand/10"
                      >
                        <FileText className="w-3 h-3 mr-2" />
                        Report
                      </Button>
                      
                      <Button
                        onClick={onShowBooking}
                        size="sm"
                        className="w-full h-8 rounded-xl bg-brand hover:bg-brand-hover text-surface"
                      >
                        <Calendar className="w-3 h-3 mr-2" />
                        Book Call
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
});

UnifiedControlPanel.displayName = 'UnifiedControlPanel';
