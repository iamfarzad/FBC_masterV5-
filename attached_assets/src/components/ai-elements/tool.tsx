import React from 'react';
import { CheckCircle, Wrench } from 'lucide-react';

interface ToolProps {
  name: string;
  description: string;
  used: boolean;
  className?: string;
}

export const Tool: React.FC<ToolProps> = ({ 
  name, 
  description, 
  used, 
  className = '' 
}) => {
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg glass-card hover:scale-105 transition-all duration-200 ${className}`} 
      title={description}
    >
      {used ? (
        <CheckCircle className="w-3 h-3 text-primary" />
      ) : (
        <Wrench className="w-3 h-3 text-muted-foreground" />
      )}
      <span className={used ? 'text-foreground font-medium' : 'text-muted-foreground'}>
        {name}
      </span>
    </span>
  );
};