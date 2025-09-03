#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDatabaseState() {
  console.log('🔍 Checking Database State')
  console.log('==========================\n')
  
  try {
    // Test connection
    console.log('🔗 Testing connection...')
    const { data: testData, error: testError } = await supabase
      .from('feature_flags')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Connection failed:', testError.message)
      return
    }
    console.log('✅ Connected successfully\n')
    
    // Check feature flags table
    console.log('🗄️  Checking feature_flags table...')
    const { data: flags, error: flagsError } = await supabase
      .from('feature_flags')
      .select('*')
      .limit(3)
    
    if (flagsError) {
      console.log('❌ Feature flags error:', flagsError.message)
    } else {
      console.log(`✅ Feature flags table has ${flags.length} records`)
      if (flags.length > 0) {
        console.log('   Sample record:', JSON.stringify(flags[0], null, 2))
      }
    }
    
    // Check cache table
    console.log('\n💾 Checking cache table...')
    const { data: cache, error: cacheError } = await supabase
      .from('cache')
      .select('*')
      .limit(3)
    
    if (cacheError) {
      console.log('❌ Cache error:', cacheError.message)
    } else {
      console.log(`✅ Cache table has ${cache.length} records`)
      if (cache.length > 0) {
        console.log('   Sample record:', JSON.stringify(cache[0], null, 2))
      }
    }
    
    // Check cron jobs table
    console.log('\n🔄 Checking cron_job_logs table...')
    const { data: cron, error: cronError } = await supabase
      .from('cron_job_logs')
      .select('*')
      .limit(3)
    
    if (cronError) {
      console.log('❌ Cron jobs error:', cronError.message)
    } else {
      console.log(`✅ Cron jobs table has ${cron.length} records`)
      if (cron.length > 0) {
        console.log('   Sample record:', JSON.stringify(cron[0], null, 2))
      }
    }
    
    // Check file metadata table
    console.log('\n📁 Checking file_metadata table...')
    const { data: files, error: filesError } = await supabase
      .from('file_metadata')
      .select('*')
      .limit(3)
    
    if (filesError) {
      console.log('❌ File metadata error:', filesError.message)
    } else {
      console.log(`✅ File metadata table has ${files.length} records`)
      if (files.length > 0) {
        console.log('   Sample record:', JSON.stringify(files[0], null, 2))
      }
    }
    
    console.log('\n🎯 Database state check complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Run the migration SQL manually')
    console.log('3. Test with: node scripts/test-cron-setup.js')
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkDatabaseState().catch(console.error)



