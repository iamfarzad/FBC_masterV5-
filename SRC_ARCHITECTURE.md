# 🏗️ SRC Architecture Guidelines

## 📋 **Locked Pattern: `src/` for Business Logic**

### 🎯 **Separation Rules**

**`app/` = Next.js Framework Layer**
- Route handlers only (`app/api/*/route.ts`)
- Pages only (`app/*/page.tsx`)
- Layouts, middleware, Next.js config
- **NO business logic**

**`src/` = Pure Business Logic**
- Framework-agnostic core
- Reusable services and utilities
- Domain models and types
- **NO Next.js imports**

**`components/` = UI Components**
- React components only
- Can import from `src/` for business logic
- Can use Next.js features (client/server components)

**`hooks/` = React Hooks**
- React-specific logic
- Can import from `src/` for business logic
- Bridge between UI and core logic

## 📁 **Standard `src/` Structure**

```
src/
  core/                    # Core business domains
    types/                 # Shared type definitions
      chat.ts
      intelligence.ts
      auth.ts
    chat/                  # Chat domain
      service.ts           # Provider-agnostic service
      context.ts           # Context builders
    ai/                    # AI provider abstraction
      index.ts             # Provider factory
      providers/           # Specific implementations
        gemini.ts
        openai.ts
        mock.ts
    intelligence/          # Intelligence system
      intent-detector.ts
      lead-research.ts
      scoring.ts
    auth/                  # Authentication logic
      tokens.ts
      permissions.ts
    validation/            # Input validation schemas
      chat.ts
      auth.ts
    stream/                # Streaming utilities
      sse.ts
      websocket.ts
    flags/                 # Feature flags
      index.ts
  
  api/                     # Pure API handlers (no Next.js)
    chat/
      handler.ts           # Pure function
    admin-chat/
      handler.ts
    intelligence/
      handler.ts
  
  services/                # External service integrations
    email/
      resend.ts
    storage/
      supabase.ts
    search/
      google.ts
```

## 🔒 **Import Rules**

### ✅ **Allowed**
```ts
// src/ can import from src/
import { chatService } from '@/src/core/chat/service'

// app/ can import from src/
import { handleChat } from '@/src/api/chat/handler'

// components/ can import from src/
import { useChat } from '@/src/hooks/useChat'  // if moved to src/
```

### ❌ **Forbidden**
```ts
// src/ CANNOT import from app/
import { NextRequest } from 'next/server'  // ❌ in src/

// src/ CANNOT import framework-specific code
import { useRouter } from 'next/navigation'  // ❌ in src/
```

## 🎯 **Benefits of This Pattern**

1. **Framework Independence**: Core logic works with any framework
2. **Testing**: Unit test business logic without framework overhead
3. **Reusability**: Same logic for CLI tools, standalone servers, etc.
4. **Clear Boundaries**: Easy to see what's framework vs business logic
5. **Migration Safety**: Can gradually move code without breaking changes

## 🔄 **Migration Strategy**

### **Phase 1: Move Core Domains**
- `lib/intelligence/` → `src/core/intelligence/`
- `lib/services/` → `src/services/`
- `lib/validation/` → `src/validation/`
- `lib/auth.ts` → `src/auth/`

### **Phase 2: Update Imports**
- Update all `@/lib/` imports to `@/src/`
- Ensure no Next.js imports in `src/`

### **Phase 3: Clean lib/**
- Remove moved files from `lib/`
- Keep only Next.js-specific utilities in `lib/`

## 🚨 **What Stays in `lib/`**

Only Next.js-specific utilities:
- `lib/utils.ts` (if it has Next.js dependencies)
- `lib/middleware.ts` 
- Next.js config helpers

Everything else moves to `src/`.

You can find the local backup here 

here /Users/farzad/FB-c_labV2
