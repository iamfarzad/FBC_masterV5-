# 🎬 Video-to-App Integration Documentation

## Overview

The F.B/c Video-to-App integration is a comprehensive system that allows users to transform YouTube videos into interactive learning applications directly within the chat interface. This feature combines AI-powered video analysis with an intuitive workshop experience for creating educational content.

## 🎯 Key Features

- **Automatic URL Detection**: Detects YouTube URLs in chat messages
- **Inline Card System**: Shows video-to-app cards directly in chat
- **Real-time Progress**: Live progress tracking during app generation
- **Workshop Integration**: Seamless transition to full workshop experience
- **App Preview**: Instant preview of generated learning apps
- **Export Options**: Multiple ways to save and share created apps

## 🔄 User Journey

### 1. URL Detection
```
User pastes YouTube URL → System detects → Inline card appears
```

### 2. App Generation
```
Click "Generate App" → AI analyzes video → Progress updates → App preview
```

### 3. Workshop Access
```
Click "Open Workshop" → Full editing experience → Advanced features
```

## 🛠️ Technical Implementation

### Core Components

#### 1. URL Detection System (`lib/youtube-url-detection.ts`)
```typescript
// Detects YouTube URLs in text
detectYouTubeUrls(text: string): string[]

// Validates URL format
isValidYouTubeUrl(url: string): boolean

// Extracts video information
getYouTubeVideoInfo(url: string): YouTubeVideoInfo

// Creates video-to-app card data
createVideoToAppCard(videoUrl: string, sessionId?: string)
```

#### 2. Detection Hook (`hooks/use-video-to-app-detection.ts`)
```typescript
// React hook for video detection
useVideoToAppDetection({
  messages: Message[],
  onVideoDetected: (messageId, videoUrl, card) => void,
  onVideoToAppStart: (messageId, videoUrl) => void,
  sessionId?: string
})
```

#### 3. Workshop Components
- **VideoLearningToolClient**: Main workshop interface
- **VideoToApp**: Core video-to-app component
- **Progress Tracker**: Real-time generation progress

### API Integration

#### Endpoint: `/api/video-to-app`

**Generate Spec**:
```typescript
POST /api/video-to-app
{
  "action": "generateSpec",
  "videoUrl": "https://youtube.com/watch?v=...",
  "userPrompt": "Focus on key concepts",
  "sessionId": "chat_session_123"
}
```

**Generate Code**:
```typescript
POST /api/video-to-app
{
  "action": "generateCode",
  "spec": "Generated specification...",
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

### Data Flow

```
1. User Message → 2. URL Detection → 3. Card Creation
                        ↓
4. User Clicks Generate → 5. API Call (Spec) → 6. Progress Update
                        ↓
7. API Call (Code) → 8. App Generation → 9. Preview Display
                        ↓
10. Workshop Access → 11. Full Editing Experience
```

## 🎨 UI Components

### Inline Chat Card

```typescript
// Appears below messages with YouTube URLs
<VideoToAppCard
  videoUrl={detectedUrl}
  status="pending|analyzing|generating|completed|error"
  progress={0-100}
  onGenerate={() => startGeneration()}
  onOpenWorkshop={() => openWorkshop()}
/>
```

### Card States

#### 1. Initial State (Pending)
- Shows video thumbnail and info
- "Generate App" button
- "Open Workshop" option

#### 2. Analyzing State
- Progress bar with "Analyzing video content..."
- Real-time progress updates

#### 3. Generating State
- Progress bar with "Generating interactive app..."
- Status updates

#### 4. Completed State
- Live app preview in iframe
- Export options (Copy HTML, Download, Share)
- Full workshop access

#### 5. Error State
- Error message display
- Retry options
- Workshop fallback

## 🔧 Configuration

### Supported URL Formats

```typescript
// All these formats are automatically detected:
"https://www.youtube.com/watch?v=VIDEO_ID"
"https://youtu.be/VIDEO_ID"
"https://youtube.com/embed/VIDEO_ID"
"https://youtube.com/shorts/VIDEO_ID"
```

### Progress Steps

```typescript
const PROGRESS_STEPS = [
  { id: 'analyze', label: 'Analyzing Video', duration: 25 },
  { id: 'spec', label: 'Generating Spec', duration: 25 },
  { id: 'code', label: 'Building App', duration: 45 },
  { id: 'ready', label: 'App Ready', duration: 5 }
]
```

### Workshop Modes

```typescript
type WorkshopMode = 'card' | 'fullscreen' | 'workshop'

interface WorkshopProps {
  mode: WorkshopMode
  videoUrl?: string
  onVideoUrlChange?: (url: string) => void
  onAppGenerated?: (appUrl: string, videoUrl: string) => void
}
```

## 📱 Mobile Responsiveness

### Adaptive Layouts
- **Desktop**: Side-by-side video and app preview
- **Tablet**: Stacked layout with collapsible sections
- **Mobile**: Single-column with swipe navigation

### Touch Interactions
- **Large buttons**: 44px minimum touch targets
- **Swipe gestures**: Navigate between workshop sections
- **Pull-to-refresh**: Reload app preview

## 🔒 Security & Privacy

### Content Security
- **Sandbox iframes**: Generated apps run in sandboxed iframes
- **Input validation**: All URLs validated before processing
- **Rate limiting**: API calls throttled per user/session

### Data Handling
- **No video storage**: Videos are not downloaded or stored
- **Transcript processing**: Only text transcripts processed
- **Session isolation**: Each chat session maintains separate state

## 📊 Analytics & Monitoring

### Usage Tracking
```typescript
// Tracks video-to-app interactions
recordCapabilityUsed(sessionId, 'video2app', {
  action: 'spec|code',
  hasTranscript: boolean,
  videoUrl: string,
  generationTime: number
})
```

### Performance Metrics
- **Generation time**: Average time to create apps
- **Success rate**: Percentage of successful generations
- **User engagement**: Workshop usage patterns
- **Error rates**: Failure points and recovery

## 🚀 Advanced Features

### Context Sharing
- **Chat ↔ Workshop**: Seamless state synchronization
- **Session persistence**: Apps saved across page refreshes
- **Multi-device sync**: Access apps from different devices

### Customization Options
- **Learning focus**: Custom prompts for app generation
- **Template selection**: Pre-built learning app templates
- **Style customization**: Theme and branding options

### Export Formats
- **HTML download**: Self-contained web application
- **Code copy**: Raw HTML/CSS/JS for integration
- **Share links**: Direct access URLs for generated apps

## 🔧 Troubleshooting

### Common Issues

#### URL Not Detected
```typescript
// Check URL format
const isValid = isValidYouTubeUrl(url)
console.log('Valid YouTube URL:', isValid)
```

#### Generation Fails
```typescript
// Check API response
const response = await fetch('/api/video-to-app', {...})
if (!response.ok) {
  const error = await response.json()
  console.error('Generation failed:', error)
}
```

#### Workshop Won't Load
```typescript
// Check workshop URL construction
const workshopUrl = `/workshop/video-to-app?url=${encodeURIComponent(videoUrl)}`
window.open(workshopUrl, '_blank')
```

## 📈 Future Enhancements

### Planned Features
- **Multi-platform support**: Vimeo, TikTok, educational platforms
- **Collaborative editing**: Real-time workshop collaboration
- **Analytics dashboard**: Usage and engagement metrics
- **Template marketplace**: Community-created app templates
- **LMS integration**: Direct integration with learning management systems

### API Extensions
- **Batch processing**: Generate multiple apps simultaneously
- **Custom prompts**: Advanced prompt engineering options
- **Quality scoring**: App quality and effectiveness ratings
- **Accessibility audit**: WCAG compliance checking

## 📚 Related Documentation

- [Architecture Overview](../docs/ARCHITECTURE_OVERVIEW.md)
- [Frontend Design](../docs/frontend_design.md)
- [API Reference](../docs/api-reference.md)
- [User Guide](../docs/user-guide.md)

---

## 🎯 Quick Start

1. **Paste YouTube URL** in any chat message
2. **Wait for card** to appear automatically
3. **Click "Generate App"** to start AI processing
4. **Watch progress** as the app is created
5. **Preview result** in the inline card
6. **Access workshop** for full editing experience

The system handles everything automatically - just paste a YouTube URL and watch the magic happen! ✨
