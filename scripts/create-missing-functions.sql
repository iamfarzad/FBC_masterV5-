-- 🔧 Create Missing Functions for Vercel Pro Replacements
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create get_feature_flag function
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

-- 2. Create update_cache function
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

-- 3. Create get_cache function
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

-- 4. Create clear_cache function
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

-- 5. Create set_cache alias for backward compatibility
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

-- 6. Create hashint8 function if it doesn't exist
CREATE OR REPLACE FUNCTION hashint8(text)
RETURNS bigint AS $$
BEGIN
  RETURN ('x' || substr(md5($1), 1, 16))::bit(64)::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_feature_flag(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_cache(TEXT, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_cache(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_cache(TEXT, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION hashint8(TEXT) TO authenticated;

-- 8. Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION get_feature_flag(TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION update_cache(TEXT, JSONB, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_cache(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION clear_cache(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION set_cache(TEXT, JSONB, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION hashint8(TEXT) TO service_role;

-- ✅ Functions created successfully!
-- Now run: node scripts/test-cron-setup.js
