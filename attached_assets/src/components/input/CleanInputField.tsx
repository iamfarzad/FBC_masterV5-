"use client"

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { 
  Send,
  Mic,
  MicOff,
  Settings,
  Camera,
  Monitor,
  GraduationCap,
  Plus,
  Upload,
  Search,
  X
} from 'lucide-react';

interface ToolItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const BUSINESS_TOOLS: ToolItem[] = [
  { id: 'webcam', icon: Camera, label: 'Video Call', description: 'Face-to-face consultation' },
  { id: 'screen', icon: Monitor, label: 'Screen Share', description: 'Business process analysis' },
  { id: 'docs', icon: Upload, label: 'Documents', description: 'Upload & analyze files' },
  { id: 'research', icon: Search, label: 'Research', description: 'Market & competitor analysis' },
  { id: 'workshop', icon: GraduationCap, label: 'AI Academy', description: 'Executive training resources' }
];

interface CleanInputFieldProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  voiceMode: boolean;
  onToggleVoice: () => void;
  onShowVoiceOverlay: () => void;
  onToolSelect: (tool: string) => void;
  onShowSettings: () => void;
  activeTools: string[];
}

export const CleanInputField = React.memo<CleanInputFieldProps>(({ 
  input, 
  setInput, 
  onSubmit, 
  isLoading, 
  voiceMode, 
  onToggleVoice, 
  onShowVoiceOverlay, 
  onToolSelect, 
  onShowSettings, 
  activeTools 
}) => {
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape' && isToolsExpanded) {
      setIsToolsExpanded(false);
    }
  }, [onSubmit, isToolsExpanded]);

  const handleToolToggle = useCallback(() => {
    setIsToolsExpanded(prev => !prev);
  }, []);

  const toolElements = useMemo(() => (
    BUSINESS_TOOLS.map((tool, index) => (
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="ghost"
          onClick={() => {
            onToolSelect(tool.id);
            setIsToolsExpanded(false);
          }}
          className={`w-full h-auto p-4 rounded-2xl justify-start glass-button interactive-lift ${
            activeTools.includes(tool.id) ? 'bg-primary/15 text-primary state-success' : ''
          }`}
          aria-pressed={activeTools.includes(tool.id)}
        >
          <div className="flex items-center gap-4 w-full">
            <motion.div 
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                activeTools.includes(tool.id) ? 'bg-primary/20 animate-glow-pulse' : 'bg-muted/30'
              }`}
              animate={activeTools.includes(tool.id) ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <tool.icon className="w-5 h-5" aria-hidden="true" />
            </motion.div>
            <div className="text-left flex-1">
              <div className="font-medium text-holographic">{tool.label}</div>
              <div className="text-muted-foreground">{tool.description}</div>
            </div>
            {activeTools.includes(tool.id) && (
              <motion.div 
                className="w-2.5 h-2.5 bg-primary rounded-full animate-modern-pulse" 
                aria-hidden="true"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
              />
            )}
          </div>
        </Button>
      </motion.div>
    ))
  ), [activeTools, onToolSelect]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-6 z-30">
      {/* Tools Menu */}
      <AnimatePresence>
        {isToolsExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 min-w-72 glass-card rounded-3xl shadow-2xl p-4 mb-2 z-40 effect-noise"
            role="menu"
            aria-label="Business tools menu"
          >
            <div className="space-y-1">
              {/* Voice Control */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => {
                    onShowVoiceOverlay();
                    setIsToolsExpanded(false);
                  }}
                  className={`w-full h-auto p-4 rounded-2xl justify-start glass-button interactive-lift ${
                    voiceMode ? 'bg-primary/15 text-primary state-success' : ''
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-4 w-full">
                    <motion.div 
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        voiceMode ? 'bg-primary/20 animate-glow-pulse' : 'bg-muted/30'
                      }`}
                      animate={voiceMode ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Mic className="w-5 h-5" aria-hidden="true" />
                    </motion.div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-holographic">Voice AI</div>
                      <div className="text-muted-foreground">Natural conversation mode</div>
                    </div>
                    {voiceMode && (
                      <motion.div 
                        className="w-2.5 h-2.5 bg-primary rounded-full animate-modern-pulse" 
                        aria-hidden="true"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      />
                    )}
                  </div>
                </Button>
              </motion.div>

              {/* Tool Buttons */}
              {toolElements}

              {/* Settings Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: BUSINESS_TOOLS.length * 0.1 + 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => {
                    onShowSettings();
                    setIsToolsExpanded(false);
                  }}
                  className="w-full h-auto p-4 rounded-2xl justify-start glass-button interactive-lift"
                  role="menuitem"
                >
                  <div className="flex items-center gap-4 w-full">
                    <motion.div 
                      className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center"
                      whileHover={{ rotate: 90 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Settings className="w-5 h-5" aria-hidden="true" />
                    </motion.div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-holographic">Settings</div>
                      <div className="text-muted-foreground">Preferences & theme</div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Field Container */}
      <motion.div 
        className="relative glass-card rounded-3xl shadow-2xl modern-input-focus effect-noise"
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <label htmlFor="business-input" className="sr-only">
          Describe your business challenge or AI opportunity
        </label>
        <Textarea
          id="business-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your business challenge or AI opportunity..."
          className="w-full resize-none border-0 bg-transparent py-5 pl-16 pr-28 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/70"
          disabled={isLoading}
          rows={1}
          style={{ minHeight: '64px' }}
          aria-label="Business inquiry input"
        />
        
        {/* Subtle border accent - no animation */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        
        {/* Left Controls */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToolToggle}
                  className={`w-10 h-10 p-0 rounded-2xl glass-button interactive-scale ${
                    isToolsExpanded ? 'bg-primary/20 text-primary animate-glow-pulse' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={isLoading}
                  aria-label={isToolsExpanded ? 'Close business tools' : 'Open business tools'}
                  aria-expanded={isToolsExpanded}
                  aria-haspopup="menu"
                >
                  <motion.div
                    animate={{ rotate: isToolsExpanded ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {isToolsExpanded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </motion.div>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Business Tools</TooltipContent>
          </Tooltip>
        </div>

        {/* Right Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowVoiceOverlay}
                  className={`w-10 h-10 p-0 rounded-2xl glass-button interactive-scale ${
                    voiceMode ? 'bg-primary/20 text-primary animate-glow-pulse' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={isLoading}
                  aria-label={voiceMode ? 'Voice mode active' : 'Start voice conversation'}
                >
                  <motion.div
                    animate={voiceMode ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {voiceMode ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </motion.div>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              {voiceMode ? 'Voice Active' : 'Open Voice AI'}
            </TooltipContent>
          </Tooltip>

          <AnimatePresence>
            {input.trim() && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        onClick={onSubmit}
                        disabled={isLoading || !input.trim()}
                        size="sm"
                        className="w-11 h-11 p-0 rounded-2xl glass-button bg-primary/10 text-primary hover:bg-primary/20 interactive-glow"
                        aria-label="Send message"
                      >
                        <motion.div
                          animate={isLoading ? { rotate: 360 } : {}}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>Send Message</TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {voiceMode && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          className="flex items-center justify-center mt-4"
        >
          <Badge variant="outline" className="glass-surface border-primary/30 text-primary px-4 py-2 interactive-glow">
            <motion.div 
              className="w-2.5 h-2.5 bg-primary rounded-full mr-3 animate-modern-pulse" 
              aria-hidden="true"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-holographic">Voice Active</span>
          </Badge>
        </motion.div>
      )}
    </div>
  );
});

CleanInputField.displayName = 'CleanInputField';