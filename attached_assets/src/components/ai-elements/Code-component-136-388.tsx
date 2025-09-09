import React from 'react';

interface ConversationProps {
  children: React.ReactNode;
  className?: string;
  conversationId: string;
  onMessageUpdate?: (messages: any[]) => void;
}

export const Conversation: React.FC<ConversationProps> = ({ 
  children, 
  className = '', 
  conversationId,
  onMessageUpdate 
}) => {
  // Enhanced conversation wrapper with holographic styling
  return (
    <div 
      className={`${className} conversation-wrapper`} 
      data-conversation-id={conversationId}
    >
      {children}
    </div>
  );
};