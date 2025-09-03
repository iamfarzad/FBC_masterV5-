# AI-Powered Chat Application - Replit Project Setup

## Overview
This is a sophisticated Next.js application featuring AI-powered conversational intelligence, built with React 19, Next.js 15.4.4, and various AI integrations including Google Gemini API.

## Project Architecture
- **Frontend**: Next.js 15.4.4 with React 19
- **Styling**: Tailwind CSS with custom design tokens
- **AI Integration**: Google Gemini API, Perplexity API
- **Database**: Supabase (optional)
- **Build System**: pnpm package manager
- **Development**: TypeScript with strict configuration

## Recent Changes (Project Import Setup)
- **Date**: September 3, 2025
- **Status**: Successfully imported and configured for Replit environment

### Configuration Updates Made:
1. **Next.js Configuration**: Updated `next.config.mjs` for Replit environment
2. **Environment Variables**: Created `.env.local` with development settings
3. **Middleware**: Modified security headers to allow Replit proxy framing
4. **Dependencies**: Installed using pnpm (1816 packages)
5. **Workflow**: Configured to serve on port 5000 with HOSTNAME=0.0.0.0

### Current Setup:
- **Development Server**: Running on port 5000
- **Host Binding**: 0.0.0.0 (required for Replit proxy)
- **Mock Mode**: Enabled for development without API keys
- **Security**: CSP headers configured for Replit environment

## User Preferences
- **Package Manager**: pnpm (project configured for this)
- **Development**: Mock mode enabled for testing without API keys
- **Environment**: Optimized for Replit development environment

## Project Structure
- `app/` - Next.js app router pages and API routes
- `components/` - React components organized by feature
- `src/core/` - Core business logic and services
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `middleware.ts` - Next.js middleware for security and routing

## Features
- Conversational AI chat interface
- Multiple AI tool integrations
- Workshop/educational modules
- Admin dashboard
- Real-time capabilities
- Media handling (webcam, screen sharing)
- ROI calculator tools
- Meeting scheduling integration

## Development Notes
- The application uses advanced Next.js features including middleware
- Security headers are configured but modified for Replit environment
- Build process includes TypeScript strict mode and extensive linting
- Supports both development and production deployments