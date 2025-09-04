// Centralized configuration management - framework agnostic
export interface AppConfig {
  supabase: {
    url?: string
    anonKey?: string
    serviceRoleKey?: string
  }
  ai: {
    gemini: {
      apiKey?: string
      model: string
      models: {
        default: string
        fastResponse: string
        analysis: string
        research: string
      }
    }
    openai: {
      apiKey?: string
      model: string
    }
  }
  email: {
    resend: {
      apiKey?: string
      webhookSecret?: string
    }
  }
  search: {
    google: {
      apiKey?: string
      engineId?: string
    }
  }
  app: {
    baseUrl: string
    environment: string
  }
}

export const config: AppConfig = {
  supabase: {
    ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? { url: process.env.NEXT_PUBLIC_SUPABASE_URL } : {}),
    ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? { anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY } : {}),
    ...(process.env.SUPABASE_SERVICE_ROLE_KEY ? { serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY } : {}),
  },
  ai: {
    gemini: {
      ...(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {}),
      model: "gemini-2.5-pro",
      models: {
        default: "gemini-2.5-pro",
        fastResponse: "gemini-2.5-flash",
        analysis: "gemini-2.5-pro",
        research: "gemini-2.5-pro"
      },

      // Model capabilities and pricing (approximate)
      modelCapabilities: {
        "gemini-2.5-flash": {
          contextWindow: 1048576, // 1M tokens
          multimodal: true,
          functionCalling: true,
          maxOutputTokens: 8192,
          pricing: { input: 0.15, output: 0.60 } // per 1M tokens
        },
        "gemini-2.5-flash-lite": {
          contextWindow: 1048576,
          multimodal: true,
          functionCalling: true,
          maxOutputTokens: 8192,
          pricing: { input: 0.075, output: 0.30 }
        },
        "gemini-2.5-pro": {
          contextWindow: 2097152, // 2M tokens
          multimodal: true,
          functionCalling: true,
          maxOutputTokens: 8192,
          pricing: { input: 1.25, output: 5.00 }
        },
        "gemini-1.5-flash": {
          contextWindow: 1048576,
          multimodal: true,
          functionCalling: true,
          maxOutputTokens: 8192,
          pricing: { input: 0.35, output: 1.05 }
        },
        "gemini-1.5-pro": {
          contextWindow: 2097152,
          multimodal: true,
          functionCalling: true,
          maxOutputTokens: 8192,
          pricing: { input: 3.50, output: 10.50 }
        },
        "gemini-1.5-flash-8b": {
          contextWindow: 1048576,
          multimodal: true,
          functionCalling: true,
          maxOutputTokens: 8192,
          pricing: { input: 0.075, output: 0.30 }
        }
      },

      // Caching configuration
      caching: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxCacheSize: 1000,
        compression: true
      },

      // Rate limiting
      rateLimiting: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        burstLimit: 10
      },

      // Retry configuration
      retry: {
        maxRetries: 3,
        baseDelay: 1000, // 1 second
        maxDelay: 30000, // 30 seconds
        backoffMultiplier: 2
      }
    },
    openai: {
      ...(process.env.OPENAI_API_KEY ? { apiKey: process.env.OPENAI_API_KEY } : {}),
      model: "gpt-4"
    },
  },
  email: {
    resend: {
      ...(process.env.RESEND_API_KEY ? { apiKey: process.env.RESEND_API_KEY } : {}),
      ...(process.env.RESEND_WEBHOOK_SECRET ? { webhookSecret: process.env.RESEND_WEBHOOK_SECRET } : {}),
    },
  },
  search: {
    google: {
      ...(process.env.GOOGLE_API_KEY ? { apiKey: process.env.GOOGLE_API_KEY } : {}),
      ...(process.env.GOOGLE_ENGINE_ID ? { engineId: process.env.GOOGLE_ENGINE_ID } : {}),
    },
  },
  app: {
    baseUrl: process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
  },
} as const

// Validation functions
export function validateConfig(): string[] {
  const errors: string[] = []

  if (!config.supabase.url) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  }

  if (!config.supabase.anonKey) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
  }

  return errors
}

// Legacy validation function for backward compatibility
export function validateConfigLegacy() {
  const errors = validateConfig()

  if (!config.ai.gemini.apiKey) {
    errors.push("Missing GEMINI_API_KEY or VITE_GEMINI_API_KEY")
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`)
  }
}

// Helper functions to check environment
export function isProduction(): boolean {
  return config.app.environment === 'production'
}

export function isDevelopment(): boolean {
  return config.app.environment === 'development'
}

// Convenience constants for direct access
export const isDevelopmentMode = config.app.environment === "development"
export const isProductionMode = config.app.environment === "production"

// Development warning for missing Supabase variables
export function checkDevelopmentConfig() {
  if (isDevelopment()) {
    const missingVars: string[] = []

    if (!config.supabase.url) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!config.supabase.anonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!config.supabase.serviceRoleKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY")

    if (missingVars.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`Missing Supabase environment variables: ${missingVars.join(", ")}`)
    }
  }
}

export function isConfigured(service: keyof AppConfig): boolean {
  switch (service) {
    case 'supabase':
      return !!(config.supabase.url && config.supabase.anonKey)
    case 'ai':
      return !!(config.ai.gemini.apiKey || config.ai.openai.apiKey)
    case 'email':
      return !!config.email.resend.apiKey
    case 'search':
      return !!(config.search.google.apiKey && config.search.google.engineId)
    default:
      return false
  }
}
