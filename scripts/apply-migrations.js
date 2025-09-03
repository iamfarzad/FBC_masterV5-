#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const { readFileSync } = require('fs')
const { join } = require('path')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration(migrationFile) {
  try {
    console.log(`📁 Reading migration: ${migrationFile}`)
    const migrationPath = join(__dirname, '..', migrationFile)
    const sql = readFileSync(migrationPath, 'utf8')
    
    console.log(`🚀 Applying migration: ${migrationFile}`)
    console.log(`📝 SQL length: ${sql.length} characters`)
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`🔧 Found ${statements.length} SQL statements`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim().length === 0) continue
      
      try {
        console.log(`  [${i + 1}/${statements.length}] Executing statement...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          console.log(`  ❌ Error: ${error.message}`)
          errorCount++
        } else {
          console.log(`  ✅ Success`)
          successCount++
        }
      } catch (err) {
        console.log(`  ❌ Exception: ${err.message}`)
        errorCount++
      }
    }
    
    console.log(`\n📊 Migration Results:`)
    console.log(`  ✅ Successful: ${successCount}`)
    console.log(`  ❌ Errors: ${errorCount}`)
    
    return { successCount, errorCount }
    
  } catch (error) {
    console.error(`❌ Failed to apply migration: ${error.message}`)
    return { successCount: 0, errorCount: 1 }
  }
}

async function main() {
  console.log('🚀 Supabase Migration Runner')
  console.log('============================\n')
  
  // Check connection
  console.log('🔗 Testing Supabase connection...')
  const { data, error } = await supabase.from('feature_flags').select('count').limit(1)
  
  if (error) {
    console.log('❌ Connection failed:', error.message)
    return
  }
  
  console.log('✅ Connected to Supabase\n')
  
  // Apply main migration
  console.log('📋 Applying Vercel Pro Replacements Migration...')
  const result1 = await applyMigration('supabase/migrations/20250105000000_add_vercel_pro_replacements.sql')
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Apply storage policies
  console.log('📋 Applying Storage Policies Migration...')
  const result2 = await applyMigration('scripts/setup-storage-policies.sql')
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Final summary
  const totalSuccess = result1.successCount + result2.successCount
  const totalErrors = result1.errorCount + result2.errorCount
  
  console.log('🎯 FINAL RESULTS:')
  console.log(`  ✅ Total Successful: ${totalSuccess}`)
  console.log(`  ❌ Total Errors: ${totalErrors}`)
  
  if (totalErrors === 0) {
    console.log('\n🎉 All migrations applied successfully!')
    console.log('🧪 Run: node scripts/test-cron-setup.js')
  } else {
    console.log('\n⚠️  Some migrations had errors. Check the output above.')
  }
}

main().catch(console.error)
