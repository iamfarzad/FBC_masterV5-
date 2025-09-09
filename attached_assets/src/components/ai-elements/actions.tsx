import React from 'react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';

interface Action {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  disabled?: boolean;
}

interface ActionsProps {
  actions: Action[];
  className?: string;
  buttonClassName?: string;
}

export const Actions: React.FC<ActionsProps> = ({ 
  actions, 
  className = '',
  buttonClassName = ''
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={action.action}
              disabled={action.disabled}
              className={`h-7 w-7 p-0 glass-button text-muted-foreground hover:text-foreground ${buttonClassName}`}
              title={action.label}
            >
              <Icon className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};