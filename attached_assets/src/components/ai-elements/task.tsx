import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface TaskProps {
  id: string;
  title: string;
  completed: boolean;
  className?: string;
  onToggle?: (taskId: string) => void;
}

export const Task: React.FC<TaskProps> = ({ 
  id, 
  title, 
  completed, 
  className = '',
  onToggle
}) => {
  const handleClick = () => {
    if (onToggle) {
      onToggle(id);
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-lg glass-card hover:scale-105 transition-all duration-200 ${onToggle ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {completed ? (
        <CheckCircle className="w-3 h-3 text-primary" />
      ) : (
        <Circle className="w-3 h-3 text-muted-foreground" />
      )}
      <span className={completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
        {title}
      </span>
    </div>
  );
};