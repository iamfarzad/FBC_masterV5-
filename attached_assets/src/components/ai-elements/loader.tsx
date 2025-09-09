import React from 'react';

interface LoaderProps {
  type?: 'dots' | 'pulse' | 'wave' | 'scanner';
  className?: string;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  type = 'dots', 
  className = '',
  message = 'Thinking...'
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex items-center gap-1.5">
            {[0, 0.2, 0.4].map((delay, index) => (
              <div 
                key={index}
                className="w-2 h-2 glass-card rounded-full flex items-center justify-center" 
                style={{
                  animation: `typing-dots 1.4s ease-in-out infinite`,
                  animationDelay: `${delay}s`
                }}
              >
                <div className="w-1 h-1 bg-primary rounded-full" />
              </div>
            ))}
            {message && <span className="ml-2 text-sm text-muted-foreground tracking-wide">{message}</span>}
          </div>
        );
      
      case 'pulse':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            {message && <span className="text-sm text-muted-foreground">{message}</span>}
          </div>
        );
      
      case 'wave':
        return (
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-primary/60 animate-bounce"
                style={{
                  height: '8px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
            {message && <span className="ml-2 text-sm text-muted-foreground">{message}</span>}
          </div>
        );
      
      case 'scanner':
        return (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-1 bg-muted/20 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full w-2 bg-primary/60 rounded-full"
                style={{
                  animation: 'data-flow 2s ease-in-out infinite'
                }}
              />
            </div>
            {message && <span className="text-sm text-muted-foreground">{message}</span>}
          </div>
        );
      
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
            {message && <span className="text-sm text-muted-foreground">{message}</span>}
          </div>
        );
    }
  };

  return (
    <div className={`loader-container ${className}`}>
      {renderLoader()}
    </div>
  );
};