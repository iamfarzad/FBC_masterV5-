import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Calendar, FileText, Mic } from 'lucide-react';

interface FloatingActionHintsProps {
  conversationStage: string;
  hasEmail: boolean;
  onAction: (action: string) => void;
}

export const FloatingActionHints: React.FC<FloatingActionHintsProps> = ({
  conversationStage,
  hasEmail,
  onAction
}) => {
  const [currentHint, setCurrentHint] = useState<{
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    action: string;
    pulse?: boolean;
  } | null>(null);

  useEffect(() => {
    let hint = null;

    switch (conversationStage) {
      case 'solution_positioning':
        hint = {
          icon: Calendar,
          text: "Ready to schedule a call?",
          action: 'booking',
          pulse: true
        };
        break;
      case 'booking_offer':
        hint = {
          icon: Calendar,
          text: "Let's find a time that works",
          action: 'booking',
          pulse: true
        };
        break;
      case 'email_collected':
      case 'discovery':
        if (hasEmail) {
          hint = {
            icon: FileText,
            text: "Generate your AI strategy report",
            action: 'pdf'
          };
        }
        break;
    }

    setCurrentHint(hint);
  }, [conversationStage, hasEmail]);

  if (!currentHint) return null;

  const Icon = currentHint.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 20 }}
        className="fixed bottom-24 right-6 z-50"
      >
        <motion.button
          onClick={() => onAction(currentHint.action)}
          className="group flex items-center gap-3 rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 max-w-xs"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={currentHint.pulse ? {
            boxShadow: [
              '0 4px 14px 0 rgba(0,0,0,0.1)',
              '0 8px 20px 0 rgba(0,0,0,0.15)',
              '0 4px 14px 0 rgba(0,0,0,0.1)'
            ]
          } : {}}
          transition={currentHint.pulse ? { duration: 2, repeat: Infinity } : {}}
        >
          <div className="p-1 rounded-full bg-primary-foreground/20">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{currentHint.text}</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-current opacity-60"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};