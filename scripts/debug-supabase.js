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

async function debugSupabase() {
  console.log('🔍 Debugging Supabase Database')
  console.log('================================\n')
  
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
    
    // Check what tables exist
    console.log('📋 Checking tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['feature_flags', 'cache', 'cron_job_logs', 'file_metadata'])
    
    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message)
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name))
    }
    
    // Check what functions exist
    console.log('\n🔧 Checking functions...')
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', ['get_feature_flag', 'update_cache', 'get_cache', 'clear_cache'])
    
    if (funcError) {
      console.log('❌ Error checking functions:', funcError.message)
    } else {
      console.log('✅ Functions found:', functions.map(f => f.routine_name))
    }
    
    // Try to call functions directly
    console.log('\n🧪 Testing function calls...')
    
    // Test get_feature_flag
    try {
      const { data: flagData, error: flagError } = await supabase.rpc('get_feature_flag', {
        flag_key: 'test',
        user_id: null,
        environment: 'production'
      })
      
      if (flagError) {
        console.log('❌ get_feature_flag error:', flagError.message)
      } else {
        console.log('✅ get_feature_flag working:', flagData)
      }
    } catch (err) {
      console.log('❌ get_feature_flag exception:', err.message)
    }
    
    // Test update_cache
    try {
      const { data: cacheData, error: cacheError } = await supabase.rpc('update_cache', {
        cache_key: 'test:debug',
        cache_value: { debug: true, timestamp: new Date().toISOString() },
        ttl_seconds: 60
      })
      
      if (cacheError) {
        console.log('❌ update_cache error:', cacheError.message)
      } else {
        console.log('✅ update_cache working:', cacheData)
      }
    } catch (err) {
      console.log('❌ update_cache exception:', err.message)
    }
    
    // Check if functions exist in pg_proc
    console.log('\n🔍 Checking pg_proc for functions...')
    const { data: pgFuncs, error: pgError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('pronamespace', 2200) // public schema
      .in('proname', ['get_feature_flag', 'update_cache', 'get_cache', 'clear_cache'])
    
    if (pgError) {
      console.log('❌ Error checking pg_proc:', pgError.message)
    } else {
      console.log('✅ Functions in pg_proc:', pgFuncs.map(f => f.proname))
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

debugSupabase().catch(console.error)



