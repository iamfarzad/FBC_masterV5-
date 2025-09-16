"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Target, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
}

export const WelcomeScreen = React.memo<WelcomeScreenProps>(({ onGetStarted }) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="text-center py-32 space-y-8 relative"
  >
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
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand to-brand-hover rounded-full flex items-center justify-center mb-12 shadow-lg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-16 h-16 text-surface" />
        </motion.div>
      </div>
    </motion.div>
    
    {/* Content */}
    <div className="space-y-6 relative z-10">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-bold text-text"
      >
        AI Business Intelligence
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-text-muted max-w-2xl mx-auto leading-relaxed"
      >
        Discover how artificial intelligence can transform your business operations, 
        optimize workflows, and drive sustainable growth through intelligent automation.
      </motion.p>
      
      {onGetStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-brand hover:bg-brand-hover text-surface px-8 py-3 rounded-xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </motion.div>
      )}
    </div>
    
    {/* Capability badges */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
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
          transition={{ delay: 1.2 + index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <Badge 
            variant="outline" 
            className="px-4 py-2 bg-surface border-border hover:border-brand transition-colors cursor-default"
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </Badge>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
));

WelcomeScreen.displayName = 'WelcomeScreen';