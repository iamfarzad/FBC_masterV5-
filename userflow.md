

Here's a comprehensive explanation of the userflow when engaging with the chat:

## 🔄 Complete User Journey in F.B/c Chatpage

### **1. Initial Access & Setup**
- **Page Load**: User navigates to `/chat` route
  - **Files**: `app/(chat)/chat/page.tsx` (main chat page component)
- **Session Creation**: Cryptographically secure session ID is generated and stored in localStorage
  - **Files**: `src/core/security/session.ts` (session generation), `app/(chat)/chat/page.tsx` (session state management)
- **Consent Check**: System verifies if user has provided consent (name, email, company URL)
  - **Files**: `app/api/consent/route.ts` (consent API), `components/ui/consent-overlay.tsx` (consent UI)
- **Intelligence Context Loading**: System attempts to fetch user context from previous sessions
  - **Files**: `hooks/useConversationalIntelligence.ts` (context hook), `app/api/intelligence/context/route.ts` (context API)

### **2. Welcome & Onboarding**
- **Empty State**: If no messages exist, user sees welcome screen with:
  - "What can we build together?" heading
  - Personalized greeting based on lead context (if available)
  - Tool selection prompts in sidebar
  - **Files**: `app/(chat)/chat/page.tsx` (welcome UI), `components/ui/fbc-icon.tsx` (brand elements)
- **Contextual Intelligence**: System uses conversational intelligence to:
  - Identify user persona (name, company, role)
  - Generate personalized greetings
  - Fetch lead research data
  - **Files**: `hooks/useConversationalIntelligence.ts` (intelligence logic), `app/api/intelligence/context/route.ts` (context API)

### **3. Tool Selection & Multimodal Features**
User can select from multiple tools in the left sidebar:
- **Chat** (default): Text conversation
  - **Files**: `hooks/useChat-ui.ts` (chat hook), `components/ui/prompt-input.tsx` (input component)
- **Webcam**: Video capture and analysis
  - **Files**: `components/providers/canvas-provider.tsx` (canvas provider), `app/api/tools/webcam/route.ts` (webcam API)
- **Screen Share**: Screen recording
  - **Files**: `app/api/tools/screen/route.ts` (screen share API), `components/chat/CanvasOrchestrator.tsx` (canvas system)
- **Document/ROI Calculator**: Financial analysis
  - **Files**: `app/api/tools/calc/route.ts` (calculator API), `app/workshop/video-to-app/page.tsx` (video processing)
- **Video to App**: Video conversion
  - **Files**: `app/workshop/video-to-app/page.tsx` (video to app page), `app/api/video-to-app/route.ts` (video processing API)
- **Workshop**: Educational content
  - **Files**: `app/workshop/page.tsx` (workshop page), `app/workshop/modules/[slug]/page.tsx` (module pages)

### **4. Message Input Flow**
**Text Input:**
1. User types in the prompt textarea
2. Real-time validation and character counting
3. Enter key or send button triggers message
4. Input is cleared immediately for smooth UX
   - **Files**: `components/ai-elements/prompt-input.tsx` (input component), `app/(chat)/chat/page.tsx` (input handling)

**Voice Input:**
1. User clicks microphone button
2. Voice overlay opens for recording
3. Speech-to-text conversion via multimodal API
4. Transcript appears as user message
5. Real-time voice processing through Edge Functions
   - **Files**: `components/chat/VoiceOverlay.tsx` (voice overlay), `app/api/multimodal/route.ts` (multimodal API), `hooks/useConversationalIntelligence.ts` (voice processing)

### **5. AI Processing Pipeline**
**Two Processing Modes:**

**Standard Mode:**
1. Message sent to `/api/chat` endpoint
2. Request validated using Zod schema
3. Chat service processes through AI provider
4. Streaming response via Server-Sent Events (SSE)
5. Context saved to storage for continuity
   - **Files**: `app/api/chat/route.ts` (chat API), `src/api/chat/handler.ts` (chat handler), `src/core/chat/service.ts` (chat service), `src/core/validation.ts` (validation), `src/core/stream/sse.ts` (SSE streaming)

**Real-Time Mode (Edge Function):**
1. Uses Vercel Edge Runtime for 5x faster processing
2. Direct streaming through Edge Functions
3. Enhanced multimodal capabilities
4. Lower latency responses
   - **Files**: `hooks/useRealtimeChat.ts` (realtime hook), `app/api/realtime-chat/route.ts` (realtime API), `app/api/gemini-live/route.ts` (Gemini live API)

### **6. Response Streaming & Display**
**Real-time Streaming:**
- Messages stream character-by-character
- Loading indicators show typing animation
- Smooth fade-in animations for new messages
- Error handling with fallback to standard mode
  - **Files**: `hooks/useChat-ui.ts` (streaming logic), `app/(chat)/chat/page.tsx` (UI updates)

**Message Display:**
- User messages: Right-aligned, orange gradient background
- AI messages: Left-aligned, clean white/dark cards
- System messages: Special badges for system notifications
- Voice messages: Prefixed with `[Voice]` indicator
  - **Files**: `app/(chat)/chat/page.tsx` (message rendering), `components/ui/badge.tsx` (system badges), `styles/theme.css` (styling)

### **7. Intelligence & Context Features**
**Dynamic Context:**
- Session persistence across page refreshes
- Lead research integration
- Company and persona detection
- Personalized responses based on user context
  - **Files**: `hooks/useConversationalIntelligence.ts` (context management), `src/core/context/context-storage.ts` (context storage), `app/api/intelligence/context/route.ts` (context API)

**Suggested Actions:**
- Context-aware action buttons
- PDF export capabilities
- Meeting booking integration
- Email summary sending
  - **Files**: `components/intelligence/SuggestedActions.tsx` (suggested actions), `app/api/export-summary/route.ts` (PDF export), `app/api/send-pdf-summary/route.ts` (email sending), `components/meeting/BookCallButton.tsx` (meeting booking)

### **8. Activity Tracking & Progress**
**Activity Management:**
- Tool usage tracking
- Progress indicators for long-running tasks
- Activity log with timestamps
- Visual progress rails for multi-step processes
  - **Files**: `app/(chat)/chat/page.tsx` (activity state), `components/collab/StageRail.tsx` (stage rail component)

**Stage Management:**
- Conversation stages tracked (greeting → research → solution → CTA)
- Progress indicators show completion status
- Context-aware suggestions based on current stage
  - **Files**: `hooks/useConversationalIntelligence.ts` (stage logic), `contexts/stage-context.tsx` (stage context)

### **9. Canvas & Tool Integration**
**Canvas System:**
- Modal overlays for specialized tools
- Webcam capture integration
- Screen sharing capabilities
- Document analysis and processing
- ROI calculator with interactive charts
  - **Files**: `components/chat/CanvasOrchestrator.tsx` (canvas orchestrator), `components/providers/canvas-provider.tsx` (canvas provider)

**Tool Orchestration:**
- Seamless switching between tools
- State preservation across tool changes
- Unified multimodal processing
- Real-time voice integration
  - **Files**: `app/(chat)/chat/page.tsx` (tool switching), `hooks/useConversationalIntelligence.ts` (multimodal processing), `app/api/multimodal/route.ts` (multimodal API)

### **10. Export & Conversion Features**
**Summary Generation:**
- PDF export of conversation summaries
- Email delivery of reports
- Data export capabilities
- Analytics integration
  - **Files**: `app/api/export-summary/route.ts` (PDF export), `app/api/send-pdf-summary/route.ts` (email delivery), `app/api/send-lead-email/route.ts` (lead email)

### **11. Error Handling & Recovery**
**Graceful Degradation:**
- Network error fallback to cached responses
- Voice processing fallback to text input
- Real-time mode fallback to standard mode
- Context loading failures don't break chat
  - **Files**: `hooks/useChat-ui.ts` (error handling), `hooks/useRealtimeChat.ts` (fallback logic), `app/global-error.tsx` (global error boundary), `app/error.tsx` (error boundaries)

### **12. Session Management**
**Persistence:**
- Session ID stored in localStorage
- Context caching with TTL (30 seconds)
- Conversation history preservation
- Cross-session continuity
  - **Files**: `src/core/security/session.ts` (session generation), `hooks/useConversationalIntelligence.ts` (context caching)

**Cleanup:**
- Manual message clearing
- Context cache reset
- New session generation
- Activity log maintenance
  - **Files**: `app/(chat)/chat/page.tsx` (cleanup handlers), `hooks/useChat-ui.ts` (clear functions)

## 🔧 Technical Architecture Highlights

- **Real-time Streaming**: Server-Sent Events for live responses
  - **Files**: `src/core/stream/sse.ts` (SSE implementation), `app/api/chat/route.ts` (streaming API)
- **Edge Computing**: Vercel Edge Runtime for performance
  - **Files**: `app/api/chat/route.ts` (edge runtime), `app/api/gemini-live/route.ts` (edge functions)
- **Context Intelligence**: AI-powered user understanding
  - **Files**: `hooks/useConversationalIntelligence.ts` (intelligence hook), `app/api/intelligence/context/route.ts` (context API)
- **Multimodal Processing**: Voice, video, text, and screen integration
  - **Files**: `app/api/multimodal/route.ts` (multimodal API), `hooks/useConversationalIntelligence.ts` (voice processing)
- **Session Continuity**: Persistent conversations across sessions
  - **Files**: `src/core/context/context-storage.ts` (context storage), `src/core/security/session.ts` (session management)
- **Progressive Enhancement**: Works with or without advanced features
  - **Files**: `app/(chat)/chat/page.tsx` (fallback logic), `hooks/useChat-ui.ts` (error recovery)

This userflow creates a sophisticated, intelligent chat experience that adapts to user context, provides multiple interaction modalities, and maintains conversation continuity while offering powerful AI capabilities through an intuitive interface.