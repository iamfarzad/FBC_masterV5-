"use client"

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Settings, Calendar, FileText, Mic } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface MinimalControlWidgetProps {
  voiceMode: boolean;
  conversationStarted: boolean;
  onGeneratePDF: () => void;
  onShowBooking: () => void;
  onShowSettings: () => void;
  onShowVoiceOverlay: () => void;
}

export const MinimalControlWidget = React.memo<MinimalControlWidgetProps>(({ 
  voiceMode, 
  conversationStarted,
  onGeneratePDF, 
  onShowBooking, 
  onShowSettings, 
  onShowVoiceOverlay 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      className="fixed top-6 right-6 z-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Compact Header */}
        <div className="p-3">
          <div className="flex items-center gap-3">
            <motion.div 
              className={`w-2.5 h-2.5 rounded-full ${
                voiceMode ? 'bg-primary animate-glow-pulse' : 'bg-green-500 animate-modern-pulse'
              }`}
              animate={{ 
                scale: voiceMode ? [1, 1.2, 1] : [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div>
              <div className="font-medium text-holographic">AI Assistant</div>
              <div className="text-muted-foreground text-sm">
                {voiceMode ? 'Voice Active' : 'Ready'}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 p-0 rounded-lg"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Expanded Actions */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/20 p-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowVoiceOverlay}
                    className={`h-8 rounded-lg ${
                      voiceMode ? 'bg-primary/15 text-primary' : ''
                    }`}
                  >
                    <Mic className="w-3 h-3 mr-1" />
                    Voice
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Voice Mode</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowSettings}
                    className="h-8 rounded-lg"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Settings
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open Settings</TooltipContent>
              </Tooltip>

              {conversationStarted && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onGeneratePDF}
                        className="h-8 rounded-lg"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Report
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate Report</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onShowBooking}
                        size="sm"
                        className="h-8 rounded-lg bg-primary/15 text-primary"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Book
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Schedule Call</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

MinimalControlWidget.displayName = 'MinimalControlWidget';