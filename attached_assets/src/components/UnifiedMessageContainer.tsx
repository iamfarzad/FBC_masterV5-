"use client"

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UnifiedMessage, MessageData } from './UnifiedMessage';
import { LoadingIndicator } from './indicators/LoadingIndicator';

interface UnifiedMessageContainerProps {
  messages: MessageData[];
  isLoading?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
  onMessageAction?: (action: string, messageId: string) => void;
  onPlayMessage?: (messageId: string) => void;
  onStopMessage?: (messageId: string) => void;
  conversationState?: any;
  emptyState?: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
}

export function UnifiedMessageContainer({
  messages,
  isLoading = false,
  onSuggestionClick,
  onMessageAction,
  onPlayMessage,
  onStopMessage,
  conversationState,
  emptyState,
  className = "",
  autoScroll = true
}: UnifiedMessageContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Parse activities from message content
  const parseActivities = (content: string) => {
    const activityRegex = /\[(ACTIVITY_IN|ACTIVITY_OUT):([^\]]+)\]/g;
    const activities = [];
    let match;
    
    while ((match = activityRegex.exec(content)) !== null) {
      activities.push({
        type: match[1],
        content: match[2]
      });
    }
    
    return activities;
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleTranslateMessage = (messageId: string) => {
    // Implement translation logic
    onMessageAction?.('translate', messageId);
  };

  if (messages.length === 0 && !isLoading && emptyState) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        {emptyState}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`space-y-8 p-6 scrollbar-modern overflow-y-auto ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Conversation messages"
    >
      <AnimatePresence mode="wait">
        {messages.map((message, index) => {
          const activities = parseActivities(message.content);
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.4,
                delay: index === messages.length - 1 ? 0.1 : 0,
                ease: "easeOut"
              }}
              className="transform-gpu"
            >
              <UnifiedMessage
                message={message}
                onSuggestionClick={onSuggestionClick}
                onMessageAction={(action, messageId) => {
                  switch (action) {
                    case 'copy':
                      handleCopyMessage(message.content);
                      break;
                    case 'translate':
                      handleTranslateMessage(messageId);
                      break;
                    default:
                      onMessageAction?.(action, messageId);
                  }
                }}
                onPlayMessage={onPlayMessage}
                onStopMessage={onStopMessage}
                conversationState={conversationState}
              />
              
              {/* Activity indicators */}
              {activities.length > 0 && (
                <div className="mt-2 space-y-1">
                  {activities.map((activity, actIndex) => (
                    <motion.div
                      key={actIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'ACTIVITY_IN' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <span>{activity.content}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} className="h-1" aria-hidden="true" />
    </div>
  );
}