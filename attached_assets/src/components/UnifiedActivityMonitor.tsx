"use client"

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  MessageSquare,
  Brain,
  Search,
  FileText,
  Camera,
  Monitor,
  Calculator,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

type ActivityType = 
  | 'user_action' 
  | 'ai_thinking' 
  | 'search' 
  | 'doc_analysis' 
  | 'video_analysis'
  | 'screen_analysis'
  | 'roi_calculation'
  | 'lead_scoring'
  | 'conversation_flow';

type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  status: ActivityStatus;
  progress?: number;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

interface UnifiedActivityMonitorProps {
  activities: Activity[];
  maxActivities?: number;
  showProgress?: boolean;
  className?: string;
  onActivityClick?: (activity: Activity) => void;
}

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  user_action: MessageSquare,
  ai_thinking: Brain,
  search: Search,
  doc_analysis: FileText,
  video_analysis: Camera,
  screen_analysis: Monitor,
  roi_calculation: Calculator,
  lead_scoring: TrendingUp,
  conversation_flow: CheckCircle
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  user_action: 'text-blue-500',
  ai_thinking: 'text-purple-500',
  search: 'text-green-500',
  doc_analysis: 'text-orange-500',
  video_analysis: 'text-red-500',
  screen_analysis: 'text-cyan-500',
  roi_calculation: 'text-yellow-500',
  lead_scoring: 'text-pink-500',
  conversation_flow: 'text-emerald-500'
};

const STATUS_ICONS = {
  pending: Clock,
  in_progress: Loader2,
  completed: CheckCircle,
  failed: AlertCircle
};

const STATUS_COLORS = {
  pending: 'text-gray-500',
  in_progress: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500'
};

function getActivityIcon(type: ActivityType, status: ActivityStatus) {
  if (status === 'in_progress') {
    return STATUS_ICONS.in_progress;
  }
  return ACTIVITY_ICONS[type] || MessageSquare;
}

function formatDuration(duration?: number): string {
  if (!duration) return '';
  if (duration < 1000) return `${duration}ms`;
  if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
  return `${(duration / 60000).toFixed(1)}m`;
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return timestamp.toLocaleDateString();
}

interface ActivityItemProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  showProgress?: boolean;
}

function ActivityItem({ activity, onClick, showProgress }: ActivityItemProps) {
  const IconComponent = getActivityIcon(activity.type, activity.status);
  const isClickable = !!onClick;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={isClickable ? { scale: 1.02 } : undefined}
      className={`
        glass-card p-4 space-y-3 transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}
      `}
      onClick={() => onClick?.(activity)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`flex-shrink-0 ${ACTIVITY_COLORS[activity.type]}`}>
            <IconComponent 
              className={`w-5 h-5 ${activity.status === 'in_progress' ? 'animate-spin' : ''}`} 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-foreground truncate">
                {activity.title}
              </h4>
              <Badge 
                variant={activity.status === 'completed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {activity.status.replace('_', ' ')}
              </Badge>
            </div>
            
            {activity.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activity.description}
              </p>
            )}
            
            {showProgress && activity.progress !== undefined && activity.status === 'in_progress' && (
              <div className="mt-2">
                <Progress value={activity.progress} className="h-1" />
                <span className="text-xs text-muted-foreground mt-1">
                  {activity.progress}% complete
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <span>{formatTimestamp(activity.timestamp)}</span>
          {activity.duration && (
            <span className="text-success">
              {formatDuration(activity.duration)}
            </span>
          )}
        </div>
      </div>
      
      {/* Progress Chain for Multi-step Activities */}
      {activity.metadata?.steps && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {activity.metadata.steps.map((step: any, index: number) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className={`w-2 h-2 rounded-full ${
                  step.completed ? 'bg-green-500' : 
                  step.active ? 'bg-blue-500 animate-pulse' : 
                  'bg-gray-300'
                }`} 
              />
              {index < activity.metadata.steps.length - 1 && (
                <div className="w-4 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function UnifiedActivityMonitor({
  activities,
  maxActivities = 10,
  showProgress = true,
  className = "",
  onActivityClick
}: UnifiedActivityMonitorProps) {
  const sortedActivities = [...activities]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxActivities);

  const activeCount = activities.filter(a => a.status === 'in_progress').length;
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const failedCount = activities.filter(a => a.status === 'failed').length;

  if (activities.length === 0) {
    return (
      <div className={`glass-card p-6 text-center ${className}`}>
        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-medium text-foreground mb-1">No Activities</h3>
        <p className="text-xs text-muted-foreground">
          AI activities will appear here as they happen
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">AI Activity Monitor</h3>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeCount} active
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {activities.length} total
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-500">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-500">{activeCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">{failedCount}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-modern">
        <AnimatePresence>
          {sortedActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onClick={onActivityClick}
              showProgress={showProgress}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}