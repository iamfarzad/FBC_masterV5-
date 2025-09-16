"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator = React.memo<LoadingIndicatorProps>(({ 
  message = "AI is thinking..." 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-start mb-4"
  >
    <div className="flex gap-3 max-w-3xl w-full">
      {/* AI Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-brand" />
          </motion.div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        {/* AI Assistant Name */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-brand">F.B/c AI Assistant</span>
        </div>
        
        {/* Thinking indicator */}
        <div className="flex flex-col gap-2">
          <div className="text-sm text-text-muted">{message}</div>
          
          {/* Elegant dots */}
          <div className="flex items-center gap-1.5">
            {[0, 0.2, 0.4].map((delay, index) => (
              <motion.div 
                key={index}
                className="w-2 h-2 bg-surface-elevated rounded-full border border-border" 
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
                <div className="w-1 h-1 bg-brand rounded-full m-0.5" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));

LoadingIndicator.displayName = 'LoadingIndicator';