"use client"

import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface FloatingBrandLogoProps {
  className?: string;
}

export const FloatingBrandLogo: React.FC<FloatingBrandLogoProps> = ({
  className = ''
}) => {
  return (
    <div className={`fixed top-6 left-6 z-40 ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="modern-hover flex size-12 items-center justify-center rounded-xl bg-primary shadow-lg holo-glow cursor-pointer">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <div className="absolute inset-0 -z-10 animate-modern-pulse rounded-xl bg-primary/20 blur-md" />
            
            {/* Subtle floating particles effect */}
            <div className="absolute inset-0 -z-20">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/30 rounded-full"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 20}%`,
                  }}
                  animate={{
                    y: [-4, 4, -4],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="text-center">
            <div className="font-medium">AI Lead Generation</div>
            <div className="text-xs text-muted-foreground">Powered by F.B/c AI</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};