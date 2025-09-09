import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

interface WebPreviewProps {
  url: string;
  title: string;
  description: string;
  image?: string;
  className?: string;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ 
  url, 
  title, 
  description, 
  image,
  className = '' 
}) => {
  return (
    <div className={`web-preview-container holo-border rounded-lg overflow-hidden hover:holo-glow transition-all duration-200 ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 hover:bg-background/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          {image && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted/30">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <h4 className="text-sm font-medium text-foreground truncate">
                {title}
              </h4>
              <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
              {description}
            </p>
            
            <div className="text-xs text-primary/70 truncate">
              {new URL(url).hostname}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};