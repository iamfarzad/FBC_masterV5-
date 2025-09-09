"use client"

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Settings, X, Sun, Moon } from 'lucide-react';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const SettingsOverlay = React.memo<SettingsOverlayProps>(({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeChange 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md glass-card rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(255, 255, 255, 0.1)',
                    '0 0 0 8px rgba(255, 255, 255, 0.05)',
                    '0 0 0 0 rgba(255, 255, 255, 0.1)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Settings className="w-5 h-5 text-primary" aria-hidden="true" />
              </motion.div>
              <h2 id="settings-title" className="font-medium text-holographic">Settings</h2>
            </div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="rounded-xl glass-button"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-3">
            <h3 className="font-medium text-holographic">Appearance</h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Theme</span>
              <div className="flex gap-2" role="radiogroup" aria-label="Theme selection">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={theme === 'light' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onThemeChange('light')}
                    className={`rounded-xl glass-button transition-all duration-300 ${
                      theme === 'light' 
                        ? 'bg-primary/15 text-primary shadow-md border-primary/20' 
                        : 'hover:bg-primary/5'
                    }`}
                    role="radio"
                    aria-checked={theme === 'light'}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onThemeChange('dark')}
                    className={`rounded-xl glass-button transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-primary/15 text-primary shadow-md border-primary/20' 
                        : 'hover:bg-primary/5'
                    }`}
                    role="radio"
                    aria-checked={theme === 'dark'}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-3">
            <h3 className="font-medium text-holographic">AI Assistant</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Voice Responses</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lead Scoring</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Advanced
                </Badge>
              </div>
            </div>
          </div>

          {/* Business Tools */}
          <div className="space-y-3">
            <h3 className="font-medium text-holographic">Business Intelligence</h3>
            <div className="glass-card p-4 rounded-xl">
              <p className="text-muted-foreground text-sm">
                All business analysis tools are active and ready for consultation.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-green-400">System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

SettingsOverlay.displayName = 'SettingsOverlay';