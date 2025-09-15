"use client"

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { MessageData } from '@/components/chat/UnifiedMessage'
import { Source } from '@/components/ai-elements/source'
import { Button } from '@/components/ui/button'

interface ResearchPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: MessageData[]
}

export const ResearchPanel: React.FC<ResearchPanelProps> = ({ isOpen, onClose, messages }) => {
  const research = messages.filter(m => m.type === 'insight' && (m.sources?.length || 0) > 0)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full sm:max-w-3xl bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <div className="text-sm font-medium">Research</div>
              <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
              {research.length === 0 && (
                <div className="text-sm text-muted-foreground">No research results yet.</div>
              )}
              {research.map((m) => (
                <div key={m.id} className="p-3 rounded-lg border border-border/30 bg-muted/20">
                  <div className="text-sm whitespace-pre-wrap mb-2">{m.content}</div>
                  <div className="flex flex-wrap gap-2">
                    {(m.sources || []).map((s, idx) => (
                      <Source key={idx} title={s.title} url={s.url} excerpt={s.excerpt} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

