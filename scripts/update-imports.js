#!/usr/bin/env node

/**
 * Script to update imports from lib/ to src/ structure
 * Usage: node scripts/update-imports.js
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Import mapping from old lib/ paths to new src/ paths
const IMPORT_MAPPINGS = {
  // Intelligence system
  '@/lib/intelligence/intent-detector': '@/src/core/intelligence',
  '@/lib/intelligence/role-detector': '@/src/core/intelligence', 
  '@/lib/intelligence/lead-research': '@/src/core/intelligence',
  '@/lib/intelligence/conversational-intelligence': '@/src/core/intelligence',
  
  // Services
  '@/lib/services/google-search-service': '@/src/services/search/google',
  '@/lib/services/gemini-service': '@/src/core/ai',
  '@/lib/email-service': '@/src/services/email/resend',
  
  // Auth & Validation
  '@/lib/auth': '@/src/core/auth',
  '@/lib/validation': '@/src/core/validation',
  
  // Types
  '@/types/intelligence': '@/src/core/types/intelligence',
  '@/types/chat': '@/src/core/types/chat',
  
  // Flags
  '@/lib/flags': '@/src/core/flags'
}

async function updateImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let updatedContent = content
    let hasChanges = false

    // Update each import mapping
    for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPINGS)) {
      const oldImportRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
      const newImport = `from '${newPath}'`
      
      if (oldImportRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(oldImportRegex, newImport)
        hasChanges = true
        // Log removed
      }
    }

    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      return true
    }
    
    return false
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message)
    return false
  }
}

async function main() {
  // Log removed

  // Find all TypeScript and TSX files
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'src/**', 'dist/**']
  })

  let totalFiles = 0
  let updatedFiles = 0

  for (const file of files) {
    totalFiles++
    // Log removed
    
    const wasUpdated = await updateImportsInFile(file)
    if (wasUpdated) {
      updatedFiles++
      // Log removed
    } else {
      // Log removed
    }
  }

  // Log removed
  // Log removed
  // Log removed
  // Log removed
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { updateImportsInFile, IMPORT_MAPPINGS }