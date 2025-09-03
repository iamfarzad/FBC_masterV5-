'use client';

import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/src/core/utils';

export type ActionsProps = ComponentProps<'div'>;

export const Actions = ({ className, children, ...props }: ActionsProps) => (
  <div className={cn('flex items-center gap-1', className)} {...props}>
    {children}
  </div>
);

export type ActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

export const Action = ({
  tooltip,
  children,
  label,
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: ActionProps) => {
  const button = (
    <Button
      className={cn(
        'size-9 p-1.5 text-muted-foreground hover:text-foreground',
        className,
      )}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

// Suggestions Components
export type SuggestionsProps = ComponentProps<'div'>;

export const Suggestions = ({ className, children, ...props }: SuggestionsProps) => (
  <div className={cn('flex flex-wrap gap-2 mt-3', className)} {...props}>
    {children}
  </div>
);

export type SuggestionProps = {
  suggestion: string;
  onClick?: (suggestion: string) => void;
  className?: string;
};

export const Suggestion = ({ suggestion, onClick, className }: SuggestionProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={() => onClick?.(suggestion)}
    className={cn(
      'text-xs border-border/30 hover:border-accent/50 hover:bg-accent/10 rounded-xl',
      className
    )}
  >
    {suggestion}
  </Button>
);
