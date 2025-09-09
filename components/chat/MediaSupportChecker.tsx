import React, { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface MediaSupport {
  isSecure: boolean;
  hasGetUserMedia: boolean;
  hasScreenCapture: boolean;
  hasMediaRecorder: boolean;
}

interface MediaSupportCheckerProps {
  className?: string;
}

export const MediaSupportChecker: React.FC<MediaSupportCheckerProps> = ({ className = "" }) => {
  const [support, setSupport] = useState<MediaSupport | null>(null);

  useEffect(() => {
    const checkSupport = () => {
      const isSecure = window.isSecureContext;
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasScreenCapture = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
      const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

      setSupport({
        isSecure,
        hasGetUserMedia,
        hasScreenCapture,
        hasMediaRecorder
      });
    };

    checkSupport();
  }, []);

  if (!support) return null;

  const hasAllSupport = support.isSecure && support.hasGetUserMedia && support.hasScreenCapture && support.hasMediaRecorder;
  
  if (hasAllSupport) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle className="w-4 h-4 text-green-500" />
        <Badge variant="outline" className="text-xs holo-border bg-transparent text-green-600">
          All media features supported
        </Badge>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-medium">Media Feature Status</span>
      </div>
      
      <div className="space-y-1">
        {!support.isSecure && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-600">
              HTTPS required for media access
            </span>
          </div>
        )}
        
        {!support.hasGetUserMedia && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-600">
              getUserMedia not supported
            </span>
          </div>
        )}
        
        {!support.hasScreenCapture && (
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-yellow-600">
              Screen sharing not available
            </span>
          </div>
        )}
        
        {!support.hasMediaRecorder && (
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-yellow-600">
              Media recording not supported
            </span>
          </div>
        )}
      </div>
      
      {!support.isSecure && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded border">
          <strong>Tip:</strong> Use HTTPS or localhost for media features to work properly.
        </div>
      )}
    </div>
  );
};