import { 
  Camera,
  Monitor,
  GraduationCap,
  Upload,
  Search
} from 'lucide-react';

// Conversation stages
export const CONVERSATION_STAGES = {
  GREETING: 'greeting',
  DISCOVERY: 'discovery',
  QUALIFICATION: 'qualification',
  PRESENTATION: 'presentation',
  CLOSING: 'closing'
} as const;

// Business tools configuration
export interface ToolItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

export const BUSINESS_TOOLS: ToolItem[] = [
  { id: 'webcam', icon: Camera, label: 'Video Call', description: 'Face-to-face consultation' },
  { id: 'screen', icon: Monitor, label: 'Screen Share', description: 'Business process analysis' },
  { id: 'docs', icon: Upload, label: 'Documents', description: 'Upload & analyze files' },
  { id: 'research', icon: Search, label: 'Research', description: 'Market & competitor analysis' },
  { id: 'workshop', icon: GraduationCap, label: 'AI Academy', description: 'Executive training resources' }
];

// AI response templates
export const AI_RESPONSES = [
  "Thank you for sharing that. Based on your industry, I can already see several AI opportunities. What's your biggest operational challenge right now?",
  "Great! Your business profile shows strong potential for AI implementation. What specific goals are you hoping to achieve this year?", 
  "That's helpful context. Could you share your email so I can send you a personalized AI assessment after our conversation?",
  "Perfect! I'm building a comprehensive understanding of your needs. What's driving your interest in AI - competitive pressure or growth opportunities?"
];

// Weather data interface
export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
}

// Default weather
export const DEFAULT_WEATHER: WeatherData = {
  temp: 72,
  condition: 'sunny',
  location: 'San Francisco, CA'
};

// Utility functions
export const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Animation delays and durations
export const ANIMATION_CONFIG = {
  staggerDelay: 0.1,
  springConfig: { stiffness: 300, damping: 25 },
  fadeInDuration: 0.3,
  slideInDuration: 0.4
};

// Z-index layers
export const Z_INDEX = {
  base: 1,
  elevated: 10,
  floating: 20,
  overlay: 30,
  modal: 50,
  tooltip: 60
};