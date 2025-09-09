# 🚀 AI Lead Generation System - Setup Instructions

## Quick Setup (5 minutes)

### 1. Create Project Directory
```bash
mkdir ai-lead-generation-system
cd ai-lead-generation-system
```

### 2. Copy Your Files
Copy all your current files from Figma Make into this directory, maintaining the exact structure.

### 3. Install PNPM (if not already installed)
```bash
# Install pnpm globally
npm install -g pnpm

# Or using corepack (Node.js 16.10+)
corepack enable
corepack prepare pnpm@latest --activate
```

### 4. Install Dependencies
```bash
# Install all required packages with pnpm
pnpm install

# Force fresh install if needed
pnpm run fresh-install
```

### 5. Development Server
```bash
# Start development server
pnpm dev

# Or run with turbo for faster builds
pnpm dlx turbo dev
```

### 5. Open in Browser
Navigate to `http://localhost:3000` to see your application.

## 🛠️ IDE Setup

### VS Code (Recommended)
Install these extensions for optimal development:
```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Hero
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Prettier - Code formatter
- ESLint
```

### Settings (VS Code)
Add to your `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["clsx\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

## 📁 Project Structure (Already Configured)
```
ai-lead-generation-system/
├── app/                 # Next.js App Router
├── components/          # Your 90+ React components
├── hooks/              # Custom React hooks
├── constants/          # App constants
├── services/           # Business logic
├── styles/             # Global CSS & Tailwind
├── public/             # Static assets
└── package.json        # Dependencies
```

## 🎯 Key Features Working Out-of-Box
✅ Advanced holographic design system
✅ 7-stage AI conversation flow
✅ Voice, webcam, screen sharing interfaces
✅ Complete ShadCN UI library
✅ Lead scoring and analytics
✅ Mobile-responsive design
✅ Dark/light theme switching
✅ PDF generation and booking system

## 🔧 Development Commands
```bash
pnpm dev             # Development server
pnpm build           # Production build  
pnpm start           # Production server
pnpm lint            # ESLint check
pnpm type-check      # TypeScript check
pnpm clean           # Clean build artifacts
pnpm fresh-install   # Clean reinstall
```

## 📝 Environment Variables
Create `.env.local` for your API keys:
```env
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_key
```

Your application is now ready for professional development! 🎉