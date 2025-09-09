import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';

// Import ai-elements components
import { Conversation, Message, Response } from '../../ai-elements/conversation';
import { Loader } from '../../ai-elements/loader';

// Import types
import { ChatMessageUI, ConversationState } from '../types';

interface ChatMessagesProps {
  messages: ChatMessageUI[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onMessageAction: (action: string, messageId: string) => void;
  conversationState: ConversationState;
  emptyStateContent?: React.ReactNode;
}

export function ChatMessages({
  messages,
  isLoading,
  onSuggestionClick,
  onMessageAction,
  conversationState,
  emptyStateContent
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);

  // Auto-scroll management
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = React.useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsUserScrolling(!isNearBottom);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!isUserScrolling && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, isUserScrolling, scrollToBottom]);

  // Activity parsing from message content
  const parseActivities = (content: string) => {
    const activityRegex = /\[(ACTIVITY_IN|ACTIVITY_OUT):([^\]]+)\]/g;
    const activities = [];
    let match;
    
    while ((match = activityRegex.exec(content)) !== null) {
      activities.push({
        type: match[1] === 'ACTIVITY_IN' ? 'user_action' : 'ai_thinking',
        description: match[2],
        timestamp: new Date()
      });
    }
    
    return activities;
  };

  // Message copying functionality
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // Show toast notification
      console.log('Message copied to clipboard');
    });
  };

  // Translation functionality (placeholder)
  const handleTranslateMessage = (messageId: string) => {
    onMessageAction('translate', messageId);
  };

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto scrollbar-modern px-6 py-4"
      onScroll={handleScroll}
      style={{ 
        maxHeight: 'calc(100vh - 16rem)',
        scrollBehavior: 'smooth'
      }}
    >
      {messages.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center h-full">
          {emptyStateContent || (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full glass-card mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Welcome to AI Strategy Assistant</h3>
              <p className="text-muted-foreground">Start a conversation to begin your AI consultation</p>
            </div>
          )}
        </div>
      ) : (
        <Conversation className="space-y-6">
          {messages.map((message, index) => {
            const activities = parseActivities(message.content);
            
            return (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index === messages.length - 1 ? 0.1 : 0,
                  ease: "easeOut" 
                }}
              >
                <Message
                  sender={message.sender}
                  timestamp={message.timestamp}
                  className={message.sender === 'user' ? 'ml-8' : 'mr-8'}
                >
                  {message.sender === 'ai' ? (
                    <Response
                      content={message.content}
                      reasoning={message.reasoning}
                      suggestions={message.suggestions}
                      onSuggestionClick={onSuggestionClick}
                      activities={activities}
                      conversationState={conversationState}
                    />
                  ) : (
                    <div className="glass-card p-4 rounded-lg">
                      <p className="break-words">{message.content}</p>
                      
                      {/* Message Actions */}
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMessage(message.content)}
                          className="h-8 px-2"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTranslateMessage(message.id)}
                          className="h-8 px-2"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  )}
                </Message>
              </motion.div>
            );
          })}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mr-8"
            >
              <Message sender="ai" timestamp={new Date()}>
                <Loader className="p-4" />
              </Message>
            </motion.div>
          )}

          {/* Invisible scroll target */}
          <div ref={messagesEndRef} className="h-1" />
        </Conversation>
      )}

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {isUserScrolling && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-32 right-8 z-30"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => {
                      setIsUserScrolling(false);
                      scrollToBottom();
                    }}
                    size="sm"
                    className="h-10 w-10 rounded-full glass-button shadow-lg"
                    aria-label="Scroll to bottom"
                  >
                    <motion.div
                      animate={{ y: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m7 13 5 5 5-5M7 6l5 5 5-5"/>
                      </svg>
                    </motion.div>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>Scroll to latest message</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}