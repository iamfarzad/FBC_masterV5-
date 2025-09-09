import React from 'react';

interface ResponseProps {
  content?: string;
  className?: string;
  renderCodeBlock?: (props: any) => React.ReactNode;
  renderInlineCitation?: (props: any) => React.ReactNode;
}

export const Response: React.FC<ResponseProps> = ({ 
  content, 
  className = '',
  renderCodeBlock,
  renderInlineCitation
}) => {
  // Enhanced response rendering with support for code blocks and citations
  const processContent = (text: string) => {
    // Handle empty or undefined content
    if (!text || typeof text !== 'string') {
      return [<div key="empty">Processing...</div>];
    }
    
    // Simple processing for now - you can enhance this with markdown parsing
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Check for code blocks
      if (line.startsWith('```') && renderCodeBlock) {
        return renderCodeBlock({ 
          key: index,
          code: line.replace(/```/g, ''),
          language: 'javascript' // You can extract language from the line
        });
      }
      
      // Check for citations [1], [2], etc.
      if (line.includes('[') && line.includes(']') && renderInlineCitation) {
        return (
          <div key={index}>
            {line.split(/(\[\d+\])/).map((part, partIndex) => {
              if (part.match(/\[\d+\]/)) {
                return renderInlineCitation({ 
                  key: partIndex,
                  citation: part,
                  number: part.replace(/[\[\]]/g, '')
                });
              }
              return part;
            })}
          </div>
        );
      }
      
      return <div key={index}>{line}</div>;
    });
  };

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <div className="response-content">
        {processContent(content)}
      </div>
    </div>
  );
};