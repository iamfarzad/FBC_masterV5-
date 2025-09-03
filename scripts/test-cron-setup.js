#!/usr/bin/env node

/**
 * Test Script for Cron Jobs Setup
 * This script tests the cron jobs functionality with proper environment loading
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🧪 Testing Cron Jobs Setup')
console.log('==========================\n')

console.log('📋 Environment Variables:')
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ Missing required environment variables')
  console.error('   Please ensure .env.local contains:')
  console.error('   - SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

console.log('\n🔗 Testing Supabase connection...')

async function testConnection() {
  try {
    // Test basic connection by getting a simple query
    const { data, error } = await supabase
      .from('feature_flags')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation "feature_flags" does not exist')) {
        console.log('⚠️  Feature flags table not found - migration may not be applied yet')
        console.log('   This is expected if you haven\'t run the database migration')
        return false
      } else {
        throw error
      }
    }
    
    console.log('✅ Supabase connection successful')
    return true
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    return false
  }
}

async function testFeatureFlags() {
  try {
    console.log('\n🗄️ Testing Feature Flags System...')
    
    // Check if the table exists
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .limit(5)
    
    if (error) {
      if (error.message.includes('relation "feature_flags" does not exist')) {
        console.log('❌ Feature flags table not found')
        console.log('   Please run the database migration first:')
        console.log('   1. Go to Supabase Dashboard → SQL Editor')
        console.log('   2. Copy the migration file: supabase/migrations/20250105000000_add_vercel_pro_replacements.sql')
        console.log('   3. Paste and run in the SQL Editor')
        return false
      } else {
        throw error
      }
    }
    
    console.log(`✅ Feature flags table found with ${data.length} flags`)
    
    // Test the get_feature_flag function
    const { data: flagTest, error: flagError } = await supabase.rpc('get_feature_flag', {
      flag_key: 'ai_voice_enabled'
    })
    
    if (flagError) {
      console.log('⚠️  get_feature_flag function not found - migration may be incomplete')
      return false
    }
    
    console.log('✅ get_feature_flag function working')
    return true
    
  } catch (error) {
    console.error('❌ Feature flags test failed:', error.message)
    return false
  }
}

async function testCaching() {
  let cacheWorking = true

  try {
    console.log('\n💾 Testing Caching System...')

    // Test cache table
    const { data: cacheTable, error: cacheTableError } = await supabase
      .from('cache')
      .select('*')
      .limit(1)

    if (cacheTableError) {
      console.log('❌ Cache table error:', cacheTableError.message)
      cacheWorking = false
    } else {
      console.log('✅ Cache table found')

      // Test cache functions
      try {
        // Test update_cache function
        const { error: setError } = await supabase.rpc('update_cache', {
          p_cache_key: 'test:key',
          p_cache_value: { test: 'value', timestamp: new Date().toISOString() },
          p_ttl_seconds: 300
        })

        if (setError) {
          console.log('⚠️  update_cache function not found - migration may be incomplete')
          console.log('   Error details:', setError.message)
          cacheWorking = false
        } else {
          console.log('✅ update_cache function working')

          // Test get_cache function
          const { data: cacheValue, error: getError } = await supabase.rpc('get_cache', {
            p_cache_key: 'test:key'
          })

          if (getError) {
            console.log('⚠️  get_cache function not found - migration may be incomplete')
            console.log('   Error details:', getError.message)
            cacheWorking = false
          } else {
            console.log('✅ get_cache function working')
            console.log('📦 Retrieved cache value:', cacheValue)

            // Test clear_cache function
            const { data: deletedCount, error: clearError } = await supabase.rpc('clear_cache', {
              p_cache_key: 'test:key'
            })

            if (clearError) {
              console.log('⚠️  clear_cache function not found - migration may be incomplete')
              console.log('   Error details:', clearError.message)
              cacheWorking = false
            } else {
              console.log('✅ clear_cache function working')
              console.log('🗑️  Deleted cache entries:', deletedCount)
            }
          }
        }
      } catch (error) {
        console.log('❌ Cache function test failed:', error.message)
        cacheWorking = false
      }
    }
  } catch (error) {
    console.error('❌ Caching test failed:', error.message)
    cacheWorking = false
  }

  return cacheWorking
}

async function testCronJobs() {
  try {
    console.log('\n🔄 Testing Cron Jobs System...')
    
    // Check if the cron_job_logs table exists
    const { data, error } = await supabase
      .from('cron_job_logs')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation "cron_job_logs" does not exist')) {
        console.log('❌ Cron job logs table not found')
        return false
      } else {
        throw error
      }
    }
    
    console.log('✅ Cron job logs table found')
    
    // Test the log_cron_job_start function
    const { data: startTest, error: startError } = await supabase.rpc('log_cron_job_start', {
      job_name: 'test_job',
      job_type: 'github_action'
    })
    
    if (startError) {
      console.log('⚠️  log_cron_job_start function not found - migration may be incomplete')
      return false
    }
    
    console.log('✅ log_cron_job_start function working')
    
    // Test the log_cron_job_complete function
    const { data: completeTest, error: completeError } = await supabase.rpc('log_cron_job_complete', {
      job_id: startTest,
      status: 'completed',
      result_data: { test: true },
      error_message: null
    })
    
    if (completeError) {
      console.log('⚠️  log_cron_job_complete function not found')
      return false
    }
    
    console.log('✅ log_cron_job_complete function working')
    
    return true
    
  } catch (error) {
    console.error('❌ Cron jobs test failed:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🚀 Starting tests...\n')
    
    const connectionTest = await testConnection()
    if (!connectionTest) {
      console.log('\n❌ Connection test failed - cannot continue')
      process.exit(1)
    }
    
    const featureFlagsTest = await testFeatureFlags()
    const cachingTest = await testCaching()
    const cronJobsTest = await testCronJobs()
    
    console.log('\n📊 Test Results:')
    console.log('================')
    console.log(`🔗 Connection: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`🗄️ Feature Flags: ${featureFlagsTest ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`💾 Caching: ${cachingTest ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`🔄 Cron Jobs: ${cronJobsTest ? '✅ PASS' : '❌ FAIL'}`)
    
    const allTestsPassed = connectionTest && featureFlagsTest && cachingTest && cronJobsTest
    
    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! Your Vercel Pro replacements are working perfectly!')
      console.log('\n📚 Next steps:')
      console.log('1. Use the React hooks in your components: useFeatureFlag("flag_name")')
      console.log('2. Set up GitHub Actions for automated cron jobs')
      console.log('3. Start using caching for performance optimization')
      console.log('4. Upload files using the file storage system')
    } else {
      console.log('\n⚠️  Some tests failed. Please check the migration status.')
      console.log('\n🔧 To fix:')
      console.log('1. Apply the database migration in Supabase dashboard')
      console.log('2. Run this test again')
      console.log('3. Check the migration file: supabase/migrations/20250105000000_add_vercel_pro_replacements.sql')
    }
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message)
    process.exit(1)
  }
}

// Run the tests
main()
