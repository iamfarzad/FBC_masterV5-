"use client"

import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../ui/dropdown-menu';
import { 
  Camera, 
  Monitor, 
  FileUp, 
  Search, 
  Calculator,
  Video,
  Code,
  Globe,
  Mic,
  Settings,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';

interface ToolMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  category: 'capture' | 'analysis' | 'workspace' | 'settings';
  comingSoon?: boolean;
  badge?: string;
}

interface UnifiedToolMenuProps {
  onToolSelect: (toolId: string) => void;
  activeTools?: string[];
  disabled?: boolean;
  variant?: 'button' | 'icon';
  className?: string;
}

const TOOL_ITEMS: ToolMenuItem[] = [
  // Capture Tools
  {
    id: 'webcam',
    label: 'Video Analysis',
    icon: Camera,
    description: 'Capture and analyze video content',
    category: 'capture'
  },
  {
    id: 'screen',
    label: 'Screen Share',
    icon: Monitor,
    description: 'Share and analyze your screen',
    category: 'capture'
  },
  {
    id: 'voice',
    label: 'Voice Input',
    icon: Mic,
    description: 'Speech-to-text and AI conversation',
    category: 'capture'
  },
  
  // Analysis Tools
  {
    id: 'docs',
    label: 'Document Upload',
    icon: FileUp,
    description: 'Upload and analyze documents',
    category: 'analysis'
  },
  {
    id: 'research',
    label: 'Web Research',
    icon: Search,
    description: 'Search and analyze web content',
    category: 'analysis'
  },
  {
    id: 'roi',
    label: 'ROI Calculator',
    icon: Calculator,
    description: 'Calculate return on investment',
    category: 'analysis',
    badge: 'Popular'
  },
  
  // Workspace Tools
  {
    id: 'video',
    label: 'Video-to-App',
    icon: Video,
    description: 'Convert videos to applications',
    category: 'workspace'
  },
  {
    id: 'code',
    label: 'Code Display',
    icon: Code,
    description: 'Display and analyze code',
    category: 'workspace'
  },
  {
    id: 'webpreview',
    label: 'Web Preview',
    icon: Globe,
    description: 'Preview web content',
    category: 'workspace'
  },
  {
    id: 'workshop',
    label: 'AI Workshop',
    icon: Sparkles,
    description: 'Interactive learning modules',
    category: 'workspace',
    badge: 'New'
  },
  
  // Settings
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configure application settings',
    category: 'settings'
  }
];

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'capture': return 'Capture';
    case 'analysis': return 'Analysis';
    case 'workspace': return 'Workspace';
    case 'settings': return 'Settings';
    default: return 'Tools';
  }
};

const getToolIcon = (tool: ToolMenuItem, isActive: boolean) => {
  const IconComponent = tool.icon;
  return (
    <IconComponent 
      className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} 
    />
  );
};

export function UnifiedToolMenu({
  onToolSelect,
  activeTools = [],
  disabled = false,
  variant = 'button',
  className = ""
}: UnifiedToolMenuProps) {
  const handleToolClick = (toolId: string, comingSoon?: boolean) => {
    if (disabled || comingSoon) return;
    onToolSelect(toolId);
  };

  const groupedTools = TOOL_ITEMS.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, ToolMenuItem[]>);

  const categories = ['capture', 'analysis', 'workspace', 'settings'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === 'icon' ? 'ghost' : 'outline'}
          size={variant === 'icon' ? 'sm' : 'default'}
          disabled={disabled}
          className={`glass-button ${className}`}
        >
          <MoreHorizontal className="w-4 h-4" />
          {variant === 'button' && <span className="ml-2">Tools</span>}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 glass-card border-border"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-foreground">
          AI Tools & Capabilities
        </DropdownMenuLabel>
        
        {categories.map((category) => {
          const tools = groupedTools[category];
          if (!tools?.length) return null;
          
          return (
            <div key={category}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                {getCategoryLabel(category)}
              </DropdownMenuLabel>
              
              {tools.map((tool) => {
                const isActive = activeTools.includes(tool.id);
                
                return (
                  <DropdownMenuItem
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id, tool.comingSoon)}
                    disabled={tool.comingSoon}
                    className={`
                      flex items-start gap-3 p-3 cursor-pointer transition-colors
                      ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}
                      ${tool.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getToolIcon(tool, isActive)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {tool.label}
                        </span>
                        {tool.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
                            {tool.badge}
                          </span>
                        )}
                        {tool.comingSoon && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
                            Soon
                          </span>
                        )}
                      </div>
                      
                      {tool.description && (
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {tool.description}
                        </p>
                      )}
                    </div>
                    
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"
                      />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}