# 🎨 F.B/c THEME SYSTEM - IMMUTABLE BRAND COLORS

## 🚫 THE LAW (MANDATORY)

These brand colors are **LAW**. They **MUST NEVER** be changed under any circumstances:

### 🎨 IMMUTABLE BRAND COLORS
```css
/* PRIMARY BRAND COLORS - NEVER CHANGE */
--brand: #ff5b04;          /* F.B/c Orange - THE BRAND */
--brand-hover: #e65200;    /* Orange hover state */

/* BACKGROUND COLORS */
--bg: #f5f5f5;             /* Light Silver background */
--surface: #ffffff;        /* White surface */
--surface-elevated: #e5e5e5; /* Elevated surface */

/* TEXT COLORS */
--text: #111111;           /* Primary text */
--text-muted: #666666;     /* Muted text */

/* BORDER */
--border: #e5e5e5;        /* Default border */
```

### 🌙 DARK MODE COLORS (ALSO IMMUTABLE)
```css
/* DARK MODE - NEVER CHANGE */
--bg: #0b1620;             /* Dark navy background */
--surface: #1d2a35;        /* Dark surface */
--surface-elevated: #1f2f3a; /* Elevated dark surface */
--text: #e5e9ec;          /* Light text */
--text-muted: #a0a5aa;    /* Muted light text */
--border: #2a3a46;        /* Dark border */
```

## 📚 THEME SYSTEM ARCHITECTURE

### Core Files
- **`styles/theme.css`** - Primary theme definitions (SACRED)
- **`src/core/theme/tokens.ts`** - Type-safe theme tokens
- **`src/core/theme/setTheme.ts`** - Theme management utilities
- **`tailwind.config.ts`** - Tailwind configuration
- **`app/globals.css`** - Global application styles

### Design Tokens Export
- **`src/core/theme/tokens.export.json`** - Adobe XD/Figma compatible

## ✅ CORRECT USAGE PATTERNS

### CSS
```css
/* ✅ CORRECT */
.my-component {
  background: var(--brand);
  color: var(--surface);
  border: 1px solid var(--border);
}

/* 🚫 FORBIDDEN */
.my-component {
  background: #ff5b04;    /* NEVER USE HEX */
  color: white;           /* NEVER USE NAMED COLORS */
}
```

### Tailwind CSS
```tsx
// ✅ CORRECT
<div className="bg-brand text-surface border border-border">
  <button className="bg-brand-hover hover:bg-brand text-surface">
    Brand Button
  </button>
</div>

// 🚫 FORBIDDEN
<div className="bg-orange-500 text-white"> // NEVER USE GENERIC COLORS
```

### TypeScript/React
```tsx
// ✅ CORRECT
import { tokens } from '@/src/core/theme/tokens'

function MyComponent() {
  const brandColor = tokens.light.brand
  return (
    <div style={{ backgroundColor: brandColor }}>
      Content
    </div>
  )
}

// 🚫 FORBIDDEN
function BadComponent() {
  return (
    <div style={{ backgroundColor: '#ff5b04' }}> // NEVER USE HEX
      Content
    </div>
  )
}
```

### Three.js/WebGL
```tsx
// ✅ CORRECT
const themeColors = getThemeColors()
const dotColor = new THREE.Color(themeColors.brand)

// 🚫 FORBIDDEN
const dotColor = new THREE.Color('#ff5b04') // NEVER USE HEX
```

## 🎯 COMPONENT DEVELOPMENT LAW

### Mandatory Template for ALL New Components
```tsx
import { cn } from '@/src/core/utils'
import { useTheme } from 'next-themes'

interface ComponentProps {
  className?: string
  variant?: 'default' | 'secondary' | 'outline'
  children: React.ReactNode
}

export function MyComponent({ className, variant = 'default', children }: ComponentProps) {
  // ✅ MANDATORY - Use theme classes
  const baseClasses = "bg-surface border border-border text-text"

  const variants = {
    default: "bg-brand hover:bg-brand-hover text-surface border-transparent",
    secondary: "bg-surface-elevated hover:bg-surface text-text-muted",
    outline: "bg-transparent hover:bg-surface-elevated border-border text-text"
  }

  return (
    <div className={cn(baseClasses, variants[variant], className)}>
      {children}
    </div>
  )
}
```

## 🔧 THEME SYSTEM GUARDS

### 1. Stylelint Rules
- **Blocks hex colors**: `#color-no-hex`
- **Blocks rgb/rgba**: `color-function-notation`
- **Requires CSS vars**: `scale-unlimited/declaration-strict-value`

### 2. ESLint Rules
- **Blocks hex literals**: `no-restricted-syntax`
- **Blocks rgb literals**: `no-restricted-syntax`
- **Custom error messages**: "Use CSS var tokens, not hex."

### 3. Pre-commit Hooks
```bash
#!/usr/bin/env sh
pnpm lint:all
pnpm test:unit
```

### 4. CI/CD Guards
- **Build-time validation**: Checks brand colors integrity
- **Visual regression**: Playwright snapshots for light/dark
- **Unit tests**: Theme switching validation

### 5. Tailwind Guard Plugin
- **Build-time warnings**: Detects hardcoded colors in classes
- **Theme validation**: Ensures CSS vars are applied

## 🚨 VIOLATION CONSEQUENCES

### Immediate Actions Required:
1. **PR BLOCKED** until compliance achieved
2. **Code Revert** for brand color changes
3. **Team Review** for theme violations
4. **Documentation** of incident

### Prevention Measures:
- **Automated CI/CD checks**
- **Linting rules**
- **Type safety**
- **Component libraries**

## 📊 THEME SYSTEM MONITORING

### Metrics to Track:
- **Theme switching performance** (< 100ms)
- **CSS bundle size impact**
- **Color contrast ratios** (WCAG compliance)
- **Theme consistency** across components
- **User theme preference** adoption

### Health Checks:
```typescript
import { checkThemeHealth } from '@/src/core/theme/setTheme'

const health = checkThemeHealth()
if (!health.isValid) {
  console.error('Theme system issues:', health.issues)
}
```

## 🎨 EXTENDING THE THEME SYSTEM

### Adding New Colors (SAFE METHOD):
```css
/* ✅ ALLOWED - Add new semantic colors */
:root {
  --brand: #ff5b04;          /* NEVER CHANGE */
  --brand-secondary: #ffb366; /* ✅ NEW - Brand-adjacent */
  --accent-blue: #3b82f6;     /* ✅ NEW - Semantic colors */
  --accent-green: #10b981;    /* ✅ NEW - Status colors */
}
```

### Component-Specific Colors:
```css
/* ✅ SAFE - Component-specific overrides */
.component-status-success {
  color: var(--accent-green, #10b981);
}

.component-status-warning {
  color: var(--accent-yellow, #f59e0b);
}
```

## 🔍 SEARCH & REPLACE PATTERNS

### When refactoring old code, ALWAYS replace:

```typescript
// OLD → NEW mappings (MANDATORY)
'#ff5b04' → 'hsl(var(--brand))'
'#ffffff' → 'hsl(var(--surface))'
'#000000' → 'hsl(var(--text))'
'#f5f5f5' → 'hsl(var(--bg))'
'#e5e5e5' → 'hsl(var(--border))'
'#666666' → 'hsl(var(--text-muted))'

// Tailwind classes
bg-white → bg-surface
bg-gray-100 → bg-surface-elevated
text-gray-900 → text-text
text-gray-600 → text-text-muted
border-gray-200 → border-border
```

## 📞 SUPPORT & ESCALATION

### Theme System Contacts:
- **Design Lead**: Responsible for brand color decisions
- **Tech Lead**: Responsible for theme system architecture
- **QA Lead**: Responsible for theme compliance testing

### Escalation Matrix:
1. **Component Developer** → **Tech Lead**
2. **Tech Lead** → **Design Lead**
3. **Design Lead** → **Product Owner**
4. **Product Owner** → **Executive Team**

## ⚡ QUICK CHECKLIST

- [ ] No hardcoded hex colors (#ff0000, #ffffff, etc.)
- [ ] All colors use theme tokens (var(--brand), var(--surface))
- [ ] Components work in both light and dark modes
- [ ] Brand colors never changed (#ff5b04, #e65200)
- [ ] Tailwind classes use theme colors (bg-brand, text-text)

## 🎯 SUCCESS METRICS

### Brand Consistency Score:
- [ ] 100% of new components use theme tokens
- [ ] 0 hardcoded colors in new code
- [ ] All components work in both themes
- [ ] Theme switching is instant and smooth
- [ ] Brand colors never change across versions

---

**REMEMBER**: This theme system protects the F.B/c brand. **RESPECT IT**. **MAINTAIN IT**. **EVOLVE IT SAFELY**. 🌟

**LAW ENFORCED**: All new components **MUST** use brand colors. This is **MANDATORY** and **NON-NEGOTIABLE**. Protect the F.B/c brand! 🛡️🎨
