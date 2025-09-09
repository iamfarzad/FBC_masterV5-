import React from 'react';
import { Zap } from 'lucide-react';
import { Loader } from '../ai-elements/loader';

interface EnhancedTypingIndicatorProps {
  assistantName: string;
  message?: string;
}

export const EnhancedTypingIndicator: React.FC<EnhancedTypingIndicatorProps> = ({ 
  assistantName, 
  message = "Processing your request..." 
}) => (
  <div className="animate-smooth-fade-in">
    <div className="flex justify-start">
      <div className="flex max-w-3xl gap-4">
        <div className="mt-8 flex size-10 flex-shrink-0 items-center justify-center rounded-full holo-card holo-glow">
          <Zap className="size-5 text-foreground" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-2 text-sm text-muted-foreground">
            {assistantName}
          </div>
          <div className="holo-card rounded-2xl rounded-tl-md px-6 py-4 scan-line">
            <Loader
              type="dots"
              className="text-foreground"
              message={message}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);