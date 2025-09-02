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

async function fixSupabaseFunctions() {
  console.log('🔧 Fixing Supabase Functions')
  console.log('============================\n')
  
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
    
    // Drop existing functions first
    console.log('🗑️  Dropping existing functions...')
    const dropQueries = [
      'DROP FUNCTION IF EXISTS get_feature_flag(TEXT, UUID, TEXT)',
      'DROP FUNCTION IF EXISTS update_cache(TEXT, JSONB, INTEGER)',
      'DROP FUNCTION IF EXISTS get_cache(TEXT)',
      'DROP FUNCTION IF EXISTS clear_cache(TEXT)',
      'DROP FUNCTION IF EXISTS set_cache(TEXT, JSONB, INTEGER)'
    ]
    
    for (const query of dropQueries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        if (error) {
          console.log(`⚠️  Could not drop function (this is normal): ${error.message}`)
        }
      } catch (err) {
        console.log(`⚠️  Could not drop function (this is normal): ${err.message}`)
      }
    }
    
    // Create fixed functions
    console.log('\n🔧 Creating fixed functions...')
    
    // 1. Fix get_feature_flag function
    const getFeatureFlagSQL = `
      CREATE OR REPLACE FUNCTION get_feature_flag(
        p_flag_key TEXT,
        p_user_id UUID DEFAULT NULL,
        p_environment TEXT DEFAULT 'production'
      )
      RETURNS JSONB AS $$
      DECLARE
        flag_record RECORD;
        user_hash BIGINT;
        rollout_percentage INTEGER;
        is_enabled BOOLEAN;
      BEGIN
        -- Get the feature flag
        SELECT * INTO flag_record
        FROM feature_flags
        WHERE flag_key = p_flag_key
          AND environment = p_environment
          AND (expires_at IS NULL OR expires_at > NOW());
        
        IF NOT FOUND THEN
          RETURN '{"enabled": false, "reason": "flag_not_found"}'::JSONB;
        END IF;
        
        -- Check if flag is globally enabled/disabled
        IF NOT flag_record.is_enabled THEN
          RETURN '{"enabled": false, "reason": "globally_disabled"}'::JSONB;
        END IF;
        
        -- If no user_id, return global setting
        IF p_user_id IS NULL THEN
          RETURN '{"enabled": flag_record.is_enabled, "reason": "global_setting"}'::JSONB;
        END IF;
        
        -- Check user-specific override
        IF flag_record.user_overrides ? p_user_id::TEXT THEN
          RETURN '{"enabled": flag_record.user_overrides->>p_user_id::TEXT = "true", "reason": "user_override"}'::JSONB;
        END IF;
        
        -- Check percentage rollout
        IF flag_record.rollout_percentage > 0 THEN
          user_hash := hashint8(p_user_id::TEXT);
          rollout_percentage := ABS(user_hash % 100) + 1;
          
          IF rollout_percentage <= flag_record.rollout_percentage THEN
            RETURN '{"enabled": true, "reason": "rollout_percentage", "percentage": ' || rollout_percentage || '}'::JSONB;
          ELSE
            RETURN '{"enabled": false, "reason": "rollout_percentage", "percentage": ' || rollout_percentage || '}'::JSONB;
          END IF;
        END IF;
        
        -- Default to global setting
        RETURN '{"enabled": flag_record.is_enabled, "reason": "global_setting"}'::JSONB;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // 2. Fix update_cache function
    const updateCacheSQL = `
      CREATE OR REPLACE FUNCTION update_cache(
        p_cache_key TEXT,
        p_cache_value JSONB,
        p_ttl_seconds INTEGER DEFAULT 3600
      )
      RETURNS JSONB AS $$
      BEGIN
        INSERT INTO cache (cache_key, cache_value, ttl_seconds, expires_at)
        VALUES (p_cache_key, p_cache_value, p_ttl_seconds, NOW() + (p_ttl_seconds || ' seconds')::interval)
        ON CONFLICT (cache_key) 
        DO UPDATE SET 
          cache_value = EXCLUDED.cache_value,
          ttl_seconds = EXCLUDED.ttl_seconds,
          created_at = NOW(),
          expires_at = NOW() + (EXCLUDED.ttl_seconds || ' seconds')::interval;
        
        RETURN p_cache_value;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // 3. Fix get_cache function
    const getCacheSQL = `
      CREATE OR REPLACE FUNCTION get_cache(p_cache_key TEXT)
      RETURNS JSONB AS $$
      DECLARE
        cache_record RECORD;
      BEGIN
        SELECT * INTO cache_record
        FROM cache
        WHERE cache_key = p_cache_key
          AND (expires_at IS NULL OR expires_at > NOW());
        
        IF NOT FOUND THEN
          RETURN NULL;
        END IF;
        
        RETURN cache_record.cache_value;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // 4. Fix clear_cache function
    const clearCacheSQL = `
      CREATE OR REPLACE FUNCTION clear_cache(p_cache_key TEXT DEFAULT NULL)
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        IF p_cache_key IS NULL THEN
          DELETE FROM cache WHERE expires_at < NOW();
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
        ELSE
          DELETE FROM cache WHERE cache_key = p_cache_key;
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
        END IF;
        
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // 5. Create set_cache alias
    const setCacheSQL = `
      CREATE OR REPLACE FUNCTION set_cache(
        p_cache_key TEXT,
        p_cache_value JSONB,
        p_ttl_seconds INTEGER DEFAULT 3600
      )
      RETURNS JSONB AS $$
      BEGIN
        RETURN update_cache(p_cache_key, p_cache_value, p_ttl_seconds);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // Try to create functions using direct SQL execution
    console.log('📝 Attempting to create functions...')
    
    const functions = [
      { name: 'get_feature_flag', sql: getFeatureFlagSQL },
      { name: 'update_cache', sql: updateCacheSQL },
      { name: 'get_cache', sql: getCacheSQL },
      { name: 'clear_cache', sql: clearCacheSQL },
      { name: 'set_cache', sql: setCacheSQL }
    ]
    
    for (const func of functions) {
      try {
        console.log(`  🔧 Creating ${func.name}...`)
        
        // Try to execute the SQL directly
        const { error } = await supabase.rpc('exec_sql', { sql: func.sql })
        
        if (error) {
          console.log(`  ❌ ${func.name} failed: ${error.message}`)
        } else {
          console.log(`  ✅ ${func.name} created successfully`)
        }
      } catch (err) {
        console.log(`  ❌ ${func.name} exception: ${err.message}`)
      }
    }
    
    console.log('\n🎯 Function creation complete!')
    console.log('\n🧪 Test the functions:')
    console.log('   node scripts/test-cron-setup.js')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  }
}

fixSupabaseFunctions().catch(console.error)



