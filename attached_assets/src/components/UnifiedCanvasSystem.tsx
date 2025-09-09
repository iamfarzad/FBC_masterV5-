"use client"

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { WebcamInterface } from './WebcamInterface';
import { ScreenShareInterface } from './ScreenShareInterface';

type CanvasToolType = 'webcam' | 'screen' | 'video' | 'pdf' | 'code' | 'webpreview' | 'research' | 'workshop' | null;

interface UnifiedCanvasSystemProps {
  activeTool: CanvasToolType;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  toolProps?: Record<string, any>;
  className?: string;
}

interface CanvasHeaderProps {
  title: string;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

function CanvasHeader({ title, onClose, onMinimize, isMinimized }: CanvasHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border glass-surface">
      <h3 className="font-medium text-foreground">{title}</h3>
      <div className="flex items-center gap-2">
        {onMinimize && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onMinimize}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function CanvasContent({ activeTool, toolProps, onClose }: { 
  activeTool: CanvasToolType; 
  toolProps?: Record<string, any>;
  onClose: () => void;
}) {
  const defaultProps = {
    isOpen: true,
    onClose,
    isMinimized: false,
    ...toolProps
  };

  switch (activeTool) {
    case 'webcam':
      return (
        <WebcamInterface
          {...defaultProps}
          analysisMode="business"
          hasOtherWidgets={false}
          onCameraSwitch={() => {}}
        />
      );

    case 'screen':
      return (
        <ScreenShareInterface
          {...defaultProps}
          analysisMode="workflow"
          hasOtherWidgets={false}
        />
      );

    case 'video':
      return (
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium mb-4">Video Processing</h3>
          <p className="text-muted-foreground mb-6">
            Redirecting to Video-to-App workshop...
          </p>
          <Button onClick={() => window.open('/workshop/video-to-app', '_blank')}>
            Open Workshop
          </Button>
        </div>
      );

    case 'pdf':
      return (
        <div className="h-full">
          {toolProps?.pdfUrl ? (
            <iframe
              src={toolProps.pdfUrl}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium mb-4">PDF Viewer</h3>
              <p className="text-muted-foreground">No PDF loaded</p>
            </div>
          )}
        </div>
      );

    case 'code':
      return (
        <div className="h-full p-6">
          <div className="glass-card p-6 h-full overflow-auto">
            <pre className="text-sm text-foreground font-mono">
              <code>{toolProps?.code || '// No code to display'}</code>
            </pre>
          </div>
        </div>
      );

    case 'webpreview':
      return (
        <div className="h-full">
          {toolProps?.url ? (
            <iframe
              src={toolProps.url}
              className="w-full h-full border-0"
              title="Web Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium mb-4">Web Preview</h3>
              <p className="text-muted-foreground">No URL loaded</p>
            </div>
          )}
        </div>
      );

    case 'research':
      return (
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium mb-4">Research Mode</h3>
          <p className="text-muted-foreground mb-6">
            Advanced research capabilities with source citation and web preview.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Button variant="outline" className="glass-button">
              Search Web
            </Button>
            <Button variant="outline" className="glass-button">
              Analyze Sources
            </Button>
            <Button variant="outline" className="glass-button">
              Generate Report
            </Button>
            <Button variant="outline" className="glass-button">
              Export Data
            </Button>
          </div>
        </div>
      );

    case 'workshop':
      return (
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium mb-4">AI Workshop</h3>
          <p className="text-muted-foreground mb-6">
            Interactive learning modules and educational content.
          </p>
          <Button onClick={() => window.open('/workshop', '_blank')}>
            Launch Workshop
          </Button>
        </div>
      );

    default:
      return (
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium mb-4">Canvas Tool</h3>
          <p className="text-muted-foreground">No tool selected</p>
        </div>
      );
  }
}

export function UnifiedCanvasSystem({
  activeTool,
  onClose,
  onMinimize,
  isMinimized = false,
  toolProps,
  className = ""
}: UnifiedCanvasSystemProps) {
  if (!activeTool) return null;

  const getToolTitle = (tool: CanvasToolType): string => {
    switch (tool) {
      case 'webcam': return 'Video Analysis';
      case 'screen': return 'Screen Share';
      case 'video': return 'Video Processing';
      case 'pdf': return 'PDF Viewer';
      case 'code': return 'Code Display';
      case 'webpreview': return 'Web Preview';
      case 'research': return 'Research Mode';
      case 'workshop': return 'AI Workshop';
      default: return 'Canvas Tool';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed inset-4 z-50 ${className}`}
      >
        <div className="glass-card h-full flex flex-col overflow-hidden shadow-2xl">
          <CanvasHeader
            title={getToolTitle(activeTool)}
            onClose={onClose}
            onMinimize={onMinimize}
            isMinimized={isMinimized}
          />
          
          <div className="flex-1 overflow-hidden">
            <CanvasContent
              activeTool={activeTool}
              toolProps={toolProps}
              onClose={onClose}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}