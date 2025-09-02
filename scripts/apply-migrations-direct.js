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

async function applyMigrationDirect(migrationFile) {
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
      const statement = statements[i] + ';'
      
      try {
        console.log(`  [${i + 1}/${statements.length}] Executing statement...`)
        
        // Execute the statement directly
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.log(`  ❌ Error: ${error.message}`)
          errorCount++
        } else {
          console.log(`  ✅ Success`)
          successCount++
        }
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`)
        errorCount++
      }
    }
    
    return { success: true, successCount, errorCount }
    
  } catch (error) {
    console.error(`❌ Failed to apply migration: ${error.message}`)
    return { success: false, error: error.message }
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
  const result1 = await applyMigrationDirect('supabase/migrations/20250105000000_add_vercel_pro_replacements.sql')
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Apply storage policies
  console.log('📋 Applying Storage Policies Migration...')
  const result2 = await applyMigrationDirect('scripts/setup-storage-policies.sql')
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  console.log('🎯 FINAL RESULTS:')
  if (result1.success) {
    console.log(`  ✅ Vercel Replacements: ${result1.successCount} success, ${result1.errorCount} errors`)
  } else {
    console.log(`  ❌ Vercel Replacements: ${result1.error}`)
  }
  
  if (result2.success) {
    console.log(`  ✅ Storage Policies: ${result2.successCount} success, ${result2.errorCount} errors`)
  } else {
    console.log(`  ❌ Storage Policies: ${result2.error}`)
  }
  
  if (result1.success && result2.success) {
    console.log('\n🎉 All migrations completed!')
    console.log('\n🧪 Run the test again:')
    console.log('   node scripts/test-cron-setup.js')
  }
}

main().catch(console.error)
