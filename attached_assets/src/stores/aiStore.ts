import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

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
    subscribeWithSelector(
      (set, get) => ({
      ...initialState,
      
      // Stage Management
      advanceStage: (stage) => set((state) => {
        const newProgress = { ...state.stageProgress };
        
        if (stage) {
          const stageIndex = stageOrder.indexOf(stage);
          if (stageIndex > newProgress.current) {
            newProgress.current = stageIndex;
          }
        } else {
          if (newProgress.current < newProgress.total - 1) {
            newProgress.current += 1;
          }
        }
        
        return { stageProgress: newProgress };
      }),
      
      completeStage: (stage) => set((state) => {
        const completed = [...state.stageProgress.completed];
        if (!completed.includes(stage)) {
          completed.push(stage);
        }
        return {
          stageProgress: { ...state.stageProgress, completed }
        };
      }),
      
      resetStageProgress: () => set(() => ({
        stageProgress: {
          current: 0,
          completed: [],
          total: 7
        }
      })),
      
      // Capability Management
      activateCapability: (capability) => set((state) => {
        const active = [...state.capabilityUsage.active];
        if (!active.includes(capability)) {
          active.push(capability);
        }
        return {
          capabilityUsage: {
            ...state.capabilityUsage,
            active,
            used: active.length
          }
        };
      }),
      
      deactivateCapability: (capability) => set((state) => {
        const active = state.capabilityUsage.active.filter(c => c !== capability);
        return {
          capabilityUsage: {
            ...state.capabilityUsage,
            active,
            used: active.length
          }
        };
      }),
      
      resetCapabilities: () => set((state) => ({
        capabilityUsage: {
          ...state.capabilityUsage,
          active: [],
          used: 0
        }
      })),
      
      // AI Processing
      setProcessing: (processing, stage = '') => set(() => ({
        isProcessing: processing,
        processingStage: stage
      })),
      
      updateConfidence: (confidence) => set(() => ({
        confidence: Math.max(0, Math.min(100, confidence))
      })),
      
      // Conversation Intelligence
      updateMetrics: (metrics) => set((state) => ({
        conversationMetrics: { ...state.conversationMetrics, ...metrics }
      })),
      
      // Learning & Adaptation
      updatePreferences: (preferences) => set((state) => ({
        userPreferences: { ...state.userPreferences, ...preferences }
      })),
      
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
      updateSystem: (messages) => {
        const state = get();
        const messageCount = messages.length;
        
        // Create updates object to batch all changes
        const updates: Partial<AISystemState> = {};
        
        // Auto-activate capabilities based on message count
        const newActiveCapabilities = [...state.capabilityUsage.active];
        
        if (!newActiveCapabilities.includes('conversation-memory')) {
          newActiveCapabilities.push('conversation-memory');
        }
        if (!newActiveCapabilities.includes('response-generation')) {
          newActiveCapabilities.push('response-generation');
        }
        
        if (messageCount > 0) {
          if (!newActiveCapabilities.includes('context-switching')) {
            newActiveCapabilities.push('context-switching');
          }
          if (!newActiveCapabilities.includes('multi-turn-dialog')) {
            newActiveCapabilities.push('multi-turn-dialog');
          }
        }
        
        if (messageCount > 3) {
          if (!newActiveCapabilities.includes('sentiment-analysis')) {
            newActiveCapabilities.push('sentiment-analysis');
          }
          if (!newActiveCapabilities.includes('intent-recognition')) {
            newActiveCapabilities.push('intent-recognition');
          }
        }
        
        if (messageCount > 5) {
          if (!newActiveCapabilities.includes('lead-scoring')) {
            newActiveCapabilities.push('lead-scoring');
          }
          if (!newActiveCapabilities.includes('business-intelligence')) {
            newActiveCapabilities.push('business-intelligence');
          }
        }
        
        // Update capability usage
        updates.capabilityUsage = {
          ...state.capabilityUsage,
          active: newActiveCapabilities,
          used: newActiveCapabilities.length
        };
        
        // Update conversation metrics
        updates.conversationMetrics = {
          engagementScore: Math.min(100, messageCount * 15),
          comprehensionLevel: Math.min(100, messageCount * 10 + 30),
          responseQuality: Math.min(100, messageCount * 8 + 40),
          contextRetention: Math.min(100, messageCount * 12 + 20),
        };
        
        // Adapt user preferences
        const userMessages = messages.filter(m => m.sender === 'user');
        if (userMessages.length > 0) {
          const avgLength = userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / userMessages.length;
          const preferences = { ...state.userPreferences };
          
          if (avgLength < 50) {
            preferences.responseLength = 'short';
          } else if (avgLength > 150) {
            preferences.responseLength = 'detailed';
          }
          
          const hasTechnicalTerms = userMessages.some(msg => 
            /\b(API|ML|AI|algorithm|neural|automation|integration)\b/i.test(msg.content)
          );
          
          if (hasTechnicalTerms) {
            preferences.technicalLevel = 'advanced';
          }
          
          updates.userPreferences = preferences;
        }
        
        // Generate business insights
        const engagement = Math.min(100, messageCount * 10);
        const opportunities = [
          'Process automation opportunities identified',
          'Customer service AI integration potential',
          'Data analysis and reporting optimization',
          'Workflow efficiency improvements available'
        ];
        
        updates.insights = {
          ...state.insights,
          automationPotential: Math.min(100, engagement + 20),
          roiProjections: {
            shortTerm: Math.round(engagement * 0.15),
            mediumTerm: Math.round(engagement * 0.35),
            longTerm: Math.round(engagement * 0.65),
          },
          businessOpportunities: opportunities.slice(0, Math.max(1, Math.floor(engagement / 25)))
        };
        
        // Apply all updates at once
        set(() => updates);
      },
      
      resetSystem: () => set(() => ({
        ...initialState
      })),
      }),
      {
        name: 'AI Elements Store',
      }
    )
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