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

async function checkAndFixFunctions() {
  console.log('🔍 Checking and Fixing Functions')
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
    
    // Test each function individually to see the exact error
    console.log('🧪 Testing functions individually...\n')
    
    // Test get_feature_flag with different parameter orders
    console.log('🔧 Testing get_feature_flag...')
    
    // Try different parameter orders
    const testCases = [
      {
        name: 'get_feature_flag (correct order)',
        params: { p_flag_key: 'ai_voice_enabled', p_user_id: null, p_environment: 'production' }
      },
      {
        name: 'get_feature_flag (swapped order)',
        params: { p_environment: 'production', p_flag_key: 'ai_voice_enabled', p_user_id: null }
      },
      {
        name: 'get_feature_flag (minimal)',
        params: { p_flag_key: 'ai_voice_enabled' }
      }
    ]
    
    for (const testCase of testCases) {
      try {
        console.log(`  Testing: ${testCase.name}`)
        const { data, error } = await supabase.rpc('get_feature_flag', testCase.params)
        
        if (error) {
          console.log(`    ❌ Error: ${error.message}`)
        } else {
          console.log(`    ✅ Success: ${JSON.stringify(data)}`)
          break // Found working version
        }
      } catch (err) {
        console.log(`    ❌ Exception: ${err.message}`)
      }
    }
    
    // Test update_cache
    console.log('\n🔧 Testing update_cache...')
    try {
      const { data, error } = await supabase.rpc('update_cache', {
        p_cache_key: 'test:debug',
        p_cache_value: { debug: true, timestamp: new Date().toISOString() },
        p_ttl_seconds: 60
      })
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Success: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }
    
    // Test get_cache
    console.log('\n🔧 Testing get_cache...')
    try {
      const { data, error } = await supabase.rpc('get_cache', {
        p_cache_key: 'test:debug'
      })
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Success: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }
    
    // Test clear_cache
    console.log('\n🔧 Testing clear_cache...')
    try {
      const { data, error } = await supabase.rpc('clear_cache', {
        p_cache_key: 'test:debug'
      })
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Success: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }
    
    // Test set_cache
    console.log('\n🔧 Testing set_cache...')
    try {
      const { data, error } = await supabase.rpc('set_cache', {
        p_cache_key: 'test:debug2',
        p_cache_value: { debug: true, timestamp: new Date().toISOString() },
        p_ttl_seconds: 60
      })
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Success: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }
    
    // Test hashint8
    console.log('\n🔧 Testing hashint8...')
    try {
      const { data, error } = await supabase.rpc('hashint8', {
        text: 'test'
      })
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Success: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }
    
    console.log('\n🎯 Function testing complete!')
    console.log('\n📋 If functions are still not working:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Run this query to see what functions exist:')
    console.log(`
      SELECT 
        proname as function_name,
        pg_get_function_arguments(oid) as arguments,
        pg_get_function_result(oid) as return_type
      FROM pg_proc 
      WHERE proname IN ('get_feature_flag', 'update_cache', 'get_cache', 'clear_cache', 'set_cache', 'hashint8')
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `)
    console.log('3. Then run the fix script again: scripts/fix-functions-with-drop.sql')
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkAndFixFunctions().catch(console.error)



