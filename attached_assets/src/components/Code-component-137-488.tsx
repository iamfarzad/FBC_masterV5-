"use client"

import React from 'react';
import { motion } from 'motion/react';
import { ErrorBoundary } from 'react-error-boundary';

interface UnifiedChatLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  composer?: React.ReactNode;
  overlays?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-card p-8 max-w-md mx-auto text-center">
        <h2 className="text-xl font-medium mb-4 text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="glass-button px-4 py-2 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function UnifiedChatLayout({
  header,
  sidebar,
  children,
  composer,
  overlays,
  disabled = false,
  className = ""
}: UnifiedChatLayoutProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <div 
        className={`min-h-screen bg-background relative ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
        role="application"
        aria-label="AI Chat Interface"
      >
        {/* Header */}
        {header && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-40"
          >
            {header}
          </motion.header>
        )}

        {/* Sidebar */}
        {sidebar && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-0 right-0 bottom-0 z-30 w-80 lg:w-96"
          >
            {sidebar}
          </motion.aside>
        )}

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col min-h-screen"
          role="main"
        >
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </motion.main>

        {/* Composer */}
        {composer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-20"
          >
            {composer}
          </motion.div>
        )}

        {/* Overlays */}
        {overlays && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="pointer-events-auto">
              {overlays}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}