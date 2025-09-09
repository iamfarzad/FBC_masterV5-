import React from 'react';
import { PromptInput } from '../../ai-elements/conversation';
import { Button } from '../../ui/button';

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  voiceMode: boolean;
  onToggleVoice: () => void;
  onShowVoiceOverlay: () => void;
  onToolSelect: (toolId: string) => void;
  topSlot?: React.ReactNode;
}

export function ChatComposer({
  input,
  setInput,
  onSubmit,
  isLoading,
  voiceMode,
  onToggleVoice,
  onShowVoiceOverlay,
  onToolSelect,
  topSlot
}: ChatComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm">
      {/* Top Slot for suggestions/actions */}
      {topSlot && (
        <div className="px-6 py-3 border-b border-border">
          {topSlot}
        </div>
      )}

      {/* Main Composer */}
      <div className="px-6 py-4">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="relative">
            <PromptInput
              value={input}
              onChange={setInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about AI strategy, business automation, or upload documents..."
              disabled={isLoading}
              className="w-full min-h-[3rem] max-h-32 resize-none glass-card border-border focus:border-primary/50 rounded-lg px-4 py-3 pr-24"
              rows={1}
              style={{
                height: 'auto',
                overflowY: input.split('\n').length > 3 ? 'scroll' : 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />

            {/* Voice Button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={voiceMode ? onShowVoiceOverlay : onToggleVoice}
                className={`h-8 w-8 rounded-full transition-all ${
                  voiceMode 
                    ? 'bg-primary text-primary-foreground animate-pulse' 
                    : 'hover:bg-accent'
                }`}
                aria-label={voiceMode ? 'Open voice interface' : 'Enable voice mode'}
              >
                <svg 
                  className="w-4 h-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                  <line x1="8" x2="16" y1="22" y2="22"/>
                </svg>
              </Button>

              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 rounded-full glass-button"
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg 
                    className="w-4 h-4" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M22 2L11 13"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* Tool Quick Actions */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Quick tools:</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToolSelect('docs')}
              className="h-6 px-2 text-xs hover:text-foreground"
            >
              📄 Upload
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToolSelect('webcam')}
              className="h-6 px-2 text-xs hover:text-foreground"
            >
              📹 Webcam
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToolSelect('screen')}
              className="h-6 px-2 text-xs hover:text-foreground"
            >
              🖥️ Screen
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToolSelect('roi')}
              className="h-6 px-2 text-xs hover:text-foreground"
            >
              📊 ROI Calc
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}