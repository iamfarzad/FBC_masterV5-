import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Settings, Eye, EyeOff, Smartphone, Monitor, Mic, Video, ScreenShare, MessageSquare, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { isLayoutTestMode } from '../config/environment';

interface LayoutTestPanelProps {
  activeInputMode: 'text' | 'voice' | 'video' | 'screen';
  onModeChange: (mode: 'text' | 'voice' | 'video' | 'screen') => void;
  onClearErrors?: () => void;
  onToggleMobileView?: () => void;
  isMobileView?: boolean;
}

export const LayoutTestPanel: React.FC<LayoutTestPanelProps> = ({
  activeInputMode,
  onModeChange,
  onClearErrors,
  onToggleMobileView,
  isMobileView = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in layout test mode
  if (!isLayoutTestMode()) {
    return null;
  }

  const testModes = [
    { id: 'text' as const, icon: MessageSquare, label: 'Text', color: 'from-gray-500 to-gray-600' },
    { id: 'voice' as const, icon: Mic, label: 'Voice', color: 'from-blue-500 to-blue-600' },
    { id: 'video' as const, icon: Video, label: 'Video', color: 'from-green-500 to-green-600' },
    { id: 'screen' as const, icon: ScreenShare, label: 'Screen', color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <motion.div
      className="fixed top-4 left-4 z-50"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="holo-card rounded-2xl p-4 backdrop-blur-xl border shadow-lg min-w-[200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Layout Test</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Mode Selector */}
              <div>
                <div className="text-xs text-muted-foreground mb-2">Input Mode</div>
                <div className="grid grid-cols-2 gap-2">
                  {testModes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeInputMode === mode.id;
                    return (
                      <Tooltip key={mode.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => onModeChange(mode.id)}
                            className={`h-8 text-xs ${isActive ? `bg-gradient-to-r ${mode.color} text-white` : ''}`}
                          >
                            <Icon className="size-3 mr-1" />
                            {mode.label}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>Test {mode.label} Mode</span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearErrors}
                    className="h-8 text-xs justify-start"
                  >
                    <X className="size-3 mr-1" />
                    Clear Errors
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleMobileView}
                    className="h-8 text-xs justify-start"
                  >
                    {isMobileView ? <Monitor className="size-3 mr-1" /> : <Smartphone className="size-3 mr-1" />}
                    {isMobileView ? 'Desktop View' : 'Mobile View'}
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="text-xs text-muted-foreground mb-2">Status</div>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs w-full justify-center">
                    🎨 Layout Test Mode
                  </Badge>
                  <Badge variant="secondary" className="text-xs w-full justify-center">
                    Mode: {activeInputMode}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};