import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// AI Capabilities
export type AICapability = 
  | 'document-analysis'
  | 'real-time-processing'
  | 'source-citation'
  | 'adaptive-learning'
  | 'image-processing'
  | 'web-preview'
  | 'data-persistence'
  | 'conversation-memory'
  | 'lead-scoring'
  | 'sentiment-analysis'
  | 'intent-recognition'
  | 'response-generation'
  | 'tool-coordination'
  | 'context-switching'
  | 'multi-turn-dialog'
  | 'business-intelligence';

// Conversation Stages
export type ConversationStage = 
  | 'greeting'
  | 'email-capture'
  | 'company-research'
  | 'problem-discovery'
  | 'solution-positioning'
  | 'consultation-booking'
  | 'follow-up';

export interface AISystemState {
  // Stage Management
  stageProgress: {
    current: number;
    completed: ConversationStage[];
    total: number;
  };
  
  // Capability Management
  capabilityUsage: {
    used: number;
    total: number;
    active: AICapability[];
    available: AICapability[];
  };
  
  // AI Processing State
  isProcessing: boolean;
  processingStage: string;
  confidence: number;
  
  // Conversation Intelligence
  conversationMetrics: {
    engagementScore: number;
    comprehensionLevel: number;
    responseQuality: number;
    contextRetention: number;
  };
  
  // Learning & Adaptation
  userPreferences: {
    communicationStyle: 'formal' | 'casual' | 'technical';
    responseLength: 'short' | 'medium' | 'detailed';
    industryFocus: string;
    technicalLevel: 'basic' | 'intermediate' | 'advanced';
  };
  
  // System Insights
  insights: {
    businessOpportunities: string[];
    automationPotential: number;
    roiProjections: {
      shortTerm: number;
      mediumTerm: number;
      longTerm: number;
    };
    implementationComplexity: 'low' | 'medium' | 'high';
  };
}

export interface AIActions {
  // Stage Management
  advanceStage: (stage?: ConversationStage) => void;
  completeStage: (stage: ConversationStage) => void;
  resetStageProgress: () => void;
  
  // Capability Management
  activateCapability: (capability: AICapability) => void;
  deactivateCapability: (capability: AICapability) => void;
  resetCapabilities: () => void;
  
  // AI Processing
  setProcessing: (processing: boolean, stage?: string) => void;
  updateConfidence: (confidence: number) => void;
  
  // Conversation Intelligence
  updateMetrics: (metrics: Partial<AISystemState['conversationMetrics']>) => void;
  
  // Learning & Adaptation
  updatePreferences: (preferences: Partial<AISystemState['userPreferences']>) => void;
  adaptToUserStyle: (messages: any[]) => void;
  
  // System Insights
  updateInsights: (insights: Partial<AISystemState['insights']>) => void;
  generateBusinessInsights: (conversationData: any) => void;
  
  // System Management
  updateSystem: (messages: any[]) => void;
  resetSystem: () => void;
}

export type AIStore = AISystemState & AIActions;

// Initial state
const initialState: AISystemState = {
  stageProgress: {
    current: 0,
    completed: [],
    total: 7,
  },
  
  capabilityUsage: {
    used: 0,
    total: 16,
    active: [],
    available: [
      'document-analysis',
      'real-time-processing',
      'source-citation',
      'adaptive-learning',
      'image-processing',
      'web-preview',
      'data-persistence',
      'conversation-memory',
      'lead-scoring',
      'sentiment-analysis',
      'intent-recognition',
      'response-generation',
      'tool-coordination',
      'context-switching',
      'multi-turn-dialog',
      'business-intelligence'
    ],
  },
  
  isProcessing: false,
  processingStage: '',
  confidence: 0,
  
  conversationMetrics: {
    engagementScore: 0,
    comprehensionLevel: 0,
    responseQuality: 0,
    contextRetention: 0,
  },
  
  userPreferences: {
    communicationStyle: 'casual',
    responseLength: 'medium',
    industryFocus: '',
    technicalLevel: 'intermediate',
  },
  
  insights: {
    businessOpportunities: [],
    automationPotential: 0,
    roiProjections: {
      shortTerm: 0,
      mediumTerm: 0,
      longTerm: 0,
    },
    implementationComplexity: 'medium',
  },
};

// Stage progression mapping
const stageOrder: ConversationStage[] = [
  'greeting',
  'email-capture',
  'company-research',
  'problem-discovery',
  'solution-positioning',
  'consultation-booking',
  'follow-up'
];

// Create the AI store
export const useAIStore = create<AIStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // Stage Management
      advanceStage: (stage) => set((state) => {
        if (stage) {
          const stageIndex = stageOrder.indexOf(stage);
          if (stageIndex > state.stageProgress.current) {
            state.stageProgress.current = stageIndex;
          }
        } else {
          if (state.stageProgress.current < state.stageProgress.total - 1) {
            state.stageProgress.current += 1;
          }
        }
      }),
      
      completeStage: (stage) => set((state) => {
        if (!state.stageProgress.completed.includes(stage)) {
          state.stageProgress.completed.push(stage);
        }
      }),
      
      resetStageProgress: () => set((state) => {
        state.stageProgress.current = 0;
        state.stageProgress.completed = [];
      }),
      
      // Capability Management
      activateCapability: (capability) => set((state) => {
        if (!state.capabilityUsage.active.includes(capability)) {
          state.capabilityUsage.active.push(capability);
          state.capabilityUsage.used = state.capabilityUsage.active.length;
        }
      }),
      
      deactivateCapability: (capability) => set((state) => {
        const index = state.capabilityUsage.active.indexOf(capability);
        if (index > -1) {
          state.capabilityUsage.active.splice(index, 1);
          state.capabilityUsage.used = state.capabilityUsage.active.length;
        }
      }),
      
      resetCapabilities: () => set((state) => {
        state.capabilityUsage.active = [];
        state.capabilityUsage.used = 0;
      }),
      
      // AI Processing
      setProcessing: (processing, stage = '') => set((state) => {
        state.isProcessing = processing;
        state.processingStage = stage;
      }),
      
      updateConfidence: (confidence) => set((state) => {
        state.confidence = Math.max(0, Math.min(100, confidence));
      }),
      
      // Conversation Intelligence
      updateMetrics: (metrics) => set((state) => {
        Object.assign(state.conversationMetrics, metrics);
      }),
      
      // Learning & Adaptation
      updatePreferences: (preferences) => set((state) => {
        Object.assign(state.userPreferences, preferences);
      }),
      
      adaptToUserStyle: (messages) => set((state) => {
        // Simple adaptation logic based on message patterns
        const userMessages = messages.filter(m => m.sender === 'user');
        
        if (userMessages.length > 0) {
          const avgLength = userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / userMessages.length;
          
          if (avgLength < 50) {
            state.userPreferences.responseLength = 'short';
          } else if (avgLength > 150) {
            state.userPreferences.responseLength = 'detailed';
          }
          
          // Check for technical language
          const technicalTerms = userMessages.some(msg => 
            /\b(API|ML|AI|algorithm|neural|automation|integration)\b/i.test(msg.content)
          );
          
          if (technicalTerms) {
            state.userPreferences.technicalLevel = 'advanced';
          }
        }
      }),
      
      // System Insights
      updateInsights: (insights) => set((state) => {
        Object.assign(state.insights, insights);
      }),
      
      generateBusinessInsights: (conversationData) => set((state) => {
        // Generate insights based on conversation data
        const messageCount = conversationData.messages?.length || 0;
        const engagement = Math.min(100, messageCount * 10);
        
        state.insights.automationPotential = Math.min(100, engagement + 20);
        state.insights.roiProjections.shortTerm = Math.round(engagement * 0.15);
        state.insights.roiProjections.mediumTerm = Math.round(engagement * 0.35);
        state.insights.roiProjections.longTerm = Math.round(engagement * 0.65);
        
        // Add business opportunities based on conversation context
        const opportunities = [
          'Process automation opportunities identified',
          'Customer service AI integration potential',
          'Data analysis and reporting optimization',
          'Workflow efficiency improvements available'
        ];
        
        state.insights.businessOpportunities = opportunities.slice(0, Math.max(1, Math.floor(engagement / 25)));
      }),
      
      // System Management
      updateSystem: (messages) => set((state) => {
        // Auto-activate relevant capabilities
        get().activateCapability('conversation-memory');
        get().activateCapability('response-generation');
        
        if (messages.length > 0) {
          get().activateCapability('context-switching');
          get().activateCapability('multi-turn-dialog');
        }
        
        if (messages.length > 3) {
          get().activateCapability('sentiment-analysis');
          get().activateCapability('intent-recognition');
        }
        
        if (messages.length > 5) {
          get().activateCapability('lead-scoring');
          get().activateCapability('business-intelligence');
        }
        
        // Update metrics based on conversation
        get().updateMetrics({
          engagementScore: Math.min(100, messages.length * 15),
          comprehensionLevel: Math.min(100, messages.length * 10 + 30),
          responseQuality: Math.min(100, messages.length * 8 + 40),
          contextRetention: Math.min(100, messages.length * 12 + 20),
        });
        
        // Adapt to user style
        get().adaptToUserStyle(messages);
        
        // Generate business insights
        get().generateBusinessInsights({ messages });
      }),
      
      resetSystem: () => set((state) => {
        Object.assign(state, initialState);
      }),
    })),
    {
      name: 'AI Elements Store',
    }
  )
);

// Utility selectors for AI store
export const useStageProgress = () => useAIStore((state) => state.stageProgress);
export const useCapabilityUsage = () => useAIStore((state) => state.capabilityUsage);
export const useAIProcessing = () => useAIStore((state) => ({
  isProcessing: state.isProcessing,
  processingStage: state.processingStage,
  confidence: state.confidence,
}));
export const useConversationMetrics = () => useAIStore((state) => state.conversationMetrics);
export const useUserPreferences = () => useAIStore((state) => state.userPreferences);
export const useBusinessInsights = () => useAIStore((state) => state.insights);