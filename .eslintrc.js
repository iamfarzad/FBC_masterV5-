module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // Allow explicit any types where needed
    '@typescript-eslint/no-empty-interface': 'off', // Allow empty interfaces for future extension
    'react/no-unescaped-entities': 'off', // Temporarily allow unescaped entities
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