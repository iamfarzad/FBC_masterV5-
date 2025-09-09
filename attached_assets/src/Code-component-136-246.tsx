# AI Lead Generation System - Design Guidelines

## Core Design Philosophy
- **Holographic Aesthetic**: Flat, black and white design with sophisticated glass morphism
- **Enterprise-Grade**: Professional, minimal, and highly functional
- **Mobile-First**: Responsive layouts optimized for touch interfaces
- **Performance-Focused**: Smooth animations and optimized interactions

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
- Leverage the 16+ AI capabilities system
- Use stage progression for conversation flow
- Implement real-time visual feedback
- Support multimodal interactions (voice, webcam, screen sharing)

## Interaction Guidelines
- **Touch-Optimized**: Minimum 44px touch targets
- **Keyboard Navigation**: Full accessibility support  
- **Loading States**: Skeleton screens and smooth transitions
- **Error Handling**: Graceful degradation with clear messaging

## Performance Standards
- **Bundle Size**: Keep components modular and tree-shakeable
- **Animation Performance**: Use transform and opacity for animations
- **Memory Management**: Clean up event listeners and intervals
- **Code Splitting**: Load heavy components dynamically