-- 🔧 FINAL CACHE FUNCTIONS FIX - Drop Everything First
-- Run this in Supabase Dashboard → SQL Editor

/* --------------------------------------------------------------
   STEP 1: DROP ALL EXISTING CACHE FUNCTIONS (ALL VARIATIONS)
   -------------------------------------------------------------- */

-- Drop all variations of update_cache
DROP FUNCTION IF EXISTS public.update_cache(TEXT, JSONB, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_cache(TEXT, JSONB, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_cache(TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS update_cache(TEXT) CASCADE;

-- Drop all variations of get_cache
DROP FUNCTION IF EXISTS public.get_cache(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_cache(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_cache(TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_cache() CASCADE;

-- Drop all variations of set_cache
DROP FUNCTION IF EXISTS public.set_cache(TEXT, JSONB, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS set_cache(TEXT, JSONB, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS set_cache(TEXT, JSONB) CASCADE;

-- Drop all variations of clear_cache
DROP FUNCTION IF EXISTS public.clear_cache(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.clear_cache() CASCADE;
DROP FUNCTION IF EXISTS clear_cache(TEXT) CASCADE;
DROP FUNCTION IF EXISTS clear_cache() CASCADE;

-- Drop hashint8 helper
DROP FUNCTION IF EXISTS public.hashint8(TEXT) CASCADE;
DROP FUNCTION IF EXISTS hashint8(TEXT) CASCADE;

/* --------------------------------------------------------------
   STEP 2: RECREATE ALL FUNCTIONS WITH CORRECT DEFINITIONS
   -------------------------------------------------------------- */

-- hashint8 helper function
CREATE OR REPLACE FUNCTION public.hashint8(text)
RETURNS BIGINT AS $$
BEGIN
  RETURN ('x' || substr(md5($1), 1, 16))::bit(64)::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- update_cache function (returns VOID)
CREATE OR REPLACE FUNCTION public.update_cache(
  p_cache_key TEXT,
  p_cache_value JSONB,
  p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.cache (cache_key, cache_value, ttl_seconds, expires_at)
  VALUES (p_cache_key, p_cache_value, p_ttl_seconds, now() + (p_ttl_seconds || ' seconds')::interval)
  ON CONFLICT (cache_key)
  DO UPDATE SET
    cache_value = EXCLUDED.cache_value,
    ttl_seconds = EXCLUDED.ttl_seconds,
    created_at = now(),
    expires_at = now() + (EXCLUDED.ttl_seconds || ' seconds')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_cache function (returns JSONB)
CREATE OR REPLACE FUNCTION public.get_cache(p_cache_key TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Clean expired cache entries first
  DELETE FROM public.cache WHERE expires_at < now();

  -- Get cache value
  SELECT cache_value INTO result
  FROM public.cache
  WHERE cache_key = p_cache_key
    AND expires_at > now();

  RETURN COALESCE(result, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- set_cache function (returns VOID)
CREATE OR REPLACE FUNCTION public.set_cache(
  p_cache_key TEXT,
  p_cache_value JSONB,
  p_ttl_seconds INTEGER DEFAULT 3600
)
RETURNS VOID AS $$
BEGIN
  PERFORM public.update_cache(p_cache_key, p_cache_value, p_ttl_seconds);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- clear_cache function (returns INTEGER)
CREATE OR REPLACE FUNCTION public.clear_cache(p_cache_key TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF p_cache_key IS NULL THEN
    -- Clear all cache
    DELETE FROM public.cache;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  ELSE
    -- Clear specific cache key
    DELETE FROM public.cache WHERE cache_key = p_cache_key;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  END IF;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* --------------------------------------------------------------
   STEP 3: GRANT PERMISSIONS
   -------------------------------------------------------------- */

GRANT EXECUTE ON FUNCTION public.hashint8(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_cache(TEXT, JSONB, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_cache(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_cache(TEXT, JSONB, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clear_cache(TEXT) TO authenticated, service_role;

/* --------------------------------------------------------------
   STEP 4: TEST ALL FUNCTIONS
   -------------------------------------------------------------- */

-- Test hashint8
SELECT public.hashint8('test') as hash_test;

-- Test update_cache
SELECT public.update_cache('test_key', '{"test": "value"}'::jsonb, 60);

-- Test get_cache
SELECT public.get_cache('test_key') as cached_value;

-- Test set_cache
SELECT public.set_cache('another_key', '{"another": "test"}'::jsonb, 120);

-- Test clear_cache
SELECT public.clear_cache('test_key') as deleted_count;

-- Show all cache entries
SELECT cache_key, cache_value, ttl_seconds, expires_at
FROM public.cache
ORDER BY created_at DESC;
