#!/bin/bash

# AI Lead Generation System - Next.js Migration Script
# Run this script to automatically set up your Next.js project structure

echo "🚀 Creating Next.js AI Lead Generation Platform..."

# Create Next.js project
npx create-next-app@latest ai-lead-generation --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"

cd ai-lead-generation

echo "📁 Setting up project structure..."

# Create necessary directories
mkdir -p src/lib/{constants,config,services}
mkdir -p src/types
mkdir -p src/app/api/{ai,documents,leads,calendar}

echo "📦 Installing additional dependencies..."

# Install your specific dependencies
npm install react-dnd react-dnd-html5-backend motion lucide-react recharts sonner@2.0.3 react-hook-form@7.55.0

echo "⚙️ Creating configuration files..."

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig
EOF

# Create environment template
cat > .env.example << 'EOF'
# Production Environment Variables

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database
DATABASE_URL=your_database_connection_string
REDIS_URL=your_redis_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Third-party Integrations
CALENDLY_API_TOKEN=your_calendly_token
SENDGRID_API_KEY=your_sendgrid_key
STRIPE_SECRET_KEY=your_stripe_secret

# Analytics
ANALYTICS_ID=your_analytics_id
MIXPANEL_TOKEN=your_mixpanel_token

# Feature Flags
ENABLE_VOICE_CHAT=true
ENABLE_SCREEN_SHARE=true
ENABLE_PDF_GENERATION=true

# Development
NODE_ENV=production
EOF

# Create .env.local for development
cp .env.example .env.local

echo "✅ Next.js project structure created!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy your files to the new structure:"
echo "   - Copy /components/ → /src/components/"
echo "   - Copy /hooks/ → /src/hooks/"
echo "   - Copy /constants/ → /src/lib/constants/"
echo "   - Copy /config/ → /src/lib/config/"
echo "   - Copy /services/ → /src/lib/services/"
echo "   - Copy /styles/globals.css → /src/app/globals.css"
echo ""
echo "2. Update import paths to use @ aliases"
echo "3. Move your App.tsx logic to src/components/AILeadGenerationApp.tsx"
echo "4. Connect your backend APIs"
echo ""
echo "🚀 Run 'npm run dev' to start development server"