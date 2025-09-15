"use client"

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { TrendingUp, FileText, Calendar, Globe, Link as LinkIcon } from 'lucide-react';
import { useToolActions } from '@/hooks/use-tool-actions';
import { useToast } from '@/hooks/use-toast';

interface BusinessActionsProps {
  conversationStarted: boolean;
  onGeneratePDF: () => void;
  onShowBooking: () => void;
  onShowResearchPanel?: () => void;
}

export const BusinessActions = React.memo<BusinessActionsProps>(({ 
  conversationStarted, 
  onGeneratePDF, 
  onShowBooking,
  onShowResearchPanel 
}) => {
  const { search, analyzeURL } = useToolActions()
  const { toast } = useToast()

  const runSearch = useCallback(async () => {
    const sel = (typeof window !== 'undefined' && window.getSelection && window.getSelection()?.toString())?.trim() || ''
    const query = window.prompt('Web Search: enter your query', sel)?.trim()
    if (!query) return
    const res = await search(query)
    if (res.ok) {
      const text = (res.output as any)?.text || 'Search completed.'
      toast({ title: 'Search Complete', description: text.slice(0, 200) + (text.length > 200 ? '…' : '') })
    }
  }, [search, toast])

  const runUrlContext = useCallback(async () => {
    const sel = (typeof window !== 'undefined' && window.getSelection && window.getSelection()?.toString())?.trim() || ''
    const raw = window.prompt('URL Analysis: enter one or more URLs (comma or space separated)', sel)?.trim()
    if (!raw) return
    const urls = raw.split(/[\s,]+/).filter(Boolean)
    const res = await analyzeURL(urls)
    if (res.ok) {
      const text = (res.output as any)?.text || 'URL analysis completed.'
      toast({ title: 'URL Analysis Complete', description: text.slice(0, 200) + (text.length > 200 ? '…' : '') })
    }
  }, [analyzeURL, toast])

  return (
  <AnimatePresence>
    {conversationStarted && (
      <motion.div 
        className="p-3 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <motion.div 
          className="flex items-center gap-2 mb-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <TrendingUp className="w-3 h-3 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-muted-foreground">
            Business Actions
          </span>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onGeneratePDF}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-xl glass-button border-border/50 hover:border-primary/30 hover:bg-primary/5"
                >
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <FileText className="w-3 h-3 mr-2" />
                  </motion.div>
                  Report
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Generate AI Strategy Report</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onShowBooking}
                  size="sm"
                  className="w-full h-8 rounded-xl glass-button bg-primary/15 hover:bg-primary/25 text-primary interactive-glow border-primary/20 shadow-sm"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar className="w-3 h-3 mr-2" />
                  </motion.div>
                  Book Call
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Schedule Strategy Session</TooltipContent>
          </Tooltip>
          
          {/* Web Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={runSearch}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-xl glass-button border-border/50 hover:border-primary/30 hover:bg-primary/5"
                >
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Globe className="w-3 h-3 mr-2" />
                  </motion.div>
                  Web Search
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Grounded Web Search</TooltipContent>
          </Tooltip>

          {/* URL Context */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={runUrlContext}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-xl glass-button border-border/50 hover:border-primary/30 hover:bg-primary/5"
                >
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <LinkIcon className="w-3 h-3 mr-2" />
                  </motion.div>
                  Analyze URL
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Analyze Webpage Content</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Progress indicator for business actions */}
        <motion.div
          className="mt-3 pt-2 border-t border-border/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ready for next steps</span>
            <motion.div className="flex space-x-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-1 h-1 bg-primary rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: dot * 0.3 
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)});

BusinessActions.displayName = 'BusinessActions';
          {/* Research Panel */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => onShowResearchPanel?.()}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-xl glass-button border-border/50 hover:border-primary/30 hover:bg-primary/5"
                >
                  Research Panel
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Show Recent Research</TooltipContent>
          </Tooltip>
