"use client"

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic } from 'lucide-react';
import { ToolMenu } from '@/components/chat/ToolMenu';

interface CleanInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceClick?: () => void;
  onWebcamClick?: () => void;
  onScreenShareClick?: () => void;
  onFileUpload?: () => void;
  onCanvasClick?: () => void;
  onDocumentUpload?: () => void;
  onImageUpload?: () => void;
  onROI?: () => void;
  isLoading: boolean;
  voiceMode?: boolean;
  showVoiceOverlay?: boolean;
  showWebcamInterface?: boolean;
  showScreenShareInterface?: boolean;
  className?: string;
}

export const CleanInputField = React.memo<CleanInputFieldProps>(({ 
  value,
  onChange,
  onSend,
  onVoiceClick,
  onWebcamClick,
  onScreenShareClick,
  onDocumentUpload,
  onImageUpload,
  onROI,
  isLoading,
  voiceMode = false,
  className = ""
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-6 z-30 ${className}`}>
      <motion.div 
        className="relative bg-surface border border-border rounded-3xl shadow-lg"
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your business challenge or AI opportunity..."
          className="w-full resize-none border-0 bg-transparent py-5 pl-16 pr-28 focus:outline-none focus:ring-0 placeholder:text-text-muted"
          disabled={isLoading}
          rows={1}
          style={{ minHeight: '64px' }}
        />
        
        {/* Left Controls */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <ToolMenu
            disabled={isLoading}
            {...(onDocumentUpload ? { onUploadDocument: onDocumentUpload } : {})}
            {...(onImageUpload ? { onUploadImage: onImageUpload } : {})}
            {...(onWebcamClick ? { onWebcam: onWebcamClick } : {})}
            {...(onScreenShareClick ? { onScreenShare: onScreenShareClick } : {})}
            {...(onROI ? { onROI } : {})}
            comingSoon={['document', 'image']}
            className="text-text-muted hover:text-brand"
          />
        </div>

        {/* Right Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onVoiceClick}
              className={`w-10 h-10 p-0 rounded-2xl ${
                voiceMode ? 'bg-brand/20 text-brand' : 'text-text-muted hover:text-brand'
              }`}
              disabled={isLoading}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </motion.div>

          <AnimatePresence>
            {value.trim() && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    onClick={onSend}
                    disabled={isLoading || !value.trim()}
                    size="sm"
                    className="w-11 h-11 p-0 rounded-2xl bg-brand hover:bg-brand-hover text-surface"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </motion.div>
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
          <Badge variant="outline" className="bg-brand/10 border-brand/30 text-brand px-4 py-2">
            <motion.div 
              className="w-2.5 h-2.5 bg-brand rounded-full mr-3"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            Voice Active
          </Badge>
        </motion.div>
      )}
    </div>
  );
});

CleanInputField.displayName = 'CleanInputField';
