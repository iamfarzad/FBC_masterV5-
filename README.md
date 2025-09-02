# F.B/c Master V5 - AI-Powered Business Consulting Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/farzad/FBC_masterV5)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

A comprehensive AI-powered business consulting platform featuring real-time chat, intelligent tools, workshop management, and enterprise-grade features.

## 🏗️ Architecture Overview

- **Frontend**: Next.js 15.4.4 with TypeScript
- **Backend**: Server-side API routes with Next.js
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Gemini API
- **Real-time Features**: WebSocket server
- **Styling**: Tailwind CSS with custom theme system
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** package manager
- **Supabase** account and project
- **Google Gemini API** key
- **Chrome browser** with BrowserTools extension (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FBC_masterV5
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # AI Integration
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key

   # Application
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Optional: External Services
   EMAIL_SERVICE_API_KEY=your_email_service_key
   PAYMENT_PROCESSOR_KEY=your_payment_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   supabase db reset
   ```

5. **Development Server**
   ```bash
   # Start all services
   pnpm dev:all

   # Or start individually:
   pnpm dev          # Next.js frontend (port 3000)
   pnpm server       # WebSocket server (port 3001)
   ```

6. **Browser Setup (Development)**
   ```bash
   # Start browser tools (separate terminal)
   pnpm mcp:bridge   # Bridge server (port 3025)
   pnpm mcp:server   # MCP server
   ```

## 📁 Project Structure

```
FBC_masterV5/
├── app/                          # Next.js App Router
│   ├── (chat)/                   # Chat interface
│   ├── (edge)/                   # Edge runtime APIs
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   ├── workshop/                 # Workshop features
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ai-elements/              # AI-powered components
│   ├── chat/                     # Chat-related components
│   ├── ui/                       # Reusable UI components
│   └── workshop/                 # Workshop components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
├── src/                          # Core business logic
│   ├── core/                     # Core services and utilities
│   ├── services/                 # External service integrations
│   └── design/                   # Design system utilities
├── styles/                       # Theme and styling
├── types/                        # TypeScript definitions
├── server/                       # WebSocket server
├── supabase/                     # Database migrations
└── public/                       # Static assets
```

## 🎯 Key Features

### Core Functionality

- **🤖 AI-Powered Chat**: Real-time conversational AI with Google Gemini
- **🛠️ Intelligent Tools**: Calculator, ROI analysis, translation, web preview
- **📊 Business Intelligence**: Market analysis, lead generation, data insights
- **🎥 Video-to-App**: Convert YouTube videos to functional applications
- **👥 Meeting Management**: Schedule and manage business consultations
- **📈 Analytics Dashboard**: Comprehensive business metrics and reporting

### Enterprise Features

- **🔐 Admin Dashboard**: User management and system monitoring
- **📧 Contact Management**: Lead capture and email integration
- **🎓 Workshop Platform**: Educational content and training modules
- **📱 Responsive Design**: Mobile-first approach with perfect UX
- **🌙 Dark/Light Mode**: Complete theme system with brand compliance
- **⚡ Performance**: Optimized for speed and scalability

## 🛠️ Development Commands

```bash
# Development
pnpm dev:all          # Start all services (Next.js + WebSocket)
pnpm dev              # Next.js only
pnpm server           # WebSocket server only

# Browser Tools (Development)
pnpm mcp:bridge       # Browser tools bridge
pnpm mcp:server       # MCP server for browser automation

# Build & Test
pnpm build            # Production build
pnpm lint             # Code linting
pnpm tsc --noEmit     # Type checking
pnpm test             # Run tests

# Database
pnpm db:reset         # Reset Supabase database
pnpm db:migrate       # Run migrations

# Cleanup
pnpm clean            # Clean build artifacts
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Vercel CLI
   vercel --prod
   ```

2. **Environment Variables**
   Set all environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_GEMINI_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

3. **Build Settings**
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
   - **Output Directory**: `.next`

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔧 Configuration

### Theme System

The application uses a strict brand color system:

```css
/* Brand Colors (MANDATORY) */
--brand: #ff5b04;           /* F.B/c Orange */
--brand-hover: #e65200;     /* Hover state */
--bg: #f5f5f5;             /* Light background */
--surface: #ffffff;        /* White surface */
--text: #111111;           /* Primary text */
```

### Browser Tools Setup

For development with browser automation:

1. **Install Chrome Extension**
   ```bash
   # From chrome-extension/ directory
   # Load unpacked extension in Chrome
   ```

2. **Configure MCP Server**
   ```json
   // Cursor settings or .vscode/settings.json
   {
     "mcpServers": {
       "browser-tools": {
         "command": "pnpm",
         "args": ["dlx", "@agentdeskai/browser-tools-mcp@1.2.0"],
         "env": {
           "BROWSER_TOOLS_SERVER_URL": "http://localhost:3025"
         }
       }
     }
   }
   ```

## 🧪 Testing

### Comprehensive Test Suite

The application includes extensive testing:

```bash
# Run all tests
pnpm test

# API Testing
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/intelligence/intent -X POST \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Test message","sessionId":"test"}'
```

### Browser Automation Testing

```bash
# Start browser tools
pnpm mcp:bridge
pnpm mcp:server

# Run automated tests
pnpm test:e2e
```

## 📊 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | AI chat interface |
| `/api/tools/*` | POST | Business tools |
| `/api/intelligence/*` | POST | AI intelligence features |
| `/api/meetings` | GET/POST | Meeting management |
| `/api/admin/*` | GET/POST | Admin functions |

### Example API Usage

```typescript
// Chat API
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

// Tools API
const calcResult = await fetch('/api/tools/calc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    expression: '2 + 2'
  })
});
```

## 🎨 Design System

### Component Library

- **shadcn/ui**: High-quality React components
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Theme**: F.B/c brand-compliant design system

### Color Usage Rules

- **Primary Actions**: Use `bg-brand` and `hover:bg-brand-hover`
- **Secondary Elements**: Use `bg-surface` and `text-text-muted`
- **Text**: Use `text-text` for primary, `text-text-muted` for secondary
- **Borders**: Use `border-border` consistently

## 🔒 Security

### Authentication

- **NextAuth.js**: Enterprise-grade authentication
- **Supabase Auth**: Database-level security
- **API Security**: Rate limiting and validation

### Data Protection

- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Built-in Next.js security

## 📈 Performance

### Optimization Features

- **Next.js App Router**: Server-side rendering
- **Image Optimization**: WebP format with lazy loading
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Intelligent caching strategies
- **Bundle Analysis**: Optimized bundle sizes

### Metrics

- **Lighthouse Score**: 90+ SEO and performance
- **Bundle Size**: < 5MB compressed
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🤝 Contributing

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Code Standards**
   ```bash
   pnpm lint
   pnpm tsc --noEmit
   pnpm build
   ```

3. **Testing**
   ```bash
   pnpm test
   pnpm test:e2e  # If applicable
   ```

4. **Commit Standards**
   ```bash
   git commit -m "feat: add new feature description"
   ```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates

## 📚 Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@fbc-platform.com

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- **F.B/c Team**: For the vision and requirements
- **Open Source Community**: For the amazing tools and libraries
- **Beta Testers**: For valuable feedback and testing

---

**Built with ❤️ by the F.B/c Development Team**

*Last updated: January 2025*
*Version: 5.0.0*
