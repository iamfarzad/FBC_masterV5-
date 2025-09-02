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

async function checkFunctionSignatures() {
  console.log('🔍 Checking Function Signatures in Database')
  console.log('==========================================\n')
  
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
    
    // Check function signatures using the query you provided
    console.log('📋 Checking function signatures...')
    
    const query = `
      SELECT
        n.nspname            AS schema_name,
        p.proname            AS function_name,
        pg_get_function_arguments(p.oid) AS arguments,
        pg_get_function_result(p.oid)    AS return_type
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('pg_catalog','information_schema')
        AND p.proname IN (
          'get_feature_flag',
          'update_cache',
          'get_cache',
          'clear_cache',
          'set_cache',
          'hashint8'
        )
      ORDER BY p.proname;
    `
    
    // Try to execute the query directly
    try {
      const { data: functions, error: funcError } = await supabase.rpc('exec_sql', { sql: query })
      
      if (funcError) {
        console.log('❌ Could not execute query via exec_sql:', funcError.message)
        console.log('\n🔧 Trying alternative approach...')
        
        // Alternative: Check each function individually
        await checkFunctionsIndividually()
      } else {
        console.log('✅ Function signatures found:')
        console.table(functions)
      }
    } catch (err) {
      console.log('❌ exec_sql not available:', err.message)
      console.log('\n🔧 Trying alternative approach...')
      
      // Alternative: Check each function individually
      await checkFunctionsIndividually()
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

async function checkFunctionsIndividually() {
  console.log('\n🔍 Checking functions individually...')
  
  const functionNames = [
    'get_feature_flag',
    'update_cache', 
    'get_cache',
    'clear_cache',
    'set_cache',
    'hashint8'
  ]
  
  for (const funcName of functionNames) {
    try {
      console.log(`\n🔧 Testing ${funcName}...`)
      
      // Try to call the function with different parameter combinations
      if (funcName === 'get_feature_flag') {
        try {
          const { data, error } = await supabase.rpc(funcName, {
            p_flag_key: 'test',
            p_user_id: null,
            p_environment: 'production'
          })
          
          if (error) {
            console.log(`  ❌ ${funcName} error: ${error.message}`)
          } else {
            console.log(`  ✅ ${funcName} working, returned: ${JSON.stringify(data)}`)
          }
        } catch (err) {
          console.log(`  ❌ ${funcName} exception: ${err.message}`)
        }
      }
      
      else if (funcName === 'update_cache') {
        try {
          const { data, error } = await supabase.rpc(funcName, {
            p_cache_key: 'test:debug',
            p_cache_value: { debug: true, timestamp: new Date().toISOString() },
            p_ttl_seconds: 60
          })
          
          if (error) {
            console.log(`  ❌ ${funcName} error: ${error.message}`)
          } else {
            console.log(`  ✅ ${funcName} working, returned: ${JSON.stringify(data)}`)
          }
        } catch (err) {
          console.log(`  ❌ ${funcName} exception: ${err.message}`)
        }
      }
      
      else if (funcName === 'get_cache') {
        try {
          const { data, error } = await supabase.rpc(funcName, {
            p_cache_key: 'test:debug'
          })
          
          if (error) {
            console.log(`  ❌ ${funcName} error: ${error.message}`)
          } else {
            console.log(`  ✅ ${funcName} working, returned: ${JSON.stringify(data)}`)
          }
        } catch (err) {
          console.log(`  ❌ ${funcName} exception: ${err.message}`)
        }
      }
      
      else if (funcName === 'clear_cache') {
        try {
          const { data, error } = await supabase.rpc(funcName, {
            p_cache_key: 'test:debug'
          })
          
          if (error) {
            console.log(`  ❌ ${funcName} error: ${error.message}`)
          } else {
            console.log(`  ✅ ${funcName} working, returned: ${JSON.stringify(data)}`)
          }
        } catch (err) {
          console.log(`  ❌ ${funcName} exception: ${err.message}`)
        }
      }
      
      else if (funcName === 'set_cache') {
        try {
          const { data, error } = await supabase.rpc(funcName, {
            p_cache_key: 'test:debug2',
            p_cache_value: { debug: true, timestamp: new Date().toISOString() },
            p_ttl_seconds: 60
          })
          
          if (error) {
            console.log(`  ❌ ${funcName} error: ${error.message}`)
          } else {
            console.log(`  ✅ ${funcName} working, returned: ${JSON.stringify(data)}`)
          }
        } catch (err) {
          console.log(`  ❌ ${funcName} exception: ${err.message}`)
        }
      }
      
      else if (funcName === 'hashint8') {
        try {
          const { data, error } = await supabase.rpc(funcName, {
            text: 'test'
          })
          
          if (error) {
            console.log(`  ❌ ${funcName} error: ${error.message}`)
          } else {
            console.log(`  ✅ ${funcName} working, returned: ${JSON.stringify(data)}`)
          }
        } catch (err) {
          console.log(`  ❌ ${funcName} exception: ${err.message}`)
        }
      }
      
    } catch (err) {
      console.log(`  ❌ ${funcName} test failed: ${err.message}`)
    }
  }
  
  console.log('\n🎯 Individual function check complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Go to Supabase Dashboard → SQL Editor')
  console.log('2. Run the SQL from scripts/create-missing-functions.sql')
  console.log('3. Test again with: node scripts/test-cron-setup.js')
}

checkFunctionSignatures().catch(console.error)



