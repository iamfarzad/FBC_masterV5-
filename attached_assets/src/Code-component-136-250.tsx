#!/bin/bash

# 🚀 AI Lead Generation System - IDE Setup Script
echo "🧹 Cleaning up unused files..."

# Remove unused app versions
rm -f BookingTest.tsx BookingTestApp.tsx CleanWorkingApp.tsx DesignTest.tsx
rm -f PerfectLayoutApp.tsx TrueCompletePerfectApp.tsx UltimateComponentShowcase.tsx WorkingPerfectApp.tsx

# Remove duplicate/test files  
rm -f src-app-*.tsx migrate-to-nextjs.sh migration-guide.md

# Remove guidelines folder (moved to root)
rm -rf guidelines/

echo "✅ Cleanup complete!"

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Setting up development environment..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local - please add your API keys"
fi

# Create VS Code workspace settings
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["clsx\\(([^)]*)\\)", "'([^']*)'"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "css.validate": false,
  "scss.validate": false,
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
EOF

# Create launch configuration for debugging
cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
EOF

# Create recommended extensions
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss"
  ]
}
EOF

echo "🎯 IDE setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open this folder in VS Code"
echo "2. Install recommended extensions"
echo "3. Add your API keys to .env.local"
echo "4. Run: pnpm dev"
echo "5. Open: http://localhost:3000"
echo ""
echo "🌟 Your AI Lead Generation System is ready for development!"