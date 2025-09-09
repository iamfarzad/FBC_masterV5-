import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { 
  Check,
  ChevronDown,
  MessageSquare,
  User,
  Mail,
  Search,
  Target,
  Presentation,
  Calendar,
  Brain
} from 'lucide-react';

interface StageRailProps {
  currentStageIndex: number;
  conversationStarted: boolean;
  exploredCount?: number;
  totalCapabilities?: number;
  className?: string;
}

// Simplified conversation stages
const CONVERSATION_STAGES = [
  { id: 1, name: "First impression & rapport building", icon: MessageSquare },
  { id: 2, name: "Stakeholder identification & role understanding", icon: User },
  { id: 3, name: "Consent acquisition & intelligence gathering", icon: Mail },
  { id: 4, name: "Competitive landscape & industry analysis", icon: Search },
  { id: 5, name: "Pain point identification & impact quantification", icon: Target },
  { id: 6, name: "Tailored proposals & value proposition", icon: Presentation },
  { id: 7, name: "Decision facilitation & next steps", icon: Calendar }
];

// Compact dropdown component
const StageDropdown = React.memo<{
  currentStageIndex: number;
  exploredCount: number;
  totalCapabilities: number;
  isOpen: boolean;
  onToggle: () => void;
}>(({ currentStageIndex, exploredCount, totalCapabilities, isOpen, onToggle }) => {
  const intelligenceScore = Math.min(Math.round((currentStageIndex / 7) * 70 + (exploredCount / totalCapabilities) * 30), 100);

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 px-3 glass-button text-xs font-medium"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-3 h-3 text-primary" />
              <span className="text-holographic">Stage {currentStageIndex}/7</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-primary">{intelligenceScore}% Complete</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </motion.div>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Conversation Progress</TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full left-0 mt-2 w-96 glass-card rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl glass-surface flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-holographic">
                    Stage {currentStageIndex}/7 • {intelligenceScore}% Complete
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Capability Exploration: {exploredCount}/{totalCapabilities}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 glass-surface rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${intelligenceScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Stage List */}
            <div className="p-2 max-h-64 overflow-y-auto scrollbar-modern">
              {CONVERSATION_STAGES.map((stage, index) => {
                const stageNumber = index + 1;
                const isCompleted = stageNumber < currentStageIndex;
                const isCurrent = stageNumber === currentStageIndex;
                const StageIcon = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isCurrent 
                        ? 'glass-surface border border-primary/20' 
                        : isCompleted
                        ? 'hover:glass-surface'
                        : 'opacity-60'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isCurrent
                        ? 'bg-primary/20 text-primary'
                        : isCompleted
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted/10 text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <StageIcon className="w-3 h-3" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-holographic truncate">
                        {stage.name}
                      </div>
                      {isCurrent && (
                        <div className="text-xs text-primary mt-0.5">
                          Active Stage
                        </div>
                      )}
                    </div>

                    {isCurrent && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-modern-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

StageDropdown.displayName = 'StageDropdown';

// Main StageRail component - minimal design
export const StageRail: React.FC<StageRailProps> = ({ 
  currentStageIndex = 1,
  conversationStarted = false,
  exploredCount = 0,
  totalCapabilities = 16,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ensure stage index is within bounds
  const validStageIndex = Math.max(1, Math.min(currentStageIndex, CONVERSATION_STAGES.length));
  const validExploredCount = Math.max(0, Math.min(exploredCount, totalCapabilities));

  if (!conversationStarted) return null;

  return (
    <div className={className}>
      {/* Desktop & Mobile - same compact design */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
        className="fixed top-6 left-6 z-10"
      >
        <StageDropdown
          currentStageIndex={validStageIndex}
          exploredCount={validExploredCount}
          totalCapabilities={totalCapabilities}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        {/* Click outside to close */}
        {isOpen && (
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </motion.div>
    </div>
  );
};

StageRail.displayName = 'StageRail';

// Simple hook for stage progression
export const useStageProgression = (messages: any[] = []) => {
  const [currentStageIndex, setCurrentStageIndex] = React.useState(1);
  const [exploredCount, setExploredCount] = React.useState(0);

  React.useEffect(() => {
    // Simple progression based on message count
    const messageCount = messages.length;
    
    if (messageCount <= 2) {
      setCurrentStageIndex(1);
    } else if (messageCount <= 4) {
      setCurrentStageIndex(2);
    } else if (messageCount <= 6) {
      setCurrentStageIndex(3);
    } else if (messageCount <= 8) {
      setCurrentStageIndex(4);
    } else if (messageCount <= 11) {
      setCurrentStageIndex(5);
    } else if (messageCount <= 14) {
      setCurrentStageIndex(6);
    } else {
      setCurrentStageIndex(7);
    }

    // Exploration count grows with interaction
    setExploredCount(Math.min(messageCount * 1.5, 16));
  }, [messages.length]);

  return {
    currentStageIndex,
    exploredCount,
    getProgressPercentage: () => Math.round((exploredCount / 16) * 100),
    getCurrentStage: () => CONVERSATION_STAGES[currentStageIndex - 1]
  };
};