import React from 'react';
import { motion } from 'motion/react';
import { Check, User, Mail, Search, Target, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Badge } from './ui/badge';

interface ConversationProgressProps {
  currentStage: string;
  hasName?: boolean;
  hasEmail?: boolean;
  hasChallenge?: boolean;
  hasPreference?: boolean;
  className?: string;
}

const stages = [
  { 
    id: 'greeting', 
    icon: User, 
    label: 'Introduction',
    title: 'Welcome & Introduction',
    description: 'Getting to know you and understanding your initial needs',
    details: [
      'Personal introduction and name collection',
      'Initial rapport building',
      'Setting conversation expectations'
    ]
  },
  { 
    id: 'email_request', 
    icon: Mail, 
    label: 'Contact Info',
    title: 'Contact Information',
    description: 'Collecting your email for personalized follow-up',
    details: [
      'Email address collection',
      'Company domain analysis',
      'Contact preferences setup'
    ]
  },
  { 
    id: 'discovery', 
    icon: Search, 
    label: 'Discovery',
    title: 'Needs Discovery',
    description: 'Understanding your business challenges and opportunities',
    details: [
      'Current pain points identification',
      'Business process analysis',
      'AI implementation readiness assessment'
    ]
  },
  { 
    id: 'solution_positioning', 
    icon: Target, 
    label: 'Solutions',
    title: 'Solution Positioning',
    description: 'Matching the right AI solutions to your specific needs',
    details: [
      'Custom solution recommendations',
      'Service option presentation',
      'ROI and impact discussion'
    ]
  },
  { 
    id: 'booking_offer', 
    icon: Calendar, 
    label: 'Next Steps',
    title: 'Schedule Consultation',
    description: 'Booking your personalized AI strategy session',
    details: [
      'Calendar availability check',
      'Session preparation guidance',
      'Follow-up materials delivery'
    ]
  }
];

export const ConversationProgress: React.FC<ConversationProgressProps> = ({
  currentStage,
  hasName,
  hasEmail,
  hasChallenge,
  hasPreference,
  className = ""
}) => {
  const getStageStatus = (stageId: string) => {
    switch (stageId) {
      case 'greeting':
        return hasName ? 'complete' : (currentStage === 'greeting' ? 'active' : 'pending');
      case 'email_request':
        return hasEmail ? 'complete' : (['email_request', 'email_collected'].includes(currentStage) ? 'active' : 'pending');
      case 'discovery':
        return hasChallenge ? 'complete' : (currentStage === 'discovery' ? 'active' : 'pending');
      case 'solution_positioning':
        return hasPreference ? 'complete' : (currentStage === 'solution_positioning' ? 'active' : 'pending');
      case 'booking_offer':
        return currentStage === 'booking_offer' ? 'active' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const status = getStageStatus(stage.id);
        
        return (
          <React.Fragment key={stage.id}>
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="relative flex items-center cursor-pointer">
                  <motion.div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-105 ${
                      status === 'complete' 
                        ? 'bg-primary border-primary text-primary-foreground holo-glow' 
                        : status === 'active'
                        ? 'border-primary bg-primary/10 text-primary holo-glow'
                        : 'border-muted text-muted-foreground bg-background hover:border-primary/50'
                    }`}
                    animate={status === 'active' ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {status === 'complete' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </motion.div>
                  
                  {/* Stage label */}
                  <motion.div
                    className={`absolute ${className?.includes('flex-col') ? 'left-12 top-1/2 -translate-y-1/2' : 'top-10 left-1/2 -translate-x-1/2'} text-xs whitespace-nowrap transition-colors duration-300 ${
                      status === 'complete' || status === 'active' 
                        ? 'text-foreground' 
                        : 'text-muted-foreground'
                    }`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {stage.label}
                  </motion.div>
                </div>
              </HoverCardTrigger>
              
              <HoverCardContent 
                side="right" 
                align="center"
                className="w-80 holo-card border-0 p-6 ml-4"
                sideOffset={8}
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                      status === 'complete' 
                        ? 'bg-primary text-primary-foreground' 
                        : status === 'active'
                        ? 'bg-primary/10 text-primary border border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {status === 'complete' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : status === 'active' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{stage.title}</h4>
                      <Badge 
                        variant={status === 'complete' ? 'default' : status === 'active' ? 'secondary' : 'outline'}
                        className="text-xs mt-1"
                      >
                        {status === 'complete' ? 'Completed' : status === 'active' ? 'In Progress' : 'Upcoming'}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Key Activities
                    </div>
                    <ul className="space-y-1">
                      {stage.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                            status === 'complete' ? 'bg-primary' : 'bg-muted-foreground/50'
                          }`} />
                          <span className="text-muted-foreground leading-relaxed">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Progress indicator */}
                  {status === 'active' && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="font-medium">Currently active</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </HoverCardContent>
            </HoverCard>
            
            {/* Progress line */}
            {index < stages.length - 1 && (
              <motion.div
                className={`bg-muted rounded-full overflow-hidden ${
                  className?.includes('flex-col') 
                    ? 'w-0.5 h-10' 
                    : 'h-0.5 w-10'
                }`}
              >
                <motion.div
                  className={`bg-primary ${
                    className?.includes('flex-col') 
                      ? 'w-full' 
                      : 'h-full'
                  }`}
                  initial={className?.includes('flex-col') ? { height: '0%' } : { width: '0%' }}
                  animate={className?.includes('flex-col') 
                    ? { height: getStageStatus(stages[index + 1].id) === 'complete' ? '100%' : '0%' }
                    : { width: getStageStatus(stages[index + 1].id) === 'complete' ? '100%' : '0%' }
                  }
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </motion.div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};