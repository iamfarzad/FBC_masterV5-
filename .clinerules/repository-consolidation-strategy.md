## Brief overview
Guidelines for consolidating multiple FBC repositories into a unified codebase. These rules are specific to working with the four FBC repositories and ensure that all existing tested functionality is preserved during consolidation.

## Repository analysis approach
- Always examine actual implementation files, not just directory structures
- Read the complete source code of key components to understand architectural differences
- Compare import paths and architectural patterns between repositories
- Identify unique features and sophisticated implementations in each repository
- Never assume one repository is "primary" without thorough analysis

## File discovery and reuse strategy
- Every function, component, or feature needed already exists in one of the four repositories
- Search across all repositories before creating new implementations
- Prioritize sophisticated implementations over simple ones
- Look for tested, production-ready code patterns
- Preserve advanced features like business content rendering, collaboration systems, and UI variants

## Architecture consolidation rules
- Use hybrid approach combining best elements from each repository
- FBC_LAB_v0 has the most sophisticated chat implementation (ChatArea - 500+ lines)
- fbc_v4 has advanced architecture patterns (src/core) and performance optimizations
- FB-c_labV3-main has complete collaboration system (CollabShell + 12 components)
- FB-c_labV2 has enhanced UI variants and studio components
- Harmonize import paths and resolve architectural conflicts during integration

## Component integration priorities
- Start with the most sophisticated chat implementation from FBC_LAB_v0
- Integrate advanced architecture patterns from fbc_v4
- Add complete collaboration system from FB-c_labV3-main
- Enhance with UI variants from FB-c_labV2
- Preserve all unique features like BusinessContentRenderer, CollabShell, UI variants

## Quality assurance approach
- Validate that all existing functionality is preserved
- Test integration points between different repository components
- Ensure import paths resolve correctly after consolidation
- Verify that sophisticated features like animations and business interactions work
- Maintain production-ready error handling and performance optimizations

## Communication expectations
- Challenge superficial analysis and demand thorough examination
- Expect detailed implementation comparisons with code examples
- Require identification of unique features and architectural differences
- Push for comprehensive understanding of each repository's strengths
- Insist on preserving sophisticated implementations over simple ones

---

## 🔍 **ANALYSIS MATRIX - FEATURE EXTRACTION**

### **1. Chat Components Analysis**

| Feature | FBC_LAB_v0 | FB-c_labV2 | FB-c_labV3-main | fbc_v4 | BEST CHOICE |
|---------|------------|------------|-----------------|--------|-------------|
| **Styling** | Basic gradients | CSS custom props | Same as v2 | Advanced with motion | **fbc_v4** - Framer Motion + animations |
| **Architecture** | Old `@/lib/utils` | Old `@/lib/utils` | New `@/src/core/utils` | New `@/src/core/utils` | **FB-c_labV3-main/fbc_v4** - Modern architecture |
| **Features** | Basic bubble | Basic bubble | Basic bubble | Avatars, timestamps, typing indicator | **fbc_v4** - Most complete feature set |
| **Animations** | None | None | None | Framer Motion | **fbc_v4** - Smooth animations |

### **2. Architecture Patterns**

| Pattern | FBC_LAB_v0 | FB-c_labV2 | FB-c_labV3-main | fbc_v4 | BEST CHOICE |
|---------|------------|------------|-----------------|--------|-------------|
| **File Structure** | Mixed | Mixed | `src/core/` emerging | Clean `src/core/` | **fbc_v4** - Cleanest architecture |
| **Import Paths** | `@/lib/` | `@/lib/` | Mixed old/new | `@/src/core/` | **fbc_v4** - Consistent modern paths |
| **Type Safety** | Basic | Basic | Improved | Strict TypeScript | **fbc_v4** - Most type-safe |

### **3. UI/UX Features**

| Feature | FBC_LAB_v0 | FB-c_labV2 | FB-c_labV3-main | fbc_v4 | BEST CHOICE |
|---------|------------|------------|-----------------|--------|-------------|
| **Theme System** | Basic | CSS variables | CSS variables | Design tokens | **fbc_v4** - Most sophisticated |
| **Responsive** | Basic | Basic | Improved | Advanced | **fbc_v4** - Best responsive design |
| **Accessibility** | Basic | Basic | Basic | Enhanced | **fbc_v4** - Best accessibility |

---

## 🏆 **EXTRACTION PLAN**

### **Phase 1: Core Architecture (fbc_v4)**
- Extract `src/core/` structure
- Extract modern import paths
- Extract TypeScript strict configuration

### **Phase 2: Advanced Chat Components (fbc_v4)**
- Extract `ChatBubble` with animations
- Extract `TypingIndicator`
- Extract avatar integration

### **Phase 3: Theme System (FB-c_labV2 + fbc_v4)**
- Extract CSS custom properties from v2
- Extract design tokens from v4
- Merge into unified theme system

### **Phase 4: UI Enhancements (FB-c_labV3-main)**
- Extract any unique UI patterns
- Extract collaboration features if superior

### **Phase 5: Legacy Integration (FBC_LAB_v0)**
- Extract any unique business logic
- Extract tested components not in other repos

---

## 🎯 **EXECUTION STRATEGY**

1. **Start with fbc_v4** as the base (cleanest architecture)
2. **Layer in FB-c_labV2** theme system improvements
3. **Add FB-c_labV3-main** collaboration features if better
4. **Cherry-pick FBC_LAB_v0** unique features
5. **Test each integration** before moving to next phase
