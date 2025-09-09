import React from 'react';

interface MessageProps {
  content: string;
  timestamp: Date;
  className?: string;
}

export const Message: React.FC<MessageProps> = ({ content, timestamp, className = '' }) => {
  return (
    <div className={className}>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
};