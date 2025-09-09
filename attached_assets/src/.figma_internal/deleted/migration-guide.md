# Next.js Migration Guide for AI Lead Generation System

## 🎯 **Current → Next.js Structure Mapping**

### **Your Current Structure:**
```
/
├── App.tsx                    → /src/app/page.tsx (App Router)
├── components/                → /src/components/ (same)
├── hooks/                     → /src/hooks/ (same)
├── constants/                 → /src/lib/constants/ (renamed)
├── config/                    → /src/lib/config/ (renamed)
├── services/                  → /src/lib/services/ (renamed)
├── styles/globals.css         → /src/app/globals.css
└── .env.example              → .env.local (rename)
```

### **New Next.js Structure:**
```
your-nextjs-project/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── .env.example
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css        (your current styles/globals.css)
│   │   ├── layout.tsx         (new root layout)
│   │   ├── page.tsx           (your current App.tsx content)
│   │   ├── api/               (backend API routes)
│   │   │   ├── ai/
│   │   │   ├── documents/
│   │   │   ├── leads/
│   │   │   └── calendar/
│   │   └── providers.tsx      (React DND & other providers)
│   ├── components/            (all your current components)
│   ├── hooks/                 (all your current hooks)
│   ├── lib/
│   │   ├── constants/         (renamed from constants/)
│   │   ├── config/           (renamed from config/)
│   │   ├── services/         (renamed from services/)
│   │   └── utils.ts          (utility functions)
│   └── types/
│       └── index.ts          (TypeScript interfaces)
```

## 🔧 **Required Next.js Configuration Files**

### **1. package.json Dependencies**
```json
{
  "name": "ai-lead-generation",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "motion": "^10.16.0",
    "lucide-react": "^0.263.1",
    "recharts": "^2.8.0",
    "react-hook-form": "^7.55.0",
    "sonner": "^2.0.3",
    "@tailwindcss/typography": "^0.5.10"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0-alpha.23",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### **2. next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig
```

### **3. tailwind.config.ts**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

### **4. tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🔄 **Key File Conversions**

### **1. Root Layout (src/app/layout.tsx)**
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Business Intelligence - Lead Generation Platform',
  description: 'AI-powered lead generation and business intelligence platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
```

### **2. Main Page (src/app/page.tsx)**
```tsx
import { AILeadGenerationApp } from '@/components/AILeadGenerationApp'

export default function HomePage() {
  return <AILeadGenerationApp />
}
```

### **3. Providers Wrapper (src/app/providers.tsx)**
```tsx
'use client'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  )
}
```

## 📝 **Migration Steps**

### **Step 1: Create Next.js Project**
```bash
npx create-next-app@latest ai-lead-generation --typescript --tailwind --eslint --app
cd ai-lead-generation
```

### **Step 2: Copy Your Files**
1. Copy `/components/` → `/src/components/`
2. Copy `/hooks/` → `/src/hooks/`
3. Copy `/constants/` → `/src/lib/constants/`
4. Copy `/config/` → `/src/lib/config/`
5. Copy `/services/` → `/src/lib/services/`
6. Copy `/styles/globals.css` → `/src/app/globals.css`

### **Step 3: Update Import Paths**
Change all imports from:
```tsx
// Old
import { useAppState } from './hooks/useAppState'
import { Button } from './components/ui/button'

// New
import { useAppState } from '@/hooks/useAppState'
import { Button } from '@/components/ui/button'
```

### **Step 4: Convert App.tsx**
Move your current `App.tsx` content to a new component:

```tsx
// src/components/AILeadGenerationApp.tsx
'use client'

import { Providers } from '@/app/providers'
// ... all your current App.tsx imports with updated paths
// ... all your current App.tsx logic

export function AILeadGenerationApp() {
  return (
    <Providers>
      {/* Your current App.tsx JSX content */}
    </Providers>
  )
}
```

## 🔌 **Backend API Integration Points**

### **API Routes Structure:**
```
src/app/api/
├── ai/
│   ├── generate/route.ts         (AI responses)
│   └── stream/route.ts           (Streaming responses)
├── documents/
│   ├── analyze/route.ts          (Document analysis)
│   └── upload/route.ts           (File uploads)
├── leads/
│   ├── create/route.ts           (Lead creation)
│   ├── update-score/route.ts     (Lead scoring)
│   └── export/route.ts           (PDF generation)
└── calendar/
    └── book/route.ts             (Calendar booking)
```

### **Sample API Route (src/app/api/ai/generate/route.ts):**
```tsx
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()
    
    // Your AI integration logic here
    const response = await generateAIResponse(message, context)
    
    return NextResponse.json({ response })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
```

## 🚀 **Production Deployment Checklist**

### **Environment Variables (.env.local):**
```env
# API Keys
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Database
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url

# Authentication
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://yourdomain.com

# Third-party Services
CALENDLY_API_TOKEN=your_token
SENDGRID_API_KEY=your_key
```

### **Build Commands:**
```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm run start
```

## ✅ **What Stays the Same**
- ✅ All your component logic and functionality
- ✅ Your holographic design system (globals.css)
- ✅ All hooks and state management
- ✅ TypeScript interfaces and types
- ✅ ShadCN UI components
- ✅ React DND drag & drop functionality
- ✅ Motion animations and effects

## 🔧 **What Changes**
- 🔄 File paths (add @ aliases)
- 🔄 Project structure (Next.js conventions)
- 🔄 Environment variables (.env.local)
- 🔄 Build configuration (next.config.js)
- 🔄 API integration (from mock to real endpoints)

Your architecture is **perfectly suited** for Next.js migration! The modular design and proper separation of concerns make this transition seamless.