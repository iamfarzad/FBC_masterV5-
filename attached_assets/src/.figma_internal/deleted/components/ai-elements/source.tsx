import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SourceProps {
  title: string;
  url: string;
  excerpt: string;
  className?: string;
}

export const Source: React.FC<SourceProps> = ({ 
  title, 
  url, 
  excerpt, 
  className = '' 
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg glass-button hover:scale-105 transition-all duration-200 text-muted-foreground hover:text-foreground ${className}`}
      title={`${title} - ${excerpt}`}
    >
      <ExternalLink className="w-3 h-3" />
      <span className="truncate max-w-24 font-medium">{title}</span>
    </a>
  );
};