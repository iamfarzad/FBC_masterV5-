import { useState, useCallback } from 'react';

export interface ConversationState {
  stage: 'greeting' | 'email_request' | 'email_collected' | 'discovery' | 'solution_positioning' | 'summary_offer' | 'booking_offer';
  name?: string;
  email?: string;
  companyInfo?: {
    name: string;
    domain: string;
    industry: string;
    insights: string[];
    challenges: string[];
  };
  discoveredChallenges?: string[];
  preferredSolution?: 'training' | 'consulting' | 'both';
  leadScore?: number;
}

export interface MessageData {
  id: string;
  content?: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  type?: 'text' | 'insight' | 'summary' | 'cta';
  isPlaying?: boolean;
  suggestions?: string[];
  sources?: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  tools?: Array<{
    name: string;
    description: string;
    used: boolean;
  }>;
}

// Enhanced company analysis
const analyzeCompanyFromEmail = async (email: string) => {
  const domain = email.split('@')[1];
  const genericDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
  
  if (genericDomains.includes(domain)) {
    return {
      name: "your company",
      domain: domain,
      industry: "various industries",
      insights: ["Many professionals are exploring AI automation to stay competitive"],
      challenges: ["improving operational efficiency", "staying ahead of industry trends"]
    };
  }

  const companyName = domain.replace('.com', '').replace('.co', '').replace(/[^a-zA-Z0-9]/g, ' ');
  const industries = ['technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'consulting'];
  const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
  
  return {
    name: companyName,
    domain: domain,
    industry: randomIndustry,
    insights: [
      `${companyName} appears to be in the ${randomIndustry} sector`,
      `Companies in ${randomIndustry} are increasingly adopting AI solutions`,
      `Industry trend shows 40% growth in AI adoption this year`
    ],
    challenges: [`workflow automation in ${randomIndustry}`, "data-driven decision making", "competitive advantage through AI"]
  };
};

const calculateLeadScore = (state: ConversationState): number => {
  let score = 0;
  
  if (state.email && !['gmail.com', 'outlook.com', 'yahoo.com'].includes(state.email.split('@')[1])) {
    score += 20;
  }
  
  if (state.discoveredChallenges && state.discoveredChallenges.length > 0) {
    score += 15;
  }
  
  if (state.stage === 'discovery' || state.stage === 'solution_positioning') {
    score += 10;
  }
  
  if (state.preferredSolution) {
    score += 25;
  }
  
  return Math.min(score, 100);
};

export const useConversationFlow = () => {
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: '1',
      content: 'Hi! I\'m here to help you discover how AI can transform your business. What\'s your name?',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text',
      suggestions: [
        'My name is John Smith',
        'I\'m Sarah from TechCorp',
        'Call me Mike'
      ]
    }
  ]);

  const [conversationState, setConversationState] = useState<ConversationState>({
    stage: 'greeting'
  });

  const [isLoading, setIsLoading] = useState(false);

  const processUserMessage = useCallback(async (userInput: string, setShowBookingOverlay: (show: boolean) => void) => {
    console.log('🔄 Processing user message:', userInput, 'current stage:', conversationState.stage)
    console.log('📊 Current conversation state:', JSON.stringify(conversationState, null, 2))

    // Only handle conversation state management - AI responses come from unified chat
    const newState = { ...conversationState };

    // Update conversation state based on current stage and user input
    switch (conversationState.stage) {
      case 'greeting':
        // Parse name from user input - handle various formats
        const nameInput = userInput.toLowerCase();
        let extractedName = userInput;

        // Remove common prefixes
        if (nameInput.includes('my name is')) {
          extractedName = userInput.replace(/my name is/i, '').trim();
        } else if (nameInput.includes('i am') || nameInput.includes("i'm")) {
          extractedName = userInput.replace(/i am|i'm/i, '').trim();
        } else if (nameInput.includes('call me')) {
          extractedName = userInput.replace(/call me/i, '').trim();
        } else if (nameInput.includes('hello') || nameInput.includes('hi')) {
          // Try to extract name after greeting
          const words = userInput.split(' ');
          if (words.length > 2) {
            extractedName = words.slice(2).join(' ').trim();
          }
        }

        // Clean up the name
        extractedName = extractedName.replace(/[,!.?]+$/, '').trim();

        newState.name = extractedName;
        newState.stage = 'email_request';
        break;

      case 'email_request':
        if (userInput.includes('@')) {
          newState.email = userInput;
          newState.stage = 'email_collected';

          // Analyze company info asynchronously
          setTimeout(async () => {
            const companyInfo = await analyzeCompanyFromEmail(userInput);
            setConversationState(prevState => ({
              ...prevState,
              companyInfo,
              stage: 'discovery'
            }));
          }, 1000);
        }
        break;

      case 'discovery':
        newState.discoveredChallenges = [userInput];
        newState.stage = 'solution_positioning';
        newState.leadScore = calculateLeadScore(newState);
        break;

      case 'solution_positioning':
        if (userInput.toLowerCase().includes('training')) {
          newState.preferredSolution = 'training';
        } else if (userInput.toLowerCase().includes('consulting') || userInput.toLowerCase().includes('done-for-you')) {
          newState.preferredSolution = 'consulting';
        } else {
          newState.preferredSolution = 'both';
        }

        newState.stage = 'booking_offer';
        newState.leadScore = calculateLeadScore(newState);
        break;

      case 'booking_offer':
        if (userInput.toLowerCase().includes('schedule') || userInput.toLowerCase().includes('calendar') || userInput.toLowerCase().includes('call')) {
          setShowBookingOverlay(true);
        }
        break;
    }

    console.log('✅ Updated conversation state:', JSON.stringify(newState, null, 2))
    setConversationState(newState);
  }, [conversationState]);

  const addMessage = useCallback((message: MessageData) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    messages,
    conversationState,
    isLoading,
    processUserMessage,
    addMessage,
    setConversationState,
    setMessages
  };
};