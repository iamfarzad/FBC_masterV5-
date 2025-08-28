
# 🚀 **F.B/c AI Consulting Platform - V3**

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-00d4aa?style=for-the-badge)](https://www.farzadbayat.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen?style=for-the-badge)](https://www.farzadbayat.com)

**Professional AI-powered consulting platform** with multimodal capabilities, modern design system, and enterprise-grade architecture.

## 🎯 **What is F.B/c?**

F.B/c is a **production-ready multimodal AI consulting platform** that combines:

- 🤖 **Real Gemini Live API** integration with multimodal support
- 🎨 **Modern glass morphism design system** with 8 button variants & 7 card variants
- 🏗️ **Clean SRC architecture** with 70% code reduction
- 📱 **Mobile-optimized** interface with 44px touch targets
- 🔒 **Enterprise security** with JWT auth and rate limiting
- 📊 **Business intelligence** tools and ROI calculators

---

## 🌟 **Key Features**

### **🤖 Multimodal AI System**
- **Real-time chat** with AI assistant
- **Voice input** with transcription
- **Image analysis** (webcam & screen capture)
- **Document processing** with auto-analysis
- **Context-aware** conversations across modalities

### **🎨 Modern Design System**
- **Glass morphism** effects and animations
- **Responsive design** with mobile-first approach
- **WCAG 2.1 AA** accessibility compliance
- **Professional branding** and consistent UI
- **Dark/light theme** support

### **🏢 Business Intelligence**
- **Lead research** with Google integration
- **ROI calculators** with financial analysis
- **Consultation workflow** management
- **Proposal generation** with actionable tasks
- **Client management** and analytics

### **🔧 Enterprise Features**
- **JWT authentication** and admin dashboard
- **Rate limiting** and security middleware
- **File upload** with security validation
- **PDF generation** and email automation
- **Real-time collaboration** tools

---

## 🏗️ **Architecture Overview**

### **Clean SRC Pattern**
```
src/
├── core/          # Framework-agnostic business logic
│   ├── intelligence/    # AI services & lead research
│   ├── auth/           # Authentication logic
│   ├── types/          # TypeScript definitions
│   └── services/       # External integrations
├── api/           # Pure API handlers (no Next.js imports)
└── examples/      # Implementation examples

app/               # Next.js framework layer
├── api/           # Route handlers only
├── middleware/    # Security & rate limiting
└── (pages)/       # UI components & layouts

components/        # Reusable React components
hooks/            # Custom React hooks
```

### **Performance Achievements**
- ✅ **731KB bundle** (optimized for speed)
- ✅ **29s build time** (fast compilation)
- ✅ **74 static pages** generated
- ✅ **Zero build errors**
- ✅ **70% code complexity reduction**

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 20.17.0+
- pnpm 9.0.0+
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/iamfarzad/FB-c_labV3-main.git
cd FB-c_labV3-main

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your production API keys
```

### **Development**

```bash
# Start development server
pnpm dev

# Start with WebSocket server for live features
pnpm dev:all

# Run comprehensive tests
pnpm test:all

# Check code quality
pnpm verify:all
```

### **Production Build**

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

---

## 🌐 **Live Deployment**

**Production URL**: [https://www.farzadbayat.com](https://www.farzadbayat.com)

### **Available Endpoints**
- **Main Site**: `https://www.farzadbayat.com/`
- **AI Chat**: `https://www.farzadbayat.com/chat`
- **Admin**: `https://www.farzadbayat.com/admin`
- **Consulting**: `https://www.farzadbayat.com/consulting`
- **Contact**: `https://www.farzadbayat.com/contact`

### **API Endpoints**
- **Chat API**: `/api/chat` - Main chat interface
- **Intelligence**: `/api/intelligence-v2` - AI processing
- **Tools**: `/api/tools/*` - Business tools (ROI, file upload, etc.)
- **Admin**: `/api/admin/*` - Admin dashboard APIs

---

## 🛠️ **Technology Stack**

### **Core Technologies**
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5.x with strict mode
- **Styling**: Tailwind CSS with custom design system
- **AI**: Google Gemini Live API with multimodal support
- **Database**: Supabase with real-time subscriptions

### **UI/UX Libraries**
- **Components**: Radix UI primitives
- **Icons**: Lucide React & Phosphor Icons
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### **Development Tools**
- **Build**: pnpm with optimized package imports
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint with custom rules
- **Deployment**: Vercel with edge functions

---

## 📊 **Project Structure**

### **Source Code Organization**
```
├── src/core/           # Business logic (framework-agnostic)
│   ├── intelligence/   # AI services & research
│   ├── auth/          # Authentication & security
│   ├── types/         # TypeScript definitions
│   ├── services/      # External API integrations
│   └── multimodal/    # Cross-modal context management
│
├── src/api/           # API handlers (pure functions)
│   ├── chat/          # Chat processing
│   ├── intelligence/  # AI intelligence
│   └── tools/         # Business tools
│
├── app/               # Next.js framework layer
│   ├── api/          # Route handlers
│   ├── middleware/   # Security middleware
│   └── (pages)/      # UI components
│
├── components/        # Reusable React components
│   ├── ui/           # Base UI components
│   ├── ai-elements/  # AI-specific components
│   └── chat/         # Chat interface components
│
└── hooks/            # Custom React hooks
```

### **Key Architecture Benefits**
- **70% less code** through clean architecture
- **Framework independence** in `src/` directory
- **Single source of truth** for each domain
- **Type-safe** throughout with strict TypeScript
- **Testable** pure functions and services

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_secure_jwt_secret

# Optional
RESEND_API_KEY=your_email_api_key
ADMIN_PASSWORD=your_admin_password
```

### **Feature Flags**
Control features via URL parameters:
```bash
# Enable all features
?ff=all

# Enable specific features
?ff=use_modern_design,multimodal_chat

# Check active flags
pnpm flags
```

---

## 🧪 **Testing & Quality**

### **Comprehensive Test Suite**
```bash
# Run all tests
pnpm test:all

# Unit tests only
pnpm test:unit

# End-to-end tests
pnpm test:e2e

# Performance tests
pnpm test:performance
```

### **Code Quality Checks**
```bash
# Full verification
pnpm verify:all

# ESLint only
pnpm lint

# Type checking
pnpm build
```

### **Debug Tools**
```bash
# Debug chat functionality
node debug-chat.js

# Test SSE streaming
node debug-sse.js

# UI audit tools
node ui-audit-comprehensive.js
```

---

## 🚀 **Deployment & DevOps**

### **Vercel Deployment**
```bash
# CLI deployment
pnpm add -g vercel
vercel login
vercel --prod

# GitHub integration
# Connect repo to Vercel dashboard
# Automatic deployments on main branch
```

### **Environment Setup**
- **Development**: `pnpm dev` (local)
- **Staging**: Branch deployments on Vercel
- **Production**: Main branch auto-deploy

### **Monitoring**
```bash
# Monitor Gemini API usage
pnpm monitor-costs

# Production diagnostics
pnpm diagnose-production
```

---

## 🎯 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/your-feature`
3. **Develop** with tests: `pnpm test:unit`
4. **Quality check**: `pnpm verify:all`
5. **Create PR** with comprehensive description

### **Code Standards**
- **TypeScript strict mode** required
- **Clean SRC architecture** must be followed
- **Comprehensive tests** for new features
- **Design system compliance** for UI changes
- **Performance optimization** in production code

---

## 📄 **Documentation**

### **Architecture Docs**
- **[SRC_ARCHITECTURE.md](./SRC_ARCHITECTURE.md)** - Clean architecture guidelines
- **[REFACTOR_STATUS.md](./REFACTOR_STATUS.md)** - Migration progress & benefits
- **[UI_UX_REFACTOR_PLAN.md](./UI_UX_REFACTOR_PLAN.md)** - Design system documentation

### **API Documentation**
- **Chat API**: Server-sent events streaming
- **Intelligence API**: Multimodal processing
- **Tools API**: Business calculators & utilities
- **Admin API**: Dashboard and analytics

### **Deployment Guides**
- **[FINAL_SETUP_README.md](./FINAL_SETUP_README.md)** - Production setup
- **[V3_MIGRATION_SUCCESS.md](./V3_MIGRATION_SUCCESS.md)** - Migration summary

---

## 📞 **Support & Contact**

- **Website**: [https://www.farzadbayat.com](https://www.farzadbayat.com)
- **Email**: hello@farzadbayat.com
- **LinkedIn**: [Farzad Bayat](https://linkedin.com/in/farzadbayat)
- **Repository**: [GitHub](https://github.com/iamfarzad/FB-c_labV3-main)

---

## 🎉 **Ready for Production**

**F.B/c is a production-ready multimodal AI consulting platform** with:
- ✅ **Enterprise-grade architecture** with clean separation of concerns
- ✅ **Modern design system** with professional branding
- ✅ **Real Gemini AI integration** with multimodal capabilities
- ✅ **Scalable infrastructure** ready for business growth
- ✅ **Comprehensive testing** and quality assurance

**Deploy with confidence - your AI consulting platform is ready to serve clients!** 🚀

---

*Built with ❤️ by Farzad Bayat - AI Consultant & Automation Expert*
