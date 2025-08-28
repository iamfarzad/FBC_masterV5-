/**
 * Test Configuration
 * Central configuration for all testing frameworks
 */

export const testConfig = {
  // Jest configuration
  jest: {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/utils/test-utils.tsx'],
    testMatch: [
      '<rootDir>/tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
      '<rootDir>/tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    collectCoverageFrom: [
      'app/**/*.{js,jsx,ts,tsx}',
      'components/**/*.{js,jsx,ts,tsx}',
      'hooks/**/*.{js,jsx,ts,tsx}',
      'src/**/*.{js,jsx,ts,tsx}',
      '!**/*.d.ts',
      '!**/node_modules/**',
      '!**/.next/**',
      '!**/coverage/**',
      '!**/jest.config.js',
      '!**/jest.setup.js',
    ],
    coverageReporters: ['text', 'lcov', 'html', 'json'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
      '^@/components/(.*)$': '<rootDir>/components/$1',
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
      '^@/types/(.*)$': '<rootDir>/types/$1',
      '^@/utils/(.*)$': '<rootDir>/src/core/utils/$1',
    },
  },

  // Playwright configuration
  playwright: {
    testDir: './tests/e2e',
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : [['html'], ['list']],
    use: {
      baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
    webServer: process.env.CI ? undefined : [
      {
        command: 'pnpm dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
    ],
  },

  // Test categories for organization
  categories: {
    unit: {
      pattern: 'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
      description: 'Unit tests for individual components and functions',
    },
    integration: {
      pattern: 'tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}',
      description: 'Integration tests for component interactions',
    },
    e2e: {
      pattern: 'tests/e2e/**/*.{test,spec}.{js,jsx,ts,tsx}',
      description: 'End-to-end tests for complete user journeys',
    },
    accessibility: {
      pattern: 'tests/**/*.accessibility.{test,spec}.{js,jsx,ts,tsx}',
      description: 'Accessibility and a11y tests',
    },
    performance: {
      pattern: 'tests/**/*.performance.{test,spec}.{js,jsx,ts,tsx}',
      description: 'Performance and load tests',
    },
    security: {
      pattern: 'tests/**/*.security.{test,spec}.{js,jsx,ts,tsx}',
      description: 'Security and vulnerability tests',
    },
  },

  // Test utilities and helpers
  utils: {
    mockData: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        avatar: '/placeholder.svg',
      },
      message: {
        id: 'test-message-id',
        role: 'user' as const,
        content: 'Test message content',
        createdAt: new Date(),
      },
      conversation: {
        id: 'test-conversation-id',
        title: 'Test Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  },

  // Environment-specific configurations
  environments: {
    development: {
      jest: {
        collectCoverage: false,
        testResultsProcessor: undefined,
      },
      playwright: {
        headless: false,
        slowMo: 500,
      },
    },
    ci: {
      jest: {
        collectCoverage: true,
        coverageReporters: ['text', 'lcov', 'json'],
      },
      playwright: {
        headless: true,
        workers: 2,
      },
    },
    production: {
      jest: {
        collectCoverage: true,
        coverageReporters: ['lcov', 'json'],
      },
      playwright: {
        headless: true,
        workers: 4,
      },
    },
  },
}

export default testConfig
