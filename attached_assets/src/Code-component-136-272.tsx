# 🚀 AI Lead Generation System

Enterprise-grade AI-powered lead generation platform with sophisticated conversational intelligence, multimodal interactions, and holographic design system.

## ✨ Features

### 🧠 AI Intelligence
- **7-Stage Conversation Flow**: Greeting → Email Capture → Company Research → Problem Discovery → Solution Positioning → Consultation Booking
- **16+ AI Capabilities**: Document analysis, real-time processing, source citation, adaptive learning
- **Lead Scoring & Analytics**: Dynamic qualification and conversation intelligence
- **Streaming AI Responses**: Real-time text generation with visual feedback

### 🎙️ Multimodal Interfaces  
- **Speech-to-Speech AI**: Voice conversations with live audio visualization
- **Webcam Integration**: Video calls with AI-powered facial analysis
- **Screen Sharing**: Real-time screen analysis and workflow optimization
- **Unified Widget System**: Seamless switching between interaction modes

### 🎨 Design System
- **Holographic Aesthetic**: Sophisticated glass morphism with black/white palette
- **Responsive Design**: Mobile-first with touch-optimized interfaces  
- **Advanced Animations**: Motion design with premium visual feedback
- **Theme Switching**: Light/dark mode with smooth transitions

### 📊 Business Intelligence
- **PDF Generation**: Automated strategy reports and conversation summaries
- **Calendar Booking**: Integrated consultation scheduling system
- **File Upload & Analysis**: Document processing with AI insights
- **Progress Tracking**: Visual conversation flow and capability usage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS v4, Custom CSS Variables
- **UI Library**: ShadCN/UI Components
- **Animations**: Motion (Framer Motion)
- **AI Integration**: Google Gemini Live API
- **Package Manager**: PNPM
- **Development**: Hot reload, TypeScript checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PNPM 8+

### Installation

```bash
# Clone and setup
git clone <your-repo>
cd ai-lead-generation-system

# Run automated setup
pnpm setup

# Manual setup (alternative)
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Open browser
open http://localhost:3000
```

### Production

```bash
# Build for production
pnpm build

# Start production server  
pnpm start
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router
├── components/             # React Components
│   ├── ai-elements/       # AI Capabilities System
│   ├── chat/              # Chat Interface Components  
│   ├── indicators/        # Loading & Status Indicators
│   ├── input/             # Input Field Components
│   ├── overlays/          # Modal & Overlay Components
│   ├── panels/            # Control Panel Components
│   ├── screens/           # Full Screen Components
│   └── ui/                # ShadCN UI Library
├── hooks/                 # Custom React Hooks
├── constants/             # App Constants & Config
├── services/              # Business Logic Services
├── styles/                # Global CSS & Tailwind
└── Guidelines.md          # Design System Guidelines
```

## 🎯 Key Components

### Core App Components
- **App.tsx**: Main application component
- **UnifiedControlPanel**: Primary interface controls
- **UnifiedMessage**: Advanced message rendering
- **CleanInputField**: Intelligent input with voice integration

### AI Elements System
- **ai-system.tsx**: Central AI capabilities management
- **conversation.tsx**: Conversation flow logic
- **response.tsx**: AI response handling
- **tool.tsx**: AI tool integrations

### Multimodal Interfaces
- **SpeechToSpeechPopover**: Voice AI interface
- **WebcamInterface**: Video call component
- **ScreenShareInterface**: Screen sharing analysis
- **UnifiedMultimodalWidget**: Widget management system

## 🔧 Configuration

### Environment Variables
Create `.env.local`:

```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_key
```

### Tailwind Configuration
Advanced holographic design system with:
- Custom CSS variables for colors and effects
- Glass morphism utilities
- Animation keyframes
- Responsive breakpoints

## 📚 Development Guide

### Adding New Components
1. Create in appropriate `/components` subdirectory
2. Follow naming convention: `PascalCase.tsx`
3. Export from directory index if needed
4. Use TypeScript interfaces for props

### Styling Guidelines
- Use Tailwind utility classes
- Leverage custom CSS variables from globals.css
- Apply glass morphism effects: `glass-card`, `glass-button`
- Use holographic utilities: `holo-glow`, `holo-border`

### AI Integration
- Extend capabilities in `ai-elements/ai-system.tsx`
- Add new conversation stages in `conversation.tsx` 
- Use hooks for state management
- Follow the established conversation flow pattern

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t ai-lead-generation .

# Run container
docker run -p 3000:3000 ai-lead-generation
```

## 📈 Performance

- **Bundle Analysis**: Run `pnpm analyze`
- **Type Checking**: Run `pnpm type-check`
- **Linting**: Run `pnpm lint:fix`
- **Preview Build**: Run `pnpm preview`

## 🤝 Contributing

1. Follow the design guidelines in `Guidelines.md`
2. Maintain TypeScript strict mode
3. Use conventional commit messages
4. Test responsive design thoroughly
5. Ensure accessibility compliance

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for enterprise lead generation**