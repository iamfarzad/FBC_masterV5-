"use client"

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ConversationStage } from './ai-elements/ai-system';

// Import modular components
import { StatusHeader } from './panels/StatusHeader';
import { TimeWeatherDisplay } from './panels/TimeWeatherDisplay';
import { QuickActions } from './panels/QuickActions';
import { BusinessActions } from './panels/BusinessActions';

interface SystemState {
  currentStage: ConversationStage;
  stageProgress: { current: number; total: number; percentage: number };
  capabilityUsage: { used: number; total: number };
  activeCapabilities: Array<{ id: string; name: string }>;
  allCapabilities: Array<{ id: string; name: string }>;
  allStages: ConversationStage[];
  intelligenceScore: number;
}

interface UnifiedControlPanelProps {
  voiceMode: boolean;
  leadScore: number;
  conversationStarted: boolean;
  currentStageIndex: number;
  exploredCount: number;
  totalCapabilities: number;
  systemState: SystemState;
  onGeneratePDF: () => void;
  onShowBooking: () => void;
  onShowSettings: () => void;
  onShowVoiceOverlay: () => void;
}

export const UnifiedControlPanel = React.memo<UnifiedControlPanelProps>(({ 
  voiceMode, 
  leadScore,
  conversationStarted, 
  currentStageIndex,
  exploredCount,
  totalCapabilities,
  systemState,
  onGeneratePDF, 
  onShowBooking, 
  onShowSettings, 
  onShowVoiceOverlay 
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
      className="fixed top-6 right-6 z-20"
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="glass-card rounded-2xl shadow-2xl overflow-hidden interactive-lift">
        {/* Collapsed State - Just Brand Badge */}
        {isCollapsed ? (
          <motion.div 
            className="p-2.5 cursor-pointer"
            onClick={toggleCollapsed}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <motion.div 
                className={`w-2 h-2 rounded-full ${voiceMode ? 'bg-primary animate-glow-pulse' : 'bg-green-500 animate-modern-pulse'}`}
                animate={{ 
                  scale: voiceMode ? [1, 1.3, 1] : [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-medium text-holographic">F.B/c</span>
            </div>
          </motion.div>
        ) : (
          <div className="min-w-72">
            {/* Status Header */}
            <StatusHeader
              voiceMode={voiceMode}
              isExpanded={isExpanded}
              onToggleExpanded={toggleExpanded}
              onMinimize={toggleCollapsed}
            />

            {/* Time & Weather Display */}
            <TimeWeatherDisplay />

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
                  <QuickActions
                    voiceMode={voiceMode}
                    onShowVoiceOverlay={onShowVoiceOverlay}
                    onShowSettings={onShowSettings}
                  />

                  {/* Business Actions */}
                  <BusinessActions
                    conversationStarted={conversationStarted}
                    onGeneratePDF={onGeneratePDF}
                    onShowBooking={onShowBooking}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Minimal border accent */}
        <div className="absolute inset-0 rounded-2xl border border-primary/5 pointer-events-none" />
      </div>
    </motion.div>
  );
});

UnifiedControlPanel.displayName = 'UnifiedControlPanel';