-- 🔧 SUPABASE OFFICIAL FIX for "function get_cache(unknown) is not unique"
-- Run this in Supabase Dashboard → SQL Editor

/* --------------------------------------------------------------
   1️⃣ Remove *all* get_cache overloads (any schema)
   -------------------------------------------------------------- */
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT n.nspname AS ns, p.oid
        FROM   pg_proc p
        JOIN   pg_namespace n ON n.oid = p.pronamespace
        WHERE  p.proname = 'get_cache'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                       r.ns,
                       'get_cache',
                       pg_catalog.pg_get_function_identity_arguments(r.oid));
    END LOOP;
END $$;

/* --------------------------------------------------------------
   2️⃣ Re‑create the single‑parameter version (public schema)
   -------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION public.get_cache(p_cache_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    DELETE FROM public.cache WHERE expires_at < now();

    SELECT cache_value INTO result
    FROM   public.cache
    WHERE  cache_key = p_cache_key
       AND expires_at > now();

    RETURN COALESCE(result, 'null'::jsonb);
END;
$$;

/* --------------------------------------------------------------
   3️⃣ Grant execute rights
   -------------------------------------------------------------- */
GRANT EXECUTE ON FUNCTION public.get_cache(TEXT) TO authenticated, service_role;

/* --------------------------------------------------------------
   4️⃣ (Optional) Re‑create the other cache helpers if you dropped them
   -------------------------------------------------------------- */
-- hashint8 helper (safe to keep if already present)
CREATE OR REPLACE FUNCTION public.hashint8(text)
RETURNS BIGINT AS $$
BEGIN
  RETURN ('x' || substr(md5($1), 1, 16))::bit(64)::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

/* update_cache function */
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

/* set_cache function */
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

/* clear_cache function */
CREATE OR REPLACE FUNCTION public.clear_cache(p_cache_key TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF p_cache_key IS NULL THEN
    DELETE FROM public.cache;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  ELSE
    DELETE FROM public.cache WHERE cache_key = p_cache_key;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  END IF;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Grant permissions for all cache functions */
GRANT EXECUTE ON FUNCTION public.update_cache(TEXT, JSONB, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_cache(TEXT, JSONB, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clear_cache(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.hashint8(TEXT) TO authenticated, service_role;

/* --------------------------------------------------------------
   5️⃣ Test
   -------------------------------------------------------------- */
SELECT public.update_cache('test_key', '{"test":"value"}'::jsonb, 60);
SELECT public.get_cache('test_key') AS cached_value;
SELECT public.clear_cache('test_key') AS deleted_count;
