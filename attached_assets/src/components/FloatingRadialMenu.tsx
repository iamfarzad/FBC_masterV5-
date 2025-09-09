"use client"

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Mic, 
  Camera, 
  Monitor, 
  FileText, 
  BookOpen, 
  GraduationCap,
  Plus,
  X,
  Zap
} from 'lucide-react';

interface RadialMenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  description: string;
  color: string;
  mode?: 'text' | 'voice' | 'video' | 'screen';
  angle: number;
}

interface FloatingRadialMenuProps {
  activeFeature: string;
  activeInputMode: 'text' | 'voice' | 'video' | 'screen';
  streamingState?: {
    isConnected: boolean;
    isListening?: boolean;
  };
  onToolSelect: (toolId: string) => void;
  onModeChange: (mode: 'text' | 'voice' | 'video' | 'screen') => void;
  className?: string;
}

export const FloatingRadialMenu: React.FC<FloatingRadialMenuProps> = ({
  activeFeature,
  activeInputMode,
  streamingState = { isConnected: false, isListening: false },
  onToolSelect,
  onModeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Check if mobile on mount with better detection and keyboard detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || 
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    const checkKeyboard = () => {
      if (isMobile) {
        const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDiff = initialViewportHeight - currentHeight;
        setIsKeyboardOpen(heightDiff > 150); // Keyboard likely open if height reduced by more than 150px
      }
    };
    
    checkMobile();
    checkKeyboard();
    
    window.addEventListener('resize', checkMobile);
    window.visualViewport?.addEventListener('resize', checkKeyboard);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.visualViewport?.removeEventListener('resize', checkKeyboard);
    };
  }, [isMobile]);

  // Define core menu items - simplified for Gemini-style UX
  const menuItems: RadialMenuItem[] = [
    {
      id: 'chat-voice',
      icon: Mic,
      label: 'Voice Chat',
      shortcut: 'V',
      description: 'Talk to AI naturally',
      color: 'from-green-500 to-green-600',
      mode: 'voice',
      angle: 270
    },
    {
      id: 'webcam',
      icon: Camera,
      label: 'Video Chat',
      shortcut: 'W',
      description: 'Show and tell with AI',
      color: 'from-blue-500 to-blue-600',
      mode: 'video',
      angle: 315
    },
    {
      id: 'screen',
      icon: Monitor,
      label: 'Screen Share',
      shortcut: 'S',
      description: 'Share your screen',
      color: 'from-purple-500 to-purple-600',
      mode: 'screen',
      angle: 0
    },
    {
      id: 'document',
      icon: FileText,
      label: 'Documents',
      shortcut: 'D',
      description: 'Upload and analyze files',
      color: 'from-orange-500 to-orange-600',
      mode: 'text',
      angle: 45
    }
  ];

  // Calculate item positions with mobile optimization - tighter radius for fewer items
  const getItemPosition = (angle: number, radius: number = isMobile ? 70 : 95) => {
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    return { x, y };
  };

  // Handle tool selection
  const handleToolSelect = (item: RadialMenuItem) => {
    if (item.mode) {
      onModeChange(item.mode);
    }
    onToolSelect(item.id);
    setIsOpen(false);
  };

  // Check if item is active
  const isActiveItem = (item: RadialMenuItem) => {
    return (
      (activeFeature === item.id.replace('chat-', '')) ||
      (item.mode && activeInputMode === item.mode) ||
      (item.id === 'chat-text' && activeFeature === 'chat' && activeInputMode === 'text') ||
      (item.id === 'chat-voice' && activeInputMode === 'voice')
    );
  };

  // Get current active color
  const getActiveColor = () => {
    const activeItem = menuItems.find(item => isActiveItem(item));
    if (activeInputMode === 'voice') return 'from-green-500 to-green-600';
    if (activeInputMode === 'video') return 'from-purple-500 to-purple-600';
    if (activeInputMode === 'screen') return 'from-orange-500 to-orange-600';
    return activeItem?.color || 'from-gray-500 to-gray-600';
  };

  // Keyboard shortcuts and global shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Global shortcut: Space + Space to open menu (when not in input)
      if (e.code === 'Space' && !isOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
          return;
        }
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      const item = menuItems.find(item => 
        item.shortcut?.toLowerCase() === e.key.toLowerCase()
      );
      if (item) {
        handleToolSelect(item);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, menuItems]);

  // Auto-close on outside click (mobile friendly)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-radial-menu]')) {
        setIsOpen(false);
      }
    };

    // Delay to avoid immediate closing on open
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render if keyboard is open on mobile to avoid conflicts
  if (isMobile && isKeyboardOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed z-50 ${className}`}
      data-radial-menu
      style={{
        bottom: isMobile 
          ? `max(6rem, calc(env(safe-area-inset-bottom) + 6rem))`
          : '2rem',
        right: isMobile 
          ? `max(1rem, calc(env(safe-area-inset-right) + 1rem))`
          : '2rem',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      {/* Background overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              size="lg"
              className={`
                modern-button relative ${isMobile ? 'size-14' : 'size-16'} rounded-full p-0 shadow-2xl
                bg-gradient-to-r ${getActiveColor()}
                text-white border-2 border-white/20
                hover:border-white/40 transition-all duration-300
                holo-glow-lg
              `}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="size-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Zap className="size-6" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active indicator */}
              {streamingState.isConnected && (
                <motion.div
                  className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-green-400 rounded-full border-2 border-white`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}

              {/* Glow effect */}
              <div className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-r ${getActiveColor()} blur-xl opacity-50`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            <div className="text-center">
              <div>AI Tools Menu</div>
              <div className="text-xs text-muted-foreground mt-1">
                Click to expand options
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </motion.div>

      {/* Radial Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-8 right-8">
            {menuItems.map((item, index) => {
              const position = getItemPosition(item.angle, isMobile ? 70 : 95);
              const Icon = item.icon;
              const isActive = isActiveItem(item);

              return (
                <motion.div
                  key={item.id}
                  className="absolute"
                  style={{
                    x: position.x,
                    y: -position.y, // Negative because CSS y is inverted
                  }}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    x: position.x,
                    y: -position.y,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.05,
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          onClick={() => handleToolSelect(item)}
                          size="sm"
                          variant={isActive ? "default" : "secondary"}
                          className={`
                            modern-button relative ${isMobile ? 'size-10' : 'size-12'} rounded-full p-0 shadow-lg
                            ${isActive 
                              ? `bg-gradient-to-r ${item.color} text-white border-2 border-white/30`
                              : 'bg-white/90 hover:bg-white text-gray-700 border border-gray-200'
                            }
                            backdrop-blur-sm transition-all duration-200
                          `}
                        >
                          <Icon className={isMobile ? "size-4" : "size-5"} />
                          
                          {/* Connection indicator for streaming modes */}
                          {streamingState.isConnected && item.mode && activeInputMode === item.mode && (
                            <div className={`absolute -top-0.5 -right-0.5 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-green-400 rounded-full animate-pulse border border-white`} />
                          )}

                          {/* Glow effect for active items */}
                          {isActive && (
                            <div className={`absolute inset-0 -z-10 rounded-full bg-gradient-to-r ${item.color} blur-md opacity-40`} />
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side={position.x < 0 ? "right" : "left"} 
                      className={position.x < 0 ? "ml-2" : "mr-2"}
                    >
                      <div className="text-center">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                        {item.shortcut && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.shortcut}
                          </Badge>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Quick access hints */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className={`absolute -top-16 ${isMobile ? 'right-0' : '-left-8'} text-center`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div className="text-xs text-muted-foreground bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
              {isMobile ? (
                <>
                  <div>Tap to start</div>
                  <div className="text-[10px] opacity-75 mt-0.5">Voice • Video • Screen</div>
                </>
              ) : (
                <>
                  <div>Press Space to start</div>
                  <div className="text-[10px] opacity-75 mt-0.5">Voice • Video • Screen • Files</div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};