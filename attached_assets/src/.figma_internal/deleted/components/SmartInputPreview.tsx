import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Target, Calendar } from 'lucide-react';

interface SmartInputPreviewProps {
  input: string;
  conversationState: any;
  isVisible: boolean;
}

export const SmartInputPreview: React.FC<SmartInputPreviewProps> = ({
  input,
  conversationState,
  isVisible
}) => {
  const [predictions, setPredictions] = useState<Array<{
    type: 'insight' | 'action' | 'question' | 'booking';
    confidence: number;
    preview: string;
    icon: React.ComponentType;
  }>>([]);

  useEffect(() => {
    if (input.length > 10) {
      // Simulate AI prediction
      const mockPredictions = [
        {
          type: 'insight' as const,
          confidence: 0.8,
          preview: 'I\'ll analyze your automation needs...',
          icon: Brain
        },
        {
          type: 'action' as const,
          confidence: 0.6,
          preview: 'Ready to suggest specific solutions',
          icon: Target
        }
      ];
      setPredictions(mockPredictions);
    } else {
      setPredictions([]);
    }
  }, [input]);

  if (!isVisible || predictions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 animate-smooth-fade-in">
      <div className="holo-card rounded-2xl p-4 backdrop-blur-xl">
        <div className="text-xs text-muted-foreground mb-3 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
          AI Preview
        </div>
        <div className="space-y-2">
          {predictions.map((pred, index) => {
            const Icon = pred.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg holo-border transition-all duration-300"
                style={{
                  opacity: pred.confidence,
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="p-1 rounded-full bg-primary/10">
                  <Icon className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground/80">{pred.preview}</span>
                <div className="ml-auto">
                  <div className="w-12 h-1 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${pred.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};