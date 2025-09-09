# Unified Component Mapping

This document maps the original chat system component names to your established "Unified" naming convention.

## Core Architecture Components

### Layout and Structure
| Original Name | Your Unified Name | Purpose |
|---------------|-------------------|---------|
| `ChatLayout` | `UnifiedChatLayout` | Main layout wrapper with header, sidebar, content areas |
| `ChatMessages` | `UnifiedMessageContainer` | Message rendering and management system |
| `ChatComposer` | `CleanInputField` | Input field with tool integration (already exists) |
| `ChatSidebar` | `UnifiedActivityMonitor` | Activity monitoring and progress display |

### Canvas and Tool System
| Original Name | Your Unified Name | Purpose |
|---------------|-------------------|---------|
| `CanvasOrchestrator` | `UnifiedCanvasSystem` | Manages different tool canvases and overlays |
| `ToolMenu` | `UnifiedToolMenu` | Dropdown menu for tool selection |
| `ROICalculator` | `UnifiedROICalculator` | Multi-step ROI calculation wizard |

### Message and Communication
| Original Name | Your Unified Name | Purpose |
|---------------|-------------------|---------|
| `MessageComponent` | `UnifiedMessage` | Individual message rendering (already exists) |
| `VoiceOverlay` | `SpeechToSpeechPopover` | Voice input interface (already exists) |
| `ActivityMonitor` | `UnifiedActivityMonitor` | AI activity tracking and display |

## Existing Components (No Changes Needed)

These components already follow your naming convention:

- `UnifiedControlPanel` - Main control panel interface
- `UnifiedMessage` - Message component with rich content support
- `UnifiedMultimodalWidget` - Multimodal widget management
- `WebcamInterface` - Video capture and analysis
- `ScreenShareInterface` - Screen sharing functionality
- `SpeechToSpeechPopover` - Voice input and conversation
- `CleanInputField` - Input field with integrated tools
- `StageRail` - Progress indicator
- `CalendarBookingOverlay` - Booking interface

## State Management (Keep Current Architecture)

Your custom state management system remains unchanged:

- `useAppState` - Your centralized state hook
- `useConversationFlow` - Conversation flow management
- `useAIElementsSystem` - AI elements integration

## Tool System Integration

The new unified tool system integrates with your existing architecture:

```typescript
// Tool activation methods
onToolSelect(toolId: string) // From UnifiedToolMenu
activeTool={state.activeCanvasTool} // Canvas system
showVoiceOverlay={state.showVoiceOverlay} // Voice system
```

## Import Patterns

Use the new unified imports:

```typescript
// New unified imports
import { UnifiedCanvasSystem } from './components/UnifiedCanvasSystem';
import { UnifiedToolMenu } from './components/tools/UnifiedToolMenu';
import { UnifiedActivityMonitor } from './components/UnifiedActivityMonitor';

// Existing imports (unchanged)
import { UnifiedControlPanel } from './components/UnifiedControlPanel';
import { UnifiedMessage } from './components/UnifiedMessage';
import { CleanInputField } from './components/input/CleanInputField';
```

## File Structure Changes

### New Files Added:
- `/components/UnifiedChatLayout.tsx`
- `/components/UnifiedMessageContainer.tsx`
- `/components/UnifiedCanvasSystem.tsx`
- `/components/UnifiedActivityMonitor.tsx`
- `/components/tools/UnifiedToolMenu.tsx`
- `/components/tools/UnifiedROICalculator.tsx`
- `/components/index.ts` (comprehensive exports)

### Existing Files (Preserved):
- All your current components remain unchanged
- Your AI Elements system is fully preserved
- Your state management hooks are untouched
- Your design system and CSS remain intact

## Design System Compatibility

All new components use your established design patterns:

- Glass morphism effects (`glass-card`, `glass-button`)
- Holographic styling (`holo-glow`, `holo-border`)
- Motion animations with `motion/react`
- Your color variables and CSS custom properties
- Responsive design with mobile optimization

## Integration Points

The unified system integrates seamlessly with your existing architecture:

1. **State Management**: Uses your `useAppState` hook
2. **AI Elements**: Integrates with your AI Elements system
3. **Overlays**: Follows your overlay pattern
4. **Tool System**: Extends your existing tool architecture
5. **Design System**: Uses your glass morphism and holographic styles

## Next Steps

1. Import and use the new unified components in your App.tsx
2. Test the integrated tool system
3. Customize any component styling to match your specific requirements
4. Add any additional tools or features using the unified patterns