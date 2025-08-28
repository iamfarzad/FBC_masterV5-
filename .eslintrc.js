module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:tailwindcss/recommended',
  ],
  ignorePatterns: [
    // Ignore CSS files - handled by stylelint
    '**/*.css',
    // Ignore JavaScript files that don't need TypeScript parsing
    'tailwind.tokens-guard.js',
    'test-admin-systems.js',
    'test-colors.js',
    'test-e2e-comprehensive.js',
    'test-e2e-green-path.js',
    'test-live-multimodal-pipeline.js',
    'test-multimodal-integration.js',
    'ui-audit-comprehensive.js',
    'tests/run-tests.js',
    'tests/__mocks__/*.js',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'tailwindcss',
  ],
  rules: {
    // TypeScript specific rules - STRICT ENFORCEMENT
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    '@typescript-eslint/no-explicit-any': 'warn', // Allow but warn about any types
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/prefer-promise-reject-errors': 'error',

    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/no-unescaped-entities': 'error',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/no-unknown-property': 'error',

    // React Hooks rules - STRICT
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // Import rules - STRICT
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-duplicates': 'error',

    // General rules - STRICT ENFORCEMENT
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Turned off in favor of @typescript-eslint/no-unused-vars
    'prefer-const': 'error',
    'no-var': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-control-regex': 'error',
    'no-useless-escape': 'error',
    'no-constant-condition': 'error',

    'no-useless-catch': 'error',
    'no-extra-semi': 'error',
    'no-unneeded-ternary': 'error',
    'no-new-object': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',

    // Tailwind CSS specific rules
    'tailwindcss/no-custom-classname': 'warn', // Warn about custom classes that might conflict with Tailwind
    'tailwindcss/no-contradicting-classname': 'error', // Prevent contradicting Tailwind classes
    'tailwindcss/classnames-order': ['warn', {
      order: ['layout', 'boxDecoration', 'background', 'border', 'typography', 'animation', 'misc']
    }],
    'tailwindcss/enforces-shorthand': 'warn', // Suggest using shorthand classes when possible
    'tailwindcss/migration-from-tailwind-2': 'off', // Disable migration warnings for v2 to v3
  },
  settings: {
    react: {
      version: 'detect',
    },
    tailwindcss: {
      // Path to your Tailwind config file
      config: './tailwind.config.ts',
      // CSS files to scan for class definitions
      cssFiles: [
        './app/globals.css',
        './styles/**/*.css',
      ],
      // CSS attributes to scan for class names
      cssAttributes: ['class', 'className', 'class:list'],
      // Remove default CSS files if you don't want them scanned
      removeDuplicates: true,
      // Whitelist custom classes that are not Tailwind classes
      whitelist: [
        'neu-card',
        'card-glass',
        'input-enhanced',
        'btn-primary',
        'neu-.*', // Any class starting with 'neu-'
      ],
    },
  },
  overrides: [
    {
      files: ['**/*.js'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: false,
        },
      },
      rules: {
        // Disable TypeScript-specific rules for JS files
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/prefer-promise-reject-errors': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
    {
      files: ['supabase/functions/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './supabase/functions/deno.json',
      },
      env: {
        browser: true,
        es2022: true,
      },
      globals: {
        // Deno global APIs
        Deno: 'readonly',
        // Web standard globals available in Deno
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
      },
      rules: {
        // Disable Node.js specific rules for Deno
        'no-process-env': 'off',
        'no-console': 'off', // Deno Edge Functions often use console for logging

        // TypeScript rules suitable for Deno
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',

        // Disable rules that don't apply to Deno Edge Functions
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/prefer-promise-reject-errors': 'warn',

        // Import rules for ESM
        'import/no-unresolved': 'off', // ESM imports from URLs are valid in Deno
        'import/no-absolute-path': 'off', // Deno allows absolute paths
      },
      settings: {
        // Configure import resolver for ESM
        'import/resolver': {
          'typescript': {
            'alwaysTryTypes': true,
            'project': './tsconfig.json',
          },
        },
      },
    },
    {
      files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      extends: [
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        // Enable strict type checking for core application files
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/prefer-promise-reject-errors': 'error',
      },
    },
  ],
}
