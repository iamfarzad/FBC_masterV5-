import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, FileText, Mic, Share2, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface QuickActionsBarProps {
  onBookCall: () => void;
  onGeneratePDF: () => void;
  onStartVoice: () => void;
  onShare: () => void;
  hasEmail: boolean;
  conversationStage: string;
  className?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onBookCall,
  onGeneratePDF,
  onStartVoice,
  onShare,
  hasEmail,
  conversationStage,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowBooking = ['solution_positioning', 'booking_offer'].includes(conversationStage);
  const shouldShowPDF = hasEmail && ['discovery', 'solution_positioning', 'booking_offer'].includes(conversationStage);

  const actions = [
    {
      id: 'voice',
      icon: Mic,
      label: 'Start Voice Chat',
      action: onStartVoice,
      show: true,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'booking',
      icon: Calendar,
      label: 'Book a Call',
      action: onBookCall,
      show: shouldShowBooking,
      gradient: 'from-green-500 to-green-600',
      pulse: shouldShowBooking
    },
    {
      id: 'pdf',
      icon: FileText,
      label: 'Generate Report',
      action: onGeneratePDF,
      show: shouldShowPDF,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share Conversation',
      action: onShare,
      show: conversationStage !== 'greeting',
      gradient: 'from-orange-500 to-orange-600'
    }
  ].filter(action => action.show);

  if (actions.length === 0) return null;

  return (
    <motion.div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="relative">
        {/* Expand/Collapse button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-3 h-3" />
          </motion.div>
        </motion.button>

        {/* Actions container */}
        <motion.div
          className="flex items-center gap-3 px-6 py-4 rounded-2xl holo-card backdrop-blur-xl border shadow-lg"
          animate={{
            width: isExpanded ? 'auto' : '80px',
            height: isExpanded ? 'auto' : '56px'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Tooltip key={action.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            onClick={action.action}
                            size="sm"
                            className={`relative h-10 w-10 p-0 rounded-full bg-gradient-to-r ${action.gradient} text-white shadow-md hover:shadow-lg transition-all duration-200`}
                            style={{
                              animation: action.pulse ? 'pulse 2s infinite' : undefined
                            }}
                          >
                            <Icon className="w-4 h-4" />
                            {action.pulse && (
                              <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-30" />
                            )}
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{action.label}</span>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                className="flex items-center justify-center w-12 h-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};