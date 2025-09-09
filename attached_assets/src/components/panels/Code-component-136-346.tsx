"use client"

import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface StatusHeaderProps {
  voiceMode: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onMinimize: () => void;
}

export const StatusHeader = React.memo<StatusHeaderProps>(({ 
  voiceMode, 
  isExpanded, 
  onToggleExpanded, 
  onMinimize 
}) => (
  <div className="p-3 border-b border-border/20">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.div 
          className={`w-2.5 h-2.5 rounded-full ${
            voiceMode ? 'bg-primary animate-glow-pulse' : 'bg-green-500 animate-modern-pulse'
          }`}
          animate={{ 
            scale: voiceMode ? [1, 1.2, 1] : [1, 1.1, 1],
            opacity: voiceMode ? [1, 0.7, 1] : [1, 0.8, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div>
          <div className="font-medium text-holographic">F.B/c AI Assistant</div>
          <motion.div 
            className="text-sm text-muted-foreground"
            animate={voiceMode ? { opacity: [1, 0.7, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {voiceMode ? 'Voice Active' : 'Business Intelligence'}
          </motion.div>
        </div>
        
        {voiceMode && (
          <motion.div 
            className="flex gap-1 ml-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-3 bg-primary/60 rounded-full"
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: "easeInOut" 
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="w-7 h-7 p-0 rounded-lg hover:bg-primary/10"
          aria-label={isExpanded ? 'Show less' : 'Show more'}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </motion.div>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onMinimize}
          className="w-7 h-7 p-0 rounded-lg hover:bg-primary/10"
          aria-label="Minimize"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </Button>
      </div>
    </div>
  </div>
));

StatusHeader.displayName = 'StatusHeader';