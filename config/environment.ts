// Environment configuration for client-side application
export const config = {
  // API endpoints
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  
  // In a real deployment, you would set this via build-time environment variables
  // or load it from a secure configuration endpoint
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || undefined as string | undefined,
  
  // Demo mode settings
  isDemoMode: false,
  
  // Layout test mode - bypasses all permission checks for UI testing
  isLayoutTestMode: false,
  
  // Feature flags
  features: {
    streaming: true,
    voiceChat: true,
    videoChat: true,
    screenShare: true,
    pdfGeneration: true,
    calendarBooking: true
  }
};

// Helper function to check if features are available
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature] === true;
};

// Helper function to check if API is configured
export const isApiConfigured = (): boolean => {
  return Boolean(config.geminiApiKey);
};

// Helper function to check if in layout test mode
export const isLayoutTestMode = (): boolean => {
  return config.isLayoutTestMode === true;
};

// Set API key (could be called from a configuration UI)
export const setApiKey = (apiKey: string) => {
  config.geminiApiKey = apiKey;
  config.isDemoMode = false;
};

// Get API key safely
export const getApiKey = (): string | undefined => {
  return config.geminiApiKey;
};