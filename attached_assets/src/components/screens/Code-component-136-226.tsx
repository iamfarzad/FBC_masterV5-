"use client"

import React from 'react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Brain, TrendingUp, Target } from 'lucide-react';

export const WelcomeScreen = React.memo(() => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="text-center py-32 space-y-8 relative"
  >
    {/* Subtle background effects */}
    <div className="absolute inset-0 effect-grid opacity-30 pointer-events-none" />
    
    {/* Main AI Icon */}
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: 0.2, 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }}
      className="relative"
    >
      <div className="w-32 h-32 mx-auto glass-card rounded-full flex items-center justify-center mb-12 interactive-lift animate-float">
        <motion.div
          animate={{ 
            rotate: 360
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        >
          <Brain className="w-16 h-16 text-primary" aria-hidden="true" />
        </motion.div>
        
        {/* Minimal orbital elements */}
        {[0, 120, 240].map((rotation, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-primary/60 rounded-full"
            style={{
              transform: `rotate(${rotation}deg) translateX(60px)`,
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.5
            }}
          />
        ))}
      </div>
    </motion.div>
    
    {/* Content */}
    <div className="space-y-6 relative z-10">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-holographic tracking-tight"
      >
        AI Business Intelligence
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-muted-foreground max-w-2xl mx-auto leading-relaxed"
      >
        Discover how artificial intelligence can transform your business operations, 
        optimize workflows, and drive sustainable growth through intelligent automation.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-muted-foreground opacity-80"
      >
        Start a conversation to explore AI solutions tailored to your business needs.
      </motion.div>
    </div>
    
    {/* Minimal capability badges */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex flex-wrap justify-center gap-3 mt-12 max-w-2xl mx-auto"
    >
      {[
        { icon: TrendingUp, label: 'Growth Strategy' },
        { icon: Target, label: 'ROI Optimization' },
        { icon: Brain, label: 'AI Innovation' }
      ].map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 + index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <Badge 
            variant="outline" 
            className="px-4 py-2 glass-button interactive-scale cursor-default"
          >
            <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
            {item.label}
          </Badge>
        </motion.div>
      ))}
    </motion.div>
    
    {/* Subtle floating particles */}
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-primary/30 rounded-full"
        style={{
          left: `${20 + i * 12}%`,
          top: `${30 + (i % 3) * 20}%`,
        }}
        animate={{
          y: [-10, 10, -10],
          opacity: [0.3, 0.6, 0.3],
          scale: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5
        }}
      />
    ))}
    
    {/* Subtle scan line effect */}
    <motion.div
      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      style={{ top: '40%' }}
      animate={{
        opacity: [0, 0.5, 0],
        scaleX: [0, 1, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.div>
));

WelcomeScreen.displayName = 'WelcomeScreen';