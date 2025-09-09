# AI Lead Generation System - Design Guidelines

## Core Design Philosophy
- **Holographic Aesthetic**: Flat, black and white design with sophisticated glass morphism
- **Enterprise-Grade**: Professional, minimal, and highly functional
- **Mobile-First**: Responsive layouts optimized for touch interfaces
- **Performance-Focused**: Smooth animations and optimized interactions

## State Management Architecture

### Zustand Store System - PERFORMANCE OPTIMIZED ⚡
- **Primary Store** (`useAppStore`): UI state, messages, overlays, multimodal interfaces
- **AI Store** (`useAIStore`): AI capabilities, conversation stages, intelligence metrics
- **Immutable Updates**: Pure functions with object spread (NO Immer to prevent loops)
- **Persistence**: Critical state persisted with localStorage
- **DevTools**: Full Redux DevTools integration for debugging

### Store Usage Guidelines - CRITICAL FOR PERFORMANCE ⚠️
```typescript
// ✅ Use direct selectors for optimal performance
const messages = useAppStore(state => state.messages);
const theme = useAppStore(state => state.theme);

// ✅ Use store actions directly
const { addMessage, setTheme } = useAppStore();

// ❌ NEVER use helper selectors in frequently updating components
const { isLoading, theme } = useUIState(); // Can cause excessive re-renders

// ✅ Debounce expensive operations
useEffect(() => {
  const timeoutId = setTimeout(() => {
    updateSystem(messages);
  }, 100);
  return () => clearTimeout(timeoutId);
}, [messageCount]); // Use derived values, not full objects
```

### State Update Patterns - PREVENT INFINITE LOOPS 🚫
- **Pure Updates**: Always return new objects `set(() => ({ newState }))`
- **Batch Updates**: Group related changes in single `set()` call
- **NO Circular Calls**: Never call store actions from within other store actions
- **Debounce System Updates**: Use setTimeout for expensive operations like `updateSystem`

## Visual System

### Colors & Themes
- **Light Mode**: Pure white backgrounds with carbon black text
- **Dark Mode**: Void black backgrounds with pure white text  
- **Accents**: Holographic borders with subtle glows
- **Interactive States**: Glass morphism with backdrop blur effects

### Typography
- **Base Font Size**: 14px (as defined in globals.css)
- **Font Weights**: Medium (500) for headings, Normal (400) for body text
- **Line Height**: 1.5 for optimal readability
- **Never override** font size, weight, or line-height classes unless specifically requested

### Component Standards

#### Buttons
- Use `glass-button` class for primary actions
- Apply `modern-button` for enhanced interactions
- Include shimmer effects on hover
- Scale transforms on active states

#### Cards & Surfaces  
- Use `glass-card` or `modern-card` for elevated content
- Apply `holo-border` for subtle holographic edges
- Include `backdrop-filter` for glass morphism

#### Animations
- Use `transition-smooth` for standard interactions
- Apply `animate-smooth-fade-in` for content reveals
- Implement `holo-glow` for premium visual feedback

## Layout Principles
- **Responsive Grid**: Use flexbox and CSS Grid, avoid absolute positioning
- **Component Modularity**: Keep components focused and reusable
- **Clean Architecture**: Separate concerns, extract utilities

## AI Elements Integration
- **16+ AI Capabilities**: Managed through AI store with automatic activation
- **7-Stage Conversation Flow**: Automatic stage progression based on user interactions
- **Real-time Intelligence**: Conversation metrics, lead scoring, business insights
- **Adaptive Learning**: User preference detection and response optimization

### AI Capability Management - OPTIMIZED ⚡
```typescript
// ✅ Batch capability updates in updateSystem
const updates = { capabilityUsage: { ...state.capabilityUsage, active: newActive } };

// ✅ Prevent circular updates
updateSystem: (messages) => {
  // Process all updates in single function
  // Apply with single set() call
  set(() => updates);
}

// ❌ Never call actions from within actions
activateCapability('real-time-processing'); // Inside another action = infinite loop
```

## Component Integration Guidelines

### Store Integration in Components
- **Selective Subscriptions**: Only subscribe to needed state slices
- **Action Binding**: Extract actions at component level, pass to children
- **Performance**: Use memo() for expensive components with store dependencies

### Event Handler Patterns - PERFORMANCE CRITICAL ⚡
```typescript
// ✅ Optimal: Direct store actions with minimal dependencies
const { addMessage, setLoading } = useAppStore();
const handleSubmit = useCallback(() => {
  addMessage(newMessage);
  setLoading(true);
}, [addMessage, setLoading]);

// ✅ For complex logic: Memoize with stable dependencies
const handleFileUpload = useCallback((files) => {
  activateCapability('document-analysis');
  addMessage(generateAnalysisMessage(files));
}, [activateCapability, addMessage]);

// ❌ Never create new objects in dependencies
const handleClick = useCallback(() => {
  updateState({ newProp: value }); // Creates new object every render
}, [updateState, { newProp: value }]); // This dependency changes every render
```

## Interaction Guidelines
- **Touch-Optimized**: Minimum 44px touch targets
- **Keyboard Navigation**: Full accessibility support  
- **Loading States**: Skeleton screens and smooth transitions
- **Error Handling**: Graceful degradation with clear messaging

## Performance Standards - CRITICAL ⚠️
- **Store Optimization**: Use direct selectors to minimize re-renders
- **Debouncing**: Add timeouts for expensive operations like `updateSystem`
- **Memoization**: Use `React.memo()`, `useMemo()`, and `useCallback()` appropriately
- **Dependency Arrays**: Only include primitive values or stable references
- **Bundle Size**: Keep components modular and tree-shakeable

## Error Prevention Guidelines 🚫
- **Infinite Loop Prevention**: Never call store actions from within other store actions
- **Memory Management**: Clean up timeouts and intervals in `useEffect` cleanup
- **State Mutations**: Always use pure functions with object spread
- **Circular Dependencies**: Avoid components that update state they also subscribe to

## Migration Notes - FIXES APPLIED ✅
- **Fixed Infinite Loops**: Replaced Immer with pure object spread updates
- **Optimized Selectors**: Direct property access instead of helper hooks
- **Debounced Updates**: Added timeouts for expensive operations
- **Performance Monitoring**: DevTools integration for debugging re-renders