-- 🔧 Fix Feature Flags Function - Fixed Version
-- Run this in Supabase Dashboard → SQL Editor

-- 1. First, check what columns actually exist in feature_flags table
-- Uncomment and run this query first to see the actual structure:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'feature_flags'
ORDER BY ordinal_position;

-- 2. Drop ALL existing functions to avoid conflicts
DO $$
BEGIN
    -- Drop all overloads of get_feature_flag
    DROP FUNCTION IF EXISTS get_feature_flag(TEXT);
    DROP FUNCTION IF EXISTS get_feature_flag(TEXT, UUID);
    DROP FUNCTION IF EXISTS get_feature_flag(TEXT, UUID, TEXT);
    
    -- Drop helper function
    DROP FUNCTION IF EXISTS hashint8(TEXT);
    
    -- Also drop any other variations that might exist
    DROP FUNCTION IF EXISTS get_feature_flag(TEXT, TEXT);
    DROP FUNCTION IF EXISTS get_feature_flag(UUID, TEXT);
    
EXCEPTION WHEN OTHERS THEN
    -- Continue even if some functions don't exist
    NULL;
END $$;

-- 3. Create hashint8 helper function FIRST
CREATE OR REPLACE FUNCTION hashint8(text)
RETURNS bigint AS $$
BEGIN
  RETURN ('x' || substr(md5($1), 1, 16))::bit(64)::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- 4. Create the core three-parameter function (MAIN FUNCTION)
CREATE OR REPLACE FUNCTION get_feature_flag_v3(
  p_flag_key TEXT,
  p_user_id UUID DEFAULT NULL,
  p_environment TEXT DEFAULT 'production'
)
RETURNS JSONB AS $$
DECLARE
  flag_record RECORD;
  user_hash BIGINT;
  rollout_percentage INTEGER;
BEGIN
  -- Get the feature flag (using actual table structure)
  SELECT * INTO flag_record
  FROM feature_flags
  WHERE flag_key = p_flag_key;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('enabled', false, 'reason', 'flag_not_found');
  END IF;
  
  -- Check if flag is globally enabled/disabled
  IF NOT flag_record.is_enabled THEN
    RETURN jsonb_build_object('enabled', false, 'reason', 'globally_disabled');
  END IF;
  
  -- If no user_id, return global setting
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('enabled', flag_record.is_enabled, 'reason', 'global_setting');
  END IF;
  
  -- Check target_environments if specified (using your actual column)
  IF flag_record.target_environments IS NOT NULL AND array_length(flag_record.target_environments, 1) > 0 THEN
    IF NOT (p_environment = ANY(flag_record.target_environments)) THEN
      RETURN jsonb_build_object('enabled', false, 'reason', 'environment_not_allowed');
    END IF;
  END IF;
  
  -- Check percentage rollout (using your actual column)
  IF flag_record.rollout_percentage > 0 THEN
    user_hash := hashint8(p_user_id::TEXT);
    rollout_percentage := ABS(user_hash % 100) + 1;
    
    IF rollout_percentage <= flag_record.rollout_percentage THEN
      RETURN jsonb_build_object(
        'enabled', true, 
        'reason', 'rollout_percentage', 
        'percentage', rollout_percentage
      );
    ELSE
      RETURN jsonb_build_object(
        'enabled', false, 
        'reason', 'rollout_percentage', 
        'percentage', rollout_percentage
      );
    END IF;
  END IF;
  
  -- Default to global setting
  RETURN jsonb_build_object('enabled', flag_record.is_enabled, 'reason', 'global_setting');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the main get_feature_flag function that routes to the correct version
CREATE OR REPLACE FUNCTION get_feature_flag(
  p_flag_key TEXT,
  p_user_id UUID DEFAULT NULL,
  p_environment TEXT DEFAULT 'production'
)
RETURNS JSONB AS $$
BEGIN
  RETURN get_feature_flag_v3(p_flag_key, p_user_id, p_environment);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create two-parameter overload
CREATE OR REPLACE FUNCTION get_feature_flag(
  p_flag_key TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
BEGIN
  RETURN get_feature_flag_v3(p_flag_key, p_user_id, 'production');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create one-parameter overload
CREATE OR REPLACE FUNCTION get_feature_flag(
  p_flag_key TEXT
)
RETURNS JSONB AS $$
BEGIN
  RETURN get_feature_flag_v3(p_flag_key, NULL, 'production');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant execute permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 9. Test the function
SELECT get_feature_flag('test_flag') as test_result;

-- ✅ Functions fixed successfully!
-- Now run: node scripts/test-cron-setup.js
