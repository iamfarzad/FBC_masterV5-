-- 🔧 Fix Caching Functions - FINAL VERSION (No Function Overloads)
-- Run this in Supabase Dashboard → SQL Editor

-- 1. COMPLETELY DROP ALL EXISTING FUNCTIONS (no exceptions)
DO $$
BEGIN
    -- Drop all possible variations
    DROP FUNCTION IF EXISTS update_cache(TEXT, JSONB, INTEGER) CASCADE;
    DROP FUNCTION IF EXISTS update_cache(TEXT, JSONB) CASCADE;
    DROP FUNCTION IF EXISTS update_cache(TEXT) CASCADE;
    DROP FUNCTION IF EXISTS get_cache(TEXT) CASCADE;
    DROP FUNCTION IF EXISTS get_cache(TEXT, INTEGER) CASCADE;
    DROP FUNCTION IF EXISTS get_cache() CASCADE;
    DROP FUNCTION IF EXISTS clear_cache(TEXT) CASCADE;
    DROP FUNCTION IF EXISTS clear_cache() CASCADE;
    DROP FUNCTION IF EXISTS set_cache(TEXT, JSONB, INTEGER) CASCADE;
    DROP FUNCTION IF EXISTS set_cache(TEXT, JSONB) CASCADE;
    DROP FUNCTION IF EXISTS hashint8(TEXT) CASCADE;
EXCEPTION WHEN OTHERS THEN
    -- Continue even if some functions don't exist
    NULL;
END $$;

-- 2. Create hashint8 helper function
CREATE OR REPLACE FUNCTION hashint8(text)
RETURNS bigint AS $$
BEGIN
  RETURN ('x' || substr(md5($1), 1, 16))::bit(64)::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- 3. Create UNIQUE caching functions (no overloads)

-- Main cache update function
CREATE OR REPLACE FUNCTION update_cache(
  p_cache_key TEXT,
  p_cache_value JSONB,
  p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO cache (cache_key, cache_value, ttl_seconds, expires_at)
  VALUES (p_cache_key, p_cache_value, p_ttl_seconds, now() + (p_ttl_seconds || ' seconds')::interval)
  ON CONFLICT (cache_key)
  DO UPDATE SET
    cache_value = EXCLUDED.cache_value,
    ttl_seconds = EXCLUDED.ttl_seconds,
    created_at = now(),
    expires_at = now() + (EXCLUDED.ttl_seconds || ' seconds')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Main cache get function
CREATE OR REPLACE FUNCTION get_cache(p_cache_key TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Clean expired cache entries first
  DELETE FROM cache WHERE expires_at < now();

  -- Get cache value
  SELECT cache_value INTO result
  FROM cache
  WHERE cache.cache_key = p_cache_key
    AND expires_at > now();

  RETURN COALESCE(result, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cache set function (alias for update_cache)
CREATE OR REPLACE FUNCTION set_cache(
  p_cache_key TEXT,
  p_cache_value JSONB,
  p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS VOID AS $$
BEGIN
  PERFORM update_cache(p_cache_key, p_cache_value, p_ttl_seconds);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cache clear function
CREATE OR REPLACE FUNCTION clear_cache(p_cache_key TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF p_cache_key IS NULL THEN
    -- Clear all cache
    DELETE FROM cache;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  ELSE
    -- Clear specific cache key
    DELETE FROM cache WHERE cache.cache_key = p_cache_key;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  END IF;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions (single function, no overloads)
GRANT EXECUTE ON FUNCTION update_cache(TEXT, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_cache(TEXT, JSONB, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_cache(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION set_cache(TEXT, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION set_cache(TEXT, JSONB, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION clear_cache(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_cache(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION hashint8(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION hashint8(TEXT) TO service_role;

-- 5. Test the functions (no ambiguous calls)
SELECT update_cache('test_key', '{"test": "value"}'::jsonb, 60) as update_result;
SELECT get_cache('test_key') as cached_value;
SELECT clear_cache('test_key') as deleted_count;

-- ✅ Caching functions fixed successfully! No function overloads!
-- Now run: node scripts/test-cron-setup.js
