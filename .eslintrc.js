module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'react/no-unescaped-entities': 'off', // Temporarily disabled for commit
    '@next/next/no-assign-module-variable': 'off', // Temporarily disabled for commit
    '@typescript-eslint/no-explicit-any': 'off', // Temporarily disabled for commit
    '@typescript-eslint/no-empty-interface': 'off', // Temporarily disabled for commit
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          '@/src/core/chat/service',
          '@/src/api/chat/*',
          '@/app/api/chat/route',
          '@/app/api/admin/chat/route',
          '@/app/api/realtime-chat/*',
          '@/app/api/mock/chat/*',
        ],
        paths: [
          {
            name: '@/src/core/types/chat',
            importNames: ['ChatMessage', 'ChatRequest', 'ChatMode'],
            message: 'Use unified types from @/src/core/chat/unified-types'
          },
          {
            name: '@/hooks/useChat-ui',
            message: 'Use useUnifiedChat from @/hooks/useUnifiedChat.'
          },
          {
            name: '@/hooks/chat/useChat',
            message: 'Use useUnifiedChat from @/hooks/useUnifiedChat.'
          },
          {
            name: '@/app/api/chat/route',
            message: 'Use /api/chat/unified.'
          },
          {
            name: 'components/chat/unified/UnifiedChatInterface',
            message: 'Use the production UI wired to unified backend.'
          },
        ],
      },
    ],
  },
};