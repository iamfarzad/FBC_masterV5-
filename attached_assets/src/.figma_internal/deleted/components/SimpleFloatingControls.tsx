import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { 
  Mic, 
  Camera, 
  Monitor, 
  MessageCircle,
  Plus,
  X
} from 'lucide-react';

interface SimpleFloatingControlsProps {
  activeInputMode: 'text' | 'voice' | 'video' | 'screen';
  onModeChange: (mode: 'text' | 'voice' | 'video' | 'screen') => void;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCalendarOpen?: () => void;
  className?: string;
}

export const SimpleFloatingControls: React.FC<SimpleFloatingControlsProps> = ({
  activeInputMode,
  onModeChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleModeSelect = (mode: 'text' | 'voice' | 'video' | 'screen') => {
    onModeChange(mode);
    setIsExpanded(false);
  };

  const modes = [
    { id: 'video' as const, icon: Camera, label: 'Video Mode' },
    { id: 'screen' as const, icon: Monitor, label: 'Screen Share' }
  ];

  const activeMode = modes.find(mode => mode.id === activeInputMode);

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <div className="relative">
        {/* Mode Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 flex flex-col gap-2"
            >
              {modes.map((mode) => (
                <Tooltip key={mode.id}>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => handleModeSelect(mode.id)}
                        className={`w-12 h-12 rounded-full p-0 modern-button transition-all duration-200 ${
                          activeInputMode === mode.id
                            ? 'holo-card holo-glow text-foreground scan-line'
                            : 'holo-card text-muted-foreground hover:text-foreground hover:holo-glow'
                        }`}
                        variant="ghost"
                      >
                        <mode.icon className="size-5" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="holo-card">
                    <span>{mode.label}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={toggleExpanded}
            className={`w-14 h-14 rounded-full p-0 modern-button transition-all duration-300 ${
              isExpanded || (activeInputMode !== 'text' && activeInputMode !== 'voice')
                ? 'holo-card holo-glow text-foreground scan-line'
                : 'holo-card text-muted-foreground hover:text-foreground hover:holo-glow'
            }`}
            variant="ghost"
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="size-6" />
                </motion.div>
              ) : activeMode && activeInputMode !== 'text' && activeInputMode !== 'voice' ? (
                <motion.div
                  key="active-mode"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <activeMode.icon className="size-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="size-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Active Indicator */}
          {activeInputMode !== 'text' && activeInputMode !== 'voice' && !isExpanded && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-foreground rounded-full border-2 border-background flex items-center justify-center">
              <div className="w-2 h-2 bg-background rounded-full animate-pulse" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};