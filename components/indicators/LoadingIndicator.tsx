"use client"

import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

export const LoadingIndicator = React.memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-start mb-4"
  >
    <div className="flex gap-3 max-w-3xl w-full">
      {/* Unified AI Avatar - matches UnifiedMessage */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <motion.div
            animate={{ 
              rotate: 360
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" }
            }}
          >
            <Zap className="w-4 h-4 text-primary" />
          </motion.div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Unified AI Assistant Name */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-primary">F.B/c AI Assistant</span>
        </div>
        
        {/* Elegant thinking indicator */}
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            Thinking...
          </div>
          
          {/* Elegant dots */}
          <div className="flex items-center gap-1.5">
            {[0, 0.2, 0.4].map((delay, index) => (
              <motion.div 
                key={index}
                className="w-2 h-2 glass-card rounded-full" 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut"
                }}
              >
                <div className="w-1 h-1 bg-primary rounded-full m-0.5" />
              </motion.div>
            ))}
          </div>
          
          {/* Subtle processing indicator */}
          <div className="w-16 h-0.5 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary/60 rounded-full"
              animate={{
                x: [-64, 64],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ width: '40%' }}
            />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));

LoadingIndicator.displayName = 'LoadingIndicator';
