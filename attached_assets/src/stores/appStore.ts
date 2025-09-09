import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { MessageData } from '../components/UnifiedMessage';

// Types
export interface ConversationState {
  leadScore: number;
  stage: string;
  email: string;
  company: string;
  industry: string;
  businessSize: string;
  painPoints: string[];
  interests: string[];
  budget: string;
  timeline: string;
  decisionMaker: boolean;
  contactPreference: string;
}

export interface AppState {
  // UI State
  theme: 'light' | 'dark';
  isLoading: boolean;
  isUserScrolling: boolean;
  input: string;
  
  // Messages & Conversation
  messages: MessageData[];
  conversationState: ConversationState;
  
  // Voice & Audio
  voiceMode: boolean;
  showVoiceOverlay: boolean;
  isVoiceMinimized: boolean;
  
  // Overlays & Modals
  showSettingsOverlay: boolean;
  showFileUpload: boolean;
  showBookingOverlay: boolean;
  
  // Multimodal Interfaces
  showWebcamInterface: boolean;
  isWebcamMinimized: boolean;
  cameraFacing: 'user' | 'environment';
  showScreenShareInterface: boolean;
  isScreenShareMinimized: boolean;
  
  // Tools & Canvas
  activeTools: string[];
  activeCanvasTool: string | null;
}

export interface AppActions {
  // Basic state updates
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setInput: (input: string) => void;
  setUserScrolling: (scrolling: boolean) => void;
  
  // Message management
  addMessage: (message: MessageData) => void;
  updateLastMessage: (updates: Partial<MessageData>) => void;
  clearMessages: () => void;
  
  // Conversation state
  updateConversationState: (updates: Partial<ConversationState>) => void;
  incrementLeadScore: (points: number) => void;
  setConversationStage: (stage: string) => void;
  
  // Voice controls
  toggleVoiceMode: () => void;
  setVoiceOverlay: (show: boolean) => void;
  setVoiceMinimized: (minimized: boolean) => void;
  
  // Overlay controls
  setSettingsOverlay: (show: boolean) => void;
  setFileUpload: (show: boolean) => void;
  setBookingOverlay: (show: boolean) => void;
  
  // Multimodal controls
  setWebcamInterface: (show: boolean) => void;
  setWebcamMinimized: (minimized: boolean) => void;
  toggleCameraFacing: () => void;
  setScreenShareInterface: (show: boolean) => void;
  setScreenShareMinimized: (minimized: boolean) => void;
  
  // Tool management
  toggleTool: (toolId: string) => void;
  setActiveCanvasTool: (tool: string | null) => void;
  
  // Bulk updates
  updateState: (updates: Partial<AppState>) => void;
  resetApp: () => void;
}

export type AppStore = AppState & AppActions;

// Initial state
const initialState: AppState = {
  // UI State
  theme: 'dark',
  isLoading: false,
  isUserScrolling: false,
  input: '',
  
  // Messages & Conversation
  messages: [],
  conversationState: {
    leadScore: 0,
    stage: 'greeting',
    email: '',
    company: '',
    industry: '',
    businessSize: '',
    painPoints: [],
    interests: [],
    budget: '',
    timeline: '',
    decisionMaker: false,
    contactPreference: 'email'
  },
  
  // Voice & Audio
  voiceMode: false,
  showVoiceOverlay: false,
  isVoiceMinimized: false,
  
  // Overlays & Modals
  showSettingsOverlay: false,
  showFileUpload: false,
  showBookingOverlay: false,
  
  // Multimodal Interfaces
  showWebcamInterface: false,
  isWebcamMinimized: false,
  cameraFacing: 'user',
  showScreenShareInterface: false,
  isScreenShareMinimized: false,
  
  // Tools & Canvas
  activeTools: [],
  activeCanvasTool: null,
};

// Create the store with middleware
export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
        ...initialState,
        
        // Basic state updates
        setTheme: (theme) => set(() => ({
          theme
        })),
        
        setLoading: (loading) => set(() => ({
          isLoading: loading
        })),
        
        setInput: (input) => set(() => ({
          input
        })),
        
        setUserScrolling: (scrolling) => set(() => ({
          isUserScrolling: scrolling
        })),
        
        // Message management
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, message]
        })),
        
        updateLastMessage: (updates) => set((state) => {
          const messages = [...state.messages];
          const lastIndex = messages.length - 1;
          if (lastIndex >= 0) {
            messages[lastIndex] = { ...messages[lastIndex], ...updates };
          }
          return { messages };
        }),
        
        clearMessages: () => set(() => ({
          messages: []
        })),
        
        // Conversation state
        updateConversationState: (updates) => set((state) => ({
          conversationState: { ...state.conversationState, ...updates }
        })),
        
        incrementLeadScore: (points) => set((state) => ({
          conversationState: {
            ...state.conversationState,
            leadScore: Math.min(100, state.conversationState.leadScore + points)
          }
        })),
        
        setConversationStage: (stage) => set((state) => ({
          conversationState: { ...state.conversationState, stage }
        })),
        
        // Voice controls
        toggleVoiceMode: () => set((state) => ({
          voiceMode: !state.voiceMode
        })),
        
        setVoiceOverlay: (show) => set((state) => ({
          showVoiceOverlay: show,
          isVoiceMinimized: show ? state.isVoiceMinimized : false,
          voiceMode: show ? state.voiceMode : false
        })),
        
        setVoiceMinimized: (minimized) => set(() => ({
          isVoiceMinimized: minimized
        })),
        
        // Overlay controls
        setSettingsOverlay: (show) => set(() => ({
          showSettingsOverlay: show
        })),
        
        setFileUpload: (show) => set(() => ({
          showFileUpload: show
        })),
        
        setBookingOverlay: (show) => set(() => ({
          showBookingOverlay: show
        })),
        
        // Multimodal controls
        setWebcamInterface: (show) => set((state) => ({
          showWebcamInterface: show,
          isWebcamMinimized: show ? state.isWebcamMinimized : false
        })),
        
        setWebcamMinimized: (minimized) => set(() => ({
          isWebcamMinimized: minimized
        })),
        
        toggleCameraFacing: () => set((state) => ({
          cameraFacing: state.cameraFacing === 'user' ? 'environment' : 'user'
        })),
        
        setScreenShareInterface: (show) => set((state) => ({
          showScreenShareInterface: show,
          isScreenShareMinimized: show ? state.isScreenShareMinimized : false
        })),
        
        setScreenShareMinimized: (minimized) => set(() => ({
          isScreenShareMinimized: minimized
        })),
        
        // Tool management
        toggleTool: (toolId) => set((state) => {
          const activeTools = [...state.activeTools];
          const index = activeTools.indexOf(toolId);
          if (index > -1) {
            activeTools.splice(index, 1);
          } else {
            activeTools.push(toolId);
          }
          return { activeTools };
        }),
        
        setActiveCanvasTool: (tool) => set(() => ({
          activeCanvasTool: tool
        })),
        
        // Bulk updates
        updateState: (updates) => set((state) => ({
          ...state,
          ...updates
        })),
        
        resetApp: () => set(() => ({
          ...initialState
        })),
        }),
        {
          name: 'ai-lead-generation-store',
          partialize: (state) => ({
            theme: state.theme,
            conversationState: state.conversationState,
            messages: state.messages,
          }),
        }
      )
    ),
    {
      name: 'AI Lead Generation Store',
    }
  )
);

// Utility selectors
export const useMessages = () => useAppStore((state) => state.messages);
export const useConversationState = () => useAppStore((state) => state.conversationState);
export const useUIState = () => useAppStore((state) => ({
  theme: state.theme,
  isLoading: state.isLoading,
  isUserScrolling: state.isUserScrolling,
  input: state.input,
}));
export const useVoiceState = () => useAppStore((state) => ({
  voiceMode: state.voiceMode,
  showVoiceOverlay: state.showVoiceOverlay,
  isVoiceMinimized: state.isVoiceMinimized,
}));
export const useOverlayState = () => useAppStore((state) => ({
  showSettingsOverlay: state.showSettingsOverlay,
  showFileUpload: state.showFileUpload,
  showBookingOverlay: state.showBookingOverlay,
}));
export const useMultimodalState = () => useAppStore((state) => ({
  showWebcamInterface: state.showWebcamInterface,
  isWebcamMinimized: state.isWebcamMinimized,
  cameraFacing: state.cameraFacing,
  showScreenShareInterface: state.showScreenShareInterface,
  isScreenShareMinimized: state.isScreenShareMinimized,
}));
export const useToolState = () => useAppStore((state) => ({
  activeTools: state.activeTools,
  activeCanvasTool: state.activeCanvasTool,
}));