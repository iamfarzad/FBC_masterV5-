-- 🔧 Fix Feature Flags Function - FINAL CLEAN VERSION
-- Run this in Supabase Dashboard → SQL Editor

-- 1. COMPLETELY DROP ALL EXISTING FUNCTIONS (no exceptions)
DROP FUNCTION IF EXISTS get_feature_flag(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag(TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag_v3(TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag_simple(TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag_global(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag_user(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_feature_flag_full(TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS hashint8(TEXT) CASCADE;

-- 2. Create hashint8 helper function
CREATE OR REPLACE FUNCTION hashint8(text)
RETURNS bigint AS $$
BEGIN
  RETURN ('x' || substr(md5($1), 1, 16))::bit(64)::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- 3. Create ONE SINGLE function with a completely unique name
CREATE OR REPLACE FUNCTION check_feature_flag(
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
  -- Get the feature flag
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

  -- Check target_environments if specified
  IF flag_record.target_environments IS NOT NULL AND array_length(flag_record.target_environments, 1) > 0 THEN
    IF NOT (p_environment = ANY(flag_record.target_environments)) THEN
      RETURN jsonb_build_object('enabled', false, 'reason', 'environment_not_allowed');
    END IF;
  END IF;

  -- Check percentage rollout
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

-- 4. Create the main get_feature_flag function that calls the unique function
CREATE OR REPLACE FUNCTION get_feature_flag(flag_key TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN check_feature_flag(flag_key, NULL, 'production');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION check_feature_flag(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_feature_flag(TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_feature_flag(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_flag(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION hashint8(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION hashint8(TEXT) TO service_role;

-- 6. Test the function
SELECT check_feature_flag('test_flag') as test_result;

-- ✅ Functions fixed successfully!
-- Now run: node scripts/test-cron-setup.js

-- Available functions:
-- check_feature_flag(flag_key, user_id, environment) - Main function with all parameters
-- get_feature_flag(flag_key) - Simple global flag check (no overloads)
-- hashint8(text) - Helper function for percentage calculations
