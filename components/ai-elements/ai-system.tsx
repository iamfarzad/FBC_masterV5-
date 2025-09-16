import React from 'react';
import { 
  MessageSquare, 
  User, 
  Mail, 
  Search, 
  Target, 
  Presentation, 
  Calendar,
  Brain,
  Wrench,
  FileText,
  Image,
  Link,
  Code,
  CheckCircle,
  Loader,
  Eye,
  Zap,
  Database,
  Shield
} from 'lucide-react';

// AI Element Types and Capabilities
export interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'core' | 'analysis' | 'generation' | 'integration';
  used: boolean;
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export interface ConversationStage {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  aiElements: string[]; // Which AI capabilities are typically used in this stage
  completed: boolean;
  active: boolean;
  requirements: string[];
}

// Define AI Capabilities based on your AI Elements
export const AI_CAPABILITIES: AICapability[] = [
  // Core AI Elements
  {
    id: 'message-processing',
    name: 'Message Processing',
    description: 'Advanced natural language understanding and response generation',
    icon: MessageSquare,
    category: 'core',
    used: false,
    complexity: 'basic'
  },
  {
    id: 'conversation-context',
    name: 'Conversation Context',
    description: 'Maintains conversation state and context awareness',
    icon: Brain,
    category: 'core',
    used: false,
    complexity: 'intermediate'
  },
  {
    id: 'response-generation',
    name: 'Response Generation',
    description: 'Dynamic, contextual response creation with personality',
    icon: Zap,
    category: 'generation',
    used: false,
    complexity: 'advanced'
  },
  {
    id: 'suggestion-engine',
    name: 'Suggestion Engine',
    description: 'Intelligent conversation flow suggestions and prompts',
    icon: Target,
    category: 'generation',
    used: false,
    complexity: 'intermediate'
  },
  
  // Analysis AI Elements
  {
    id: 'task-management',
    name: 'Task Management',
    description: 'Tracks conversation tasks and completion states',
    icon: CheckCircle,
    category: 'analysis',
    used: false,
    complexity: 'basic'
  },
  {
    id: 'tool-integration',
    name: 'Tool Integration',
    description: 'Seamless integration with business tools and services',
    icon: Wrench,
    category: 'integration',
    used: false,
    complexity: 'advanced'
  },
  {
    id: 'document-analysis',
    name: 'Document Analysis',
    description: 'PDF, DOC, and text file processing and insights',
    icon: FileText,
    category: 'analysis',
    used: false,
    complexity: 'intermediate'
  },
  {
    id: 'image-processing',
    name: 'Image Processing',
    description: 'Visual content analysis and description generation',
    icon: Image,
    category: 'analysis',
    used: false,
    complexity: 'advanced'
  },
  {
    id: 'source-citation',
    name: 'Source Citation',
    description: 'Automatic source tracking and citation generation',
    icon: Link,
    category: 'analysis',
    used: false,
    complexity: 'basic'
  },
  {
    id: 'code-analysis',
    name: 'Code Analysis',
    description: 'Technical code review and optimization suggestions',
    icon: Code,
    category: 'analysis',
    used: false,
    complexity: 'advanced'
  },
  
  // Generation AI Elements
  {
    id: 'web-preview',
    name: 'Web Preview',
    description: 'Dynamic web content generation and preview',
    icon: Eye,
    category: 'generation',
    used: false,
    complexity: 'intermediate'
  },
  {
    id: 'action-suggestions',
    name: 'Action Suggestions',
    description: 'Context-aware action recommendations',
    icon: Zap,
    category: 'generation',
    used: false,
    complexity: 'basic'
  },
  
  // Integration AI Elements
  {
    id: 'data-persistence',
    name: 'Data Persistence',
    description: 'Conversation and insight storage across sessions',
    icon: Database,
    category: 'integration',
    used: false,
    complexity: 'intermediate'
  },
  {
    id: 'security-compliance',
    name: 'Security Compliance',
    description: 'Enterprise-grade security and privacy protection',
    icon: Shield,
    category: 'integration',
    used: false,
    complexity: 'advanced'
  },
  {
    id: 'real-time-processing',
    name: 'Real-time Processing',
    description: 'Streaming responses and live conversation updates',
    icon: Loader,
    category: 'core',
    used: false,
    complexity: 'advanced'
  },
  {
    id: 'adaptive-learning',
    name: 'Adaptive Learning',
    description: 'Learns from conversation patterns to improve responses',
    icon: Brain,
    category: 'core',
    used: false,
    complexity: 'advanced'
  }
];

// Define Conversation Stages based on business consultation flow
export const CONVERSATION_STAGES: ConversationStage[] = [
  {
    id: 1,
    name: "Initial Contact & Rapport",
    description: "Building trust and establishing communication foundation",
    icon: MessageSquare,
    aiElements: ['message-processing', 'conversation-context', 'response-generation'],
    completed: false,
    active: false,
    requirements: ['Greeting exchange', 'Basic information gathering', 'Trust establishment']
  },
  {
    id: 2,
    name: "Identity & Role Mapping", 
    description: "Understanding stakeholder roles and decision-making authority",
    icon: User,
    aiElements: ['message-processing', 'conversation-context', 'task-management', 'suggestion-engine'],
    completed: false,
    active: false,
    requirements: ['Role identification', 'Authority level assessment', 'Stakeholder mapping']
  },
  {
    id: 3,
    name: "Permission & Research Setup",
    description: "Gaining consent for deeper analysis and data collection",
    icon: Mail,
    aiElements: ['security-compliance', 'data-persistence', 'document-analysis', 'source-citation'],
    completed: false,
    active: false,
    requirements: ['Consent acquisition', 'Privacy explanation', 'Research framework setup']
  },
  {
    id: 4,
    name: "Market Intelligence Analysis",
    description: "Competitive landscape analysis and industry research",
    icon: Search,
    aiElements: ['document-analysis', 'web-preview', 'source-citation', 'data-persistence', 'real-time-processing'],
    completed: false,
    active: false,
    requirements: ['Industry analysis', 'Competitor research', 'Market positioning']
  },
  {
    id: 5,
    name: "Requirements Discovery",
    description: "Deep-dive into pain points and specific business needs",
    icon: Target,
    aiElements: ['conversation-context', 'task-management', 'adaptive-learning', 'suggestion-engine'],
    completed: false,
    active: false,
    requirements: ['Pain point identification', 'Need prioritization', 'Impact assessment']
  },
  {
    id: 6,
    name: "Solution Architecture",
    description: "Tailored AI solution design and value proposition",
    icon: Presentation,
    aiElements: ['code-analysis', 'tool-integration', 'web-preview', 'action-suggestions', 'image-processing'],
    completed: false,
    active: false,
    requirements: ['Solution design', 'Value proposition', 'Implementation roadmap']
  },
  {
    id: 7,
    name: "Commitment & Next Steps",
    description: "Decision facilitation and concrete next actions",
    icon: Calendar,
    aiElements: ['action-suggestions', 'task-management', 'tool-integration', 'data-persistence'],
    completed: false,
    active: false,
    requirements: ['Decision facilitation', 'Next steps planning', 'Commitment securing']
  }
];

// AI System State Management
export class AIElementsSystem {
  private capabilities: Map<string, AICapability>;
  private stages: ConversationStage[];
  private currentStageIndex: number = 1;
  
  constructor() {
    this.capabilities = new Map(AI_CAPABILITIES.map(cap => [cap.id, { ...cap }]));
    this.stages = CONVERSATION_STAGES.map(stage => ({ ...stage }));
    this.stages[0].active = true; // Start with first stage active
  }

  // Capability Management
  activateCapability(capabilityId: string): void {
    const capability = this.capabilities.get(capabilityId);
    if (capability) {
      capability.used = true;
      this.capabilities.set(capabilityId, capability);
    }
  }

  getActiveCapabilities(): AICapability[] {
    return Array.from(this.capabilities.values()).filter(cap => cap.used);
  }

  getCapabilityUsageByCategory(category: AICapability['category']): { used: number; total: number } {
    const categoryCapabilities = Array.from(this.capabilities.values()).filter(cap => cap.category === category);
    const usedCount = categoryCapabilities.filter(cap => cap.used).length;
    return { used: usedCount, total: categoryCapabilities.length };
  }

  getTotalCapabilityUsage(): { used: number; total: number } {
    const totalCapabilities = this.capabilities.size;
    const usedCapabilities = this.getActiveCapabilities().length;
    return { used: usedCapabilities, total: totalCapabilities };
  }

  // Stage Management
  getCurrentStage(): ConversationStage {
    return this.stages[this.currentStageIndex - 1];
  }

  advanceStage(): void {
    if (this.currentStageIndex < this.stages.length) {
      // Mark current stage as completed
      this.stages[this.currentStageIndex - 1].completed = true;
      this.stages[this.currentStageIndex - 1].active = false;
      
      // Activate capabilities typically used in completed stage
      const currentStage = this.stages[this.currentStageIndex - 1];
      currentStage.aiElements.forEach(elementId => {
        this.activateCapability(elementId);
      });
      
      // Move to next stage
      this.currentStageIndex++;
      if (this.currentStageIndex <= this.stages.length) {
        this.stages[this.currentStageIndex - 1].active = true;
      }
    }
  }

  setStageIndex(index: number): void {
    if (index >= 1 && index <= this.stages.length) {
      // Deactivate current stage
      this.stages[this.currentStageIndex - 1].active = false;
      
      // Set new stage
      this.currentStageIndex = index;
      this.stages[this.currentStageIndex - 1].active = true;
      
      // Mark previous stages as completed and activate their capabilities
      for (let i = 0; i < this.currentStageIndex - 1; i++) {
        this.stages[i].completed = true;
        this.stages[i].aiElements.forEach(elementId => {
          this.activateCapability(elementId);
        });
      }
    }
  }

  getStageProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentStageIndex,
      total: this.stages.length,
      percentage: Math.round((this.currentStageIndex / this.stages.length) * 100)
    };
  }

  // Message Analysis for Stage Progression
  analyzeMessageForProgression(message: string, messageCount: number): void {
    // Auto-advance stages based on conversation content and count
    if (messageCount <= 2 && this.currentStageIndex === 1) {
      // Stay in initial contact
      this.activateCapability('message-processing');
      this.activateCapability('conversation-context');
    } else if (messageCount <= 4 && this.currentStageIndex <= 2) {
      this.setStageIndex(2);
      this.activateCapability('response-generation');
    } else if (messageCount <= 6 && this.currentStageIndex <= 3) {
      this.setStageIndex(3);
      this.activateCapability('security-compliance');
    } else if (messageCount <= 8 && this.currentStageIndex <= 4) {
      this.setStageIndex(4);
      this.activateCapability('document-analysis');
      this.activateCapability('real-time-processing');
    } else if (messageCount <= 11 && this.currentStageIndex <= 5) {
      this.setStageIndex(5);
      this.activateCapability('adaptive-learning');
    } else if (messageCount <= 14 && this.currentStageIndex <= 6) {
      this.setStageIndex(6);
      this.activateCapability('tool-integration');
    } else if (this.currentStageIndex < 7) {
      this.setStageIndex(7);
    }

    // Activate capabilities based on message content
    this.analyzeMessageContent(message);
  }

  private analyzeMessageContent(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Email/contact related
    if (lowerMessage.includes('email') || lowerMessage.includes('@')) {
      this.activateCapability('data-persistence');
    }
    
    // Document/file related
    if (lowerMessage.includes('document') || lowerMessage.includes('file') || lowerMessage.includes('pdf')) {
      this.activateCapability('document-analysis');
    }
    
    // Analysis/research related
    if (lowerMessage.includes('analyze') || lowerMessage.includes('research') || lowerMessage.includes('competitor')) {
      this.activateCapability('source-citation');
      this.activateCapability('web-preview');
    }
    
    // Task/action related
    if (lowerMessage.includes('task') || lowerMessage.includes('action') || lowerMessage.includes('next step')) {
      this.activateCapability('task-management');
      this.activateCapability('action-suggestions');
    }
    
    // Technical/code related
    if (lowerMessage.includes('code') || lowerMessage.includes('technical') || lowerMessage.includes('api')) {
      this.activateCapability('code-analysis');
    }
    
    // Always activate suggestion engine when there's active conversation
    this.activateCapability('suggestion-engine');
  }

  // Export current state
  getSystemState() {
    const capabilityUsage = this.getTotalCapabilityUsage();
    const stageProgress = this.getStageProgress();
    
    return {
      currentStage: this.getCurrentStage(),
      stageProgress,
      capabilityUsage,
      activeCapabilities: this.getActiveCapabilities(),
      allCapabilities: Array.from(this.capabilities.values()),
      allStages: this.stages,
      intelligenceScore: Math.min(
        Math.round(stageProgress.percentage * 0.7 + (capabilityUsage.used / capabilityUsage.total) * 100 * 0.3),
        100
      )
    };
  }
}

// React Hook for AI Elements Integration
export const useAIElementsSystem = () => {
  const [aiSystem] = React.useState(() => new AIElementsSystem());
  const [systemState, setSystemState] = React.useState(aiSystem.getSystemState());

  const updateSystem = React.useCallback((messages: any[] = []) => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'user') {
        aiSystem.analyzeMessageForProgression(lastMessage.content || '', messages.length);
      }
    }
    setSystemState(aiSystem.getSystemState());
  }, [aiSystem]);

  const activateCapability = React.useCallback((capabilityId: string) => {
    aiSystem.activateCapability(capabilityId);
    setSystemState(aiSystem.getSystemState());
  }, [aiSystem]);

  const advanceStage = React.useCallback(() => {
    aiSystem.advanceStage();
    setSystemState(aiSystem.getSystemState());
  }, [aiSystem]);

  return {
    systemState,
    updateSystem,
    activateCapability,
    advanceStage,
    aiSystem
  };
};
