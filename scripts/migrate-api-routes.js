#!/usr/bin/env node

/**
 * Script to migrate API routes to use src/ architecture
 * Usage: node scripts/migrate-api-routes.js
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Import mappings from lib/ to src/
const IMPORT_MAPPINGS = {
  // Core services
  '@/lib/supabase/server': '@/src/services/storage/supabase',
  '@/lib/supabase/client': '@/src/services/storage/supabase',
  '@/lib/services/google-search-service': '@/src/services/search/google',
  '@/lib/email-service': '@/src/services/email/resend',
  
  // Intelligence system
  '@/lib/intelligence/intent-detector': '@/src/core/intelligence',
  '@/lib/intelligence/lead-research': '@/src/core/intelligence',
  '@/lib/intelligence/conversational-intelligence': '@/src/core/intelligence',
  '@/lib/intelligence/role-detector': '@/src/core/intelligence',
  
  // Auth & Validation
  '@/lib/auth': '@/src/core/auth',
  '@/lib/validation': '@/src/core/validation',
  '@/lib/validation/admin': '@/src/core/validation',
  
  // Config & Utils
  '@/lib/config': '@/src/core/config',
  '@/lib/flags': '@/src/core/flags',
  '@/lib/utils': '@/src/core/utils',
  
  // Types
  '@/types/intelligence': '@/src/core/types/intelligence',
  '@/types/chat': '@/src/core/types/chat'
}

// Function mappings for renamed exports
const FUNCTION_MAPPINGS = {
  'getSupabase': 'getSupabaseStorage',
  'supabase': 'supabase', // Keep same
  'supabaseService': 'getSupabaseStorage().getServiceClient()',
  'detectIntent': 'detectIntent',
  'LeadResearchService': 'LeadResearchService',
  'ConversationalIntelligence': 'IntelligenceService'
}

async function migrateApiRoute(filePath) {
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

    // Update function calls if needed
    for (const [oldFunc, newFunc] of Object.entries(FUNCTION_MAPPINGS)) {
      if (oldFunc !== newFunc && updatedContent.includes(oldFunc)) {
        // Only replace function calls, not imports
        const funcCallRegex = new RegExp(`\\b${oldFunc}\\(`, 'g')
        if (funcCallRegex.test(updatedContent)) {
          updatedContent = updatedContent.replace(funcCallRegex, `${newFunc}(`)
          hasChanges = true
          // Log removed → ${newFunc}()`)
        }
      }
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

  // Find all API route files
  const apiFiles = await glob('app/api/**/*.ts', {
    ignore: ['**/*.backup', '**/*.test.ts']
  })

  let totalFiles = 0
  let migratedFiles = 0

  for (const file of apiFiles) {
    totalFiles++
    const wasMigrated = await migrateApiRoute(file)
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

module.exports = { migrateApiRoute, IMPORT_MAPPINGS }