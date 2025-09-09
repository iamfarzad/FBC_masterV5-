import React from 'react';

interface InlineCitationProps {
  citation: string;
  number: string;
  className?: string;
  onClick?: (number: string) => void;
}

export const InlineCitation: React.FC<InlineCitationProps> = ({ 
  citation, 
  number, 
  className = '',
  onClick
}) => {
  return (
    <span
      className={`inline-citation inline-flex items-center justify-center w-4 h-4 text-xs bg-primary/10 text-primary rounded-full cursor-pointer hover:bg-primary/20 transition-colors ${className}`}
      onClick={() => onClick?.(number)}
      title={`Citation ${number}`}
    >
      {number}
    </span>
  );
};