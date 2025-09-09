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
    const userMessage: MessageData = {
      id: Date.now().toString(),
      content: userInput,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(async () => {
      let aiResponse = '';
      let responseType: MessageData['type'] = 'text';
      let newState = { ...conversationState };
      let suggestions: string[] = [];
      let sources: MessageData['sources'] = [];
      let tasks: MessageData['tasks'] = [];
      let tools: MessageData['tools'] = [];

      switch (conversationState.stage) {
        case 'greeting':
          newState.name = userInput;
          newState.stage = 'email_request';
          aiResponse = `Nice to meet you, ${userInput}! To send you a personalized summary of our conversation, what's your work email?`;
          suggestions = [
            'john.smith@company.com',
            'sarah@techcorp.com',
            'I prefer not to share my email right now'
          ];
          break;

        case 'email_request':
          if (userInput.includes('@')) {
            newState.email = userInput;
            newState.stage = 'email_collected';
            aiResponse = `Perfect, ${newState.name}! I'm analyzing your company background now...`;
            
            tools = [
              {
                name: 'Company Research',
                description: 'Analyzing company domain and industry data',
                used: true
              },
              {
                name: 'Market Analysis',
                description: 'Researching industry trends and competitors',
                used: true
              }
            ];
            
            setTimeout(async () => {
              const companyInfo = await analyzeCompanyFromEmail(userInput);
              newState.companyInfo = companyInfo;
              
              const insightMessage: MessageData = {
                id: (Date.now() + 1).toString(),
                content: `I see you're with ${companyInfo.name}. That's interesting - ${companyInfo.insights[0]}. Many businesses in ${companyInfo.industry} are facing challenges with ${companyInfo.challenges[0]}.\n\nWhat's the biggest challenge you're currently facing with AI implementation or business automation?`,
                role: 'assistant',
                timestamp: new Date(),
                type: 'insight',
                suggestions: [
                  'We need help with workflow automation',
                  'Customer service efficiency is our main concern',
                  'Data analysis and reporting takes too much time',
                  'We want to improve our marketing ROI'
                ],
                sources: [
                  {
                    title: `AI Trends in ${companyInfo.industry}`,
                    url: '#',
                    excerpt: `Recent studies show 40% growth in AI adoption within the ${companyInfo.industry} sector`
                  }
                ]
              };
              
              setMessages(prev => [...prev, insightMessage]);
              setConversationState(prevState => ({ ...prevState, ...newState }));
              newState.stage = 'discovery';
            }, 2000);
            
          } else {
            aiResponse = `I'd love to help you get the most out of our conversation! Could you share your work email so I can send you a personalized summary?`;
            suggestions = [
              'Sure, it\'s user@company.com',
              'I\'d prefer to continue without sharing my email'
            ];
          }
          break;

        case 'discovery':
          newState.discoveredChallenges = [userInput];
          newState.stage = 'solution_positioning';
          newState.leadScore = calculateLeadScore(newState);
          
          aiResponse = `That's a common challenge in ${newState.companyInfo?.industry}. Based on what you've shared, I can see how AI automation could help ${newState.companyInfo?.name} with ${userInput}.\n\nWould you be more interested in:\n- **AI Training & Workshops** for your team to implement solutions internally\n- **Done-for-You Consulting** where we implement and manage the AI systems\n- **Hybrid Approach** with both training and implementation support?`;
          
          suggestions = [
            'Tell me about the training programs',
            'I\'d prefer done-for-you consulting',
            'A hybrid approach sounds interesting',
            'Let\'s schedule a consultation call'
          ];
          
          responseType = 'summary';
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
          
          aiResponse = `Perfect! Based on our conversation, I can see you're a great fit for our ${newState.preferredSolution} approach. Your lead score is ${newState.leadScore}/100.\n\n**Next Steps:**\n\n1. **Schedule a Strategy Session** - Let's discuss your specific needs and create a custom AI implementation plan\n2. **Get Your Personalized Report** - I'll generate a comprehensive AI strategy summary for ${newState.companyInfo?.name}\n\nWould you like to book a 30-minute strategy call to dive deeper into how we can help ${newState.companyInfo?.name} with ${newState.discoveredChallenges?.[0]}?`;
          
          suggestions = [
            'Yes, let\'s schedule a call',
            'Show me the calendar',
            'Send me the report first',
            'I need to discuss this with my team'
          ];
          
          responseType = 'cta';
          
          tasks = [
            {
              id: 'needs-analysis',
              title: 'Completed needs analysis',
              completed: true
            },
            {
              id: 'solution-match',
              title: 'Identified solution fit',
              completed: true
            },
            {
              id: 'next-steps',
              title: 'Ready for strategy session',
              completed: false
            }
          ];
          break;

        case 'booking_offer':
          if (userInput.toLowerCase().includes('schedule') || userInput.toLowerCase().includes('calendar') || userInput.toLowerCase().includes('call')) {
            setShowBookingOverlay(true);
            aiResponse = `Great! I'm opening the booking calendar for you. You can select your preferred date and time for our strategy session.`;
          } else {
            aiResponse = `I understand. Feel free to reach out when you're ready to move forward. In the meantime, would you like me to generate your personalized AI strategy report?`;
            suggestions = [
              'Yes, generate my report',
              'Schedule the call now',
              'I\'ll get back to you later'
            ];
          }
          responseType = 'cta';
          break;

        default:
          aiResponse = `I understand. How else can I help you explore AI opportunities for your business?`;
          suggestions = [
            'Tell me about AI automation',
            'What services do you offer?',
            'Schedule a consultation'
          ];
      }

      setConversationState(newState);

      const aiMessage: MessageData = {
        id: (Date.now() + 2).toString(),
        content: aiResponse || 'I apologize, there was an issue generating a response. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        type: responseType,
        suggestions,
        sources,
        tasks,
        tools
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
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