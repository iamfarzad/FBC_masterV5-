import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ChatLayoutProps {
  children: React.ReactNode;
  disabled?: boolean;
}

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-card p-8 max-w-md text-center">
        <h2 className="text-xl font-medium mb-4 text-destructive">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="glass-button px-6 py-2 rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function ChatLayout({ children, disabled = false }: ChatLayoutProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div 
        className={`min-h-screen bg-background ${disabled ? 'opacity-75 pointer-events-none' : ''}`}
        role="application"
        aria-label="AI Lead Generation Chat Interface"
      >
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-border">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">AI</span>
              </div>
              <div>
                <h1 className="font-medium">AI Strategy Assistant</h1>
                <p className="text-xs text-muted-foreground">Lead Generation System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16">
          {children}
        </main>

        {/* Overlays Container */}
        <div id="overlays-root" />
      </div>
    </ErrorBoundary>
  );
}