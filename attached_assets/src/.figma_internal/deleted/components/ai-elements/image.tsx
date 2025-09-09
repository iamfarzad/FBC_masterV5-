import React from 'react';
import { Download, Expand, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  showActions?: boolean;
  onExpand?: () => void;
  onDownload?: () => void;
}

export const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  caption,
  className = '',
  showActions = true,
  onExpand,
  onDownload
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = alt || 'image';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  if (error) {
    return (
      <div className={`image-error-container flex items-center justify-center p-8 holo-border rounded-lg bg-muted/20 ${className}`}>
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`image-container relative group ${className}`}>
      <div className="relative overflow-hidden rounded-lg holo-border">
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-auto transition-opacity duration-200 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {/* Actions Overlay */}
        {showActions && loaded && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-1">
              {onExpand && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onExpand}
                  className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                >
                  <Expand className="w-3 h-3" />
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className="mt-2 px-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};