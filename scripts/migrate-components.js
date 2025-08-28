#!/usr/bin/env node

/**
 * Script to migrate components to use new design system
 * Usage: node scripts/migrate-components.js
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Import mappings for components
const IMPORT_MAPPINGS = {
  // Design system
  '@/lib/utils': '@/src/core/utils',
  '@/lib/flags': '@/src/core/flags',
  '@/lib/config': '@/src/core/config',
  
  // Services
  '@/lib/supabase/client': '@/src/services/storage/supabase',
  '@/lib/services/google-search-service': '@/src/services/search/google',
  '@/lib/email-service': '@/src/services/email/resend',
  
  // Intelligence
  '@/lib/intelligence/intent-detector': '@/src/core/intelligence',
  '@/lib/intelligence/conversational-intelligence': '@/src/core/intelligence',
  
  // Types
  '@/types/intelligence': '@/src/core/types/intelligence',
  '@/types/chat': '@/src/core/types/chat',
  
  // Education
  '@/lib/education/modules': '@/src/core/education/modules'
}

// Component replacements
const COMPONENT_REPLACEMENTS = {
  // Old button imports to new
  "import { Button } from '@/components/ui/primitives/button'": "import { Button } from '@/components/ui/button'",
"import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/primitives/card'": "import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'",
  
  // Legacy button variants
  'from "@/components/ui/primitives/button"': 'from "@/components/ui/button"',
'from "@/components/ui/primitives/card"': 'from "@/components/ui/card"'
}

async function migrateComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let updatedContent = content
    let hasChanges = false

    // Log removed

    // Update import statements
    for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPINGS)) {
      const importRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
      
      if (importRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(importRegex, `from '${newPath}'`)
        hasChanges = true
        // Log removed
      }
    }

    // Update component imports
    for (const [oldImport, newImport] of Object.entries(COMPONENT_REPLACEMENTS)) {
      if (updatedContent.includes(oldImport)) {
        updatedContent = updatedContent.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport)
        hasChanges = true
        // Log removed
      }
    }

    // Update function calls
    if (updatedContent.includes('getSupabase(')) {
      updatedContent = updatedContent.replace(/getSupabase\(\)/g, 'getSupabaseStorage()')
      hasChanges = true
      // Log removed → getSupabaseStorage()`)
    }

    if (updatedContent.includes('supabaseService')) {
      updatedContent = updatedContent.replace(/supabaseService/g, 'getSupabaseStorage().getServiceClient()')
      hasChanges = true
      // Log removed.getServiceClient()`)
    }

    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      // Log removed
      return true
    } else {
      // Log removed
      return false
    }
    
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message)
    return false
  }
}

async function main() {
  // Log removed

  // Find all component files
  const componentFiles = await glob('components/**/*.{ts,tsx}', {
    ignore: [
      '**/ui/primitives/**', // Skip (deleted - now using standard Shadcn components)
      '**/ui/patterns/**',
      '**/ui/layouts/**',
      '**/*.test.ts',
      '**/*.test.tsx'
    ]
  })

  // Also migrate hooks
  const hookFiles = await glob('hooks/**/*.{ts,tsx}', {
    ignore: ['**/*.test.ts', '**/*.test.tsx']
  })

  const allFiles = [...componentFiles, ...hookFiles]
  let totalFiles = 0
  let migratedFiles = 0

  for (const file of allFiles) {
    totalFiles++
    const wasMigrated = await migrateComponent(file)
    if (wasMigrated) {
      migratedFiles++
    }
  }

  // Log removed
  // Log removed
  // Log removed
  // Log removed
  
  if (migratedFiles > 0) {
    // Log removed
    // Log removed
    // Log removed
    // Log removed
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { migrateComponent, IMPORT_MAPPINGS }