export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-1.5-pro-latest',
      maxTokens: 8192,
      temperature: 0.7,
      contextCaching: true,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview',
    }
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromAddress: 'noreply@fb-c.ai',
  },

  features: {
    mockMode: process.env.MOCK_AI_ENABLED === 'true',
    adminMode: process.env.ADMIN_MODE === 'true',
    debugMode: process.env.NODE_ENV === 'development',
  },

  limits: {
    maxTokensPerRequest: 4096,
    maxConversationLength: 100,
    rateLimitPerMinute: 10,
  },

  cache: {
    ttl: 3600, // 1 hour
    maxSize: 100,
  }
}