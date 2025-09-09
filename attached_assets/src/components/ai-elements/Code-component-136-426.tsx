import React from 'react';

interface SuggestionProps {
  text: string;
  onClick: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export const Suggestion: React.FC<SuggestionProps> = ({ 
  text, 
  onClick, 
  className = '',
  disabled = false
}) => {
  return (
    <button
      onClick={() => !disabled && onClick(text)}
      disabled={disabled}
      className={`
        inline-flex items-center px-3 py-1.5 text-sm rounded-xl
        glass-button hover:scale-105 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-primary/20
        ${className}
      `}
    >
      {text}
    </button>
  );
};