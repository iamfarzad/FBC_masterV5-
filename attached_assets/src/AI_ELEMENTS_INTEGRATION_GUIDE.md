# AI Elements Integration Guide

## Step 1: Install AI Elements

Run this command in your project terminal:

```bash
npx ai-elements
```

This will add AI Elements components to your project.

## Step 2: Available Components (After Installation)

AI Elements typically provides these components:

### Core Components
- `Message` - Individual message rendering
- `MessageList` - Container for messages with virtualization
- `MessageInput` - Enhanced input with multimodal support
- `StreamingMessage` - Real-time message streaming
- `TypingIndicator` - Loading states and typing animations

### Enhanced Features
- `AttachmentUpload` - File upload with drag & drop
- `VoiceInput` - Built-in speech recognition
- `CodeBlock` - Syntax highlighted code rendering
- `MessageActions` - Copy, edit, regenerate actions

## Step 3: Integration with Your Holographic Design

### Option A: Enhance Existing LeadGenerationChat

Replace sections of your existing `LeadGenerationChat` component:

```tsx
import { MessageList, MessageInput, StreamingMessage } from '@ai-elements/react';

// In your LeadGenerationChat component, replace the messages area with:
<MessageList 
  className="scrollbar-modern flex-1 overflow-y-auto px-6 py-8"
  messages={messages}
  renderMessage={(message) => (
    <div className={`rounded-2xl rounded-tl-md px-6 py-4 ${
      message.type === 'insight'
        ? 'holo-card geometric-accent'
        : message.type === 'cta'
        ? 'holo-card scan-line'
        : 'holo-card'
    }`}>
      <StreamingMessage 
        message={message} 
        className="text-sm leading-relaxed whitespace-pre-wrap text-current"
      />
    </div>
  )}
/>
```

### Option B: Create Hybrid Component

Combine AI Elements with your existing functionality:

```tsx
import { useAIChat } from '@ai-elements/react';

export const HybridLeadGenerationChat = () => {
  const { messages, input, handleSubmit, isLoading } = useAIChat({
    api: '/api/chat', // Your AI endpoint
  });

  // Combine with your existing conversation state management
  // Keep your lead scoring, voice integration, etc.
};
```

## Step 4: Styling Integration

### Apply Holographic Theme to AI Elements

```tsx
// Custom wrapper for AI Elements
const HolographicMessageList = ({ children, ...props }) => (
  <MessageList
    {...props}
    className={`${props.className} holo-card`}
    style={{
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.02)',
      ...props.style
    }}
  >
    {children}
  </MessageList>
);
```

### CSS Overrides for AI Elements

Add to your `globals.css`:

```css
/* AI Elements Holographic Overrides */
.ai-message {
  @apply holo-card text-foreground;
}

.ai-message-input {
  @apply holo-border bg-transparent text-foreground;
}

.ai-typing-indicator {
  @apply holo-glow;
}

.ai-attachment-upload {
  @apply holo-card hover:holo-glow;
}
```

## Step 5: Enhanced Features Integration

### Voice Integration

```tsx
// Combine AI Elements voice with your SpeechToSpeechPopover
import { VoiceInput } from '@ai-elements/react';
import { SpeechToSpeechPopover } from './SpeechToSpeechPopover';

const EnhancedVoiceInput = () => (
  <div className="flex gap-2">
    <VoiceInput className="holo-border" />
    <SpeechToSpeechPopover /> {/* Your existing component */}
  </div>
);
```

### File Upload Enhancement

```tsx
import { AttachmentUpload } from '@ai-elements/react';

const HolographicFileUpload = () => (
  <AttachmentUpload
    className="holo-card hover:holo-glow"
    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png"
    onUpload={(files) => {
      // Handle file upload with your existing logic
      console.log('Files uploaded:', files);
    }}
  />
);
```

## Step 6: Maintain Your Existing Features

Keep these components from your current implementation:

- ✅ **Lead Generation Flow** - Your conversation stages
- ✅ **Lead Scoring System** - Your business logic  
- ✅ **Voice Integration** - Your SpeechToSpeechPopover
- ✅ **Holographic Design** - Your visual theme
- ✅ **Tool Navigation** - Your sidebar and tools

## Step 7: Progressive Enhancement

1. **Start Small**: Replace just the message rendering first
2. **Add Streaming**: Integrate StreamingMessage for real-time responses
3. **Enhanced Input**: Upgrade to MessageInput with multimodal support
4. **Advanced Features**: Add file upload, voice input, etc.

## Benefits of Integration

- 🚀 **Better Performance** - Virtualized message lists
- 📱 **Mobile Optimization** - Built-in responsive design
- 🎯 **Accessibility** - ARIA compliance and keyboard navigation
- ⚡ **Streaming Support** - Real-time message updates
- 🔧 **Developer Experience** - TypeScript support and better APIs

## Next Steps

1. Run `npx ai-elements` to install
2. Check what components are available in your `node_modules/@ai-elements`
3. Start with MessageList integration
4. Gradually enhance with additional features
5. Maintain your holographic design throughout

Let me know what specific AI Elements components you get after installation, and I'll help you integrate them with your existing holographic design system!