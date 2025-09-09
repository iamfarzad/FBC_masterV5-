"use client"

import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Mic, Settings } from 'lucide-react';

interface QuickActionsProps {
  voiceMode: boolean;
  onShowVoiceOverlay: () => void;
  onShowSettings: () => void;
}

export const QuickActions = React.memo<QuickActionsProps>(({ 
  voiceMode, 
  onShowVoiceOverlay, 
  onShowSettings 
}) => (
  <motion.div 
    className="p-3 border-b border-border/20"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1 }}
  >
    <motion.div 
      className="text-sm font-medium text-muted-foreground mb-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      Quick Actions
    </motion.div>
    <div className="grid grid-cols-2 gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowVoiceOverlay}
              className={`w-full h-8 rounded-xl glass-button transition-all duration-300 ${
                voiceMode 
                  ? 'bg-primary/15 text-primary shadow-md border-primary/20' 
                  : 'hover:bg-primary/5 border-border/50'
              }`}
            >
              <motion.div
                animate={voiceMode ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Mic className="w-3 h-3 mr-2" />
              </motion.div>
              Voice
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>Toggle Voice Mode</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowSettings}
              className="w-full h-8 rounded-xl glass-button hover:bg-primary/5 border-border/50"
            >
              <motion.div whileHover={{ rotate: 90 }}>
                <Settings className="w-3 h-3 mr-2" />
              </motion.div>
              Settings
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>Open Settings</TooltipContent>
      </Tooltip>
    </div>
  </motion.div>
));

QuickActions.displayName = 'QuickActions';