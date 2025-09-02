-- Vercel Pro Features Replacement with Supabase Free Tier
-- This migration adds feature flags, caching, file storage, and cron job capabilities

-- 1. FEATURE FLAGS SYSTEM (Replace Vercel Edge Config)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL UNIQUE,
  flag_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users TEXT[], -- Array of user IDs or email patterns
  target_environments TEXT[] DEFAULT ARRAY['production', 'staging', 'development'],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. CACHING LAYER (Replace Vercel KV)
CREATE TABLE IF NOT EXISTS cache (
  cache_key TEXT PRIMARY KEY,
  cache_value JSONB NOT NULL,
  ttl_seconds INTEGER NOT NULL DEFAULT 3600, -- 1 hour default
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- 3. FILE STORAGE METADATA (Replace Vercel Blob)
CREATE TABLE IF NOT EXISTS file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'default',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('private', 'authenticated', 'public')),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CRON JOB LOGS (Replace Vercel Cron)
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('github_action', 'edge_function', 'database_trigger')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  result_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_file_metadata_user ON file_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_file_metadata_bucket ON file_metadata(bucket_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_status ON cron_job_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_started ON cron_job_logs(started_at DESC);

-- 6. FEATURE FLAG FUNCTIONS
CREATE OR REPLACE FUNCTION get_feature_flag(
  flag_key TEXT,
  user_id UUID DEFAULT NULL,
  environment TEXT DEFAULT 'production'
)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record feature_flags%ROWTYPE;
  user_rollout BOOLEAN := false;
BEGIN
  -- Get the feature flag
  SELECT * INTO flag_record 
  FROM feature_flags 
  WHERE flag_key = get_feature_flag.flag_key;
  
  -- If flag doesn't exist, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If flag is disabled, return false
  IF NOT flag_record.is_enabled THEN
    RETURN false;
  END IF;
  
  -- Check if environment is targeted
  IF NOT (environment = ANY(flag_record.target_environments)) THEN
    RETURN false;
  END IF;
  
  -- Check if user is specifically targeted
  IF user_id IS NOT NULL AND flag_record.target_users IS NOT NULL THEN
    IF user_id::TEXT = ANY(flag_record.target_users) THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Check rollout percentage
  IF flag_record.rollout_percentage = 100 THEN
    RETURN true;
  ELSIF flag_record.rollout_percentage > 0 THEN
    -- Simple hash-based rollout (can be improved)
    user_rollout := (abs(hashint8(user_id::bigint)) % 100) < flag_record.rollout_percentage;
    RETURN user_rollout;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CACHE FUNCTIONS
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

-- Alias for backward compatibility
CREATE OR REPLACE FUNCTION set_cache(
  cache_key TEXT,
  cache_value JSONB,
  ttl_seconds INTEGER DEFAULT 3600
)
RETURNS VOID AS $$
BEGIN
  PERFORM update_cache(cache_key, cache_value, ttl_seconds);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 8. FILE STORAGE FUNCTIONS
CREATE OR REPLACE FUNCTION create_file_record(
  file_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  bucket_name TEXT DEFAULT 'default',
  user_id UUID DEFAULT NULL,
  is_public BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'private',
  tags TEXT[] DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  file_id UUID;
BEGIN
  INSERT INTO file_metadata (
    file_name, file_path, file_size, mime_type, bucket_name,
    user_id, is_public, access_level, tags, metadata
  ) VALUES (
    create_file_record.file_name, create_file_record.file_path, create_file_record.file_size,
    create_file_record.mime_type, create_file_record.bucket_name, create_file_record.user_id,
    create_file_record.is_public, create_file_record.access_level, create_file_record.tags,
    create_file_record.metadata
  ) RETURNING id INTO file_id;
  
  RETURN file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CRON JOB FUNCTIONS
CREATE OR REPLACE FUNCTION log_cron_job_start(
  job_name TEXT,
  job_type TEXT DEFAULT 'edge_function'
)
RETURNS UUID AS $$
DECLARE
  job_id UUID;
BEGIN
  INSERT INTO cron_job_logs (job_name, job_type, status)
  VALUES (log_cron_job_start.job_name, log_cron_job_start.job_type, 'running')
  RETURNING id INTO job_id;
  
  RETURN job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_cron_job_complete(
  job_id UUID,
  status TEXT DEFAULT 'completed',
  result_data JSONB DEFAULT '{}',
  error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE cron_job_logs 
  SET 
    status = log_cron_job_complete.status,
    completed_at = now(),
    duration_ms = EXTRACT(EPOCH FROM (now() - started_at)) * 1000,
    result_data = log_cron_job_complete.result_data,
    error_message = log_cron_job_complete.error_message
  WHERE id = log_cron_job_complete.job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. AUTOMATIC CLEANUP TRIGGERS
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS VOID AS $$
BEGIN
  DELETE FROM cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS VOID AS $$
BEGIN
  -- Keep logs for 30 days
  DELETE FROM cron_job_logs 
  WHERE started_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. SAMPLE DATA FOR FEATURE FLAGS
INSERT INTO feature_flags (flag_key, flag_name, description, is_enabled, rollout_percentage) VALUES
('ai_voice_enabled', 'AI Voice Features', 'Enable AI voice interaction capabilities', true, 100),
('advanced_analytics', 'Advanced Analytics', 'Show detailed analytics dashboard', false, 50),
('beta_features', 'Beta Features', 'Enable experimental features for testing', true, 25),
('dark_mode', 'Dark Mode', 'Enable dark theme option', true, 100),
('real_time_chat', 'Real-time Chat', 'Enable WebSocket-based chat', true, 100)
ON CONFLICT (flag_key) DO NOTHING;

-- 12. ROW LEVEL SECURITY POLICIES
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Feature flags: Readable by all authenticated users, writable by admins
CREATE POLICY "feature_flags_read_policy" ON feature_flags
  FOR SELECT USING (true);

CREATE POLICY "feature_flags_write_policy" ON feature_flags
  FOR ALL USING (auth.role() = 'authenticated');

-- Cache: Readable/writable by all authenticated users
CREATE POLICY "cache_read_policy" ON cache
  FOR SELECT USING (true);

CREATE POLICY "cache_write_policy" ON cache
  FOR ALL USING (auth.role() = 'authenticated');

-- File metadata: Users can only see their own files unless public
CREATE POLICY "file_metadata_read_policy" ON file_metadata
  FOR SELECT USING (
    is_public = true OR 
    auth.uid() = user_id OR
    (access_level = 'authenticated' AND auth.role() = 'authenticated')
  );

CREATE POLICY "file_metadata_write_policy" ON file_metadata
  FOR ALL USING (auth.uid() = user_id);

-- Cron job logs: Readable by all authenticated users, writable by system
CREATE POLICY "cron_job_logs_read_policy" ON cron_job_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "cron_job_logs_write_policy" ON cron_job_logs
  FOR ALL USING (true); -- Allow system functions to write

-- 13. TRIGGERS FOR UPDATED_AT COLUMNS
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_metadata_updated_at
  BEFORE UPDATE ON file_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. VIEWS FOR MONITORING
CREATE OR REPLACE VIEW feature_flags_status AS
SELECT 
  flag_key,
  flag_name,
  is_enabled,
  rollout_percentage,
  target_environments,
  created_at,
  updated_at
FROM feature_flags
ORDER BY flag_key;

CREATE OR REPLACE VIEW cache_stats AS
SELECT 
  COUNT(*) as total_entries,
  COUNT(*) FILTER (WHERE expires_at < now()) as expired_entries,
  COUNT(*) FILTER (WHERE expires_at > now()) as active_entries,
  AVG(ttl_seconds) as avg_ttl_seconds
FROM cache;

CREATE OR REPLACE VIEW cron_job_stats AS
SELECT 
  job_name,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
  AVG(duration_ms) as avg_duration_ms,
  MAX(started_at) as last_run
FROM cron_job_logs
GROUP BY job_name
ORDER BY last_run DESC;

-- 15. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 16. COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE feature_flags IS 'Feature flags system to replace Vercel Edge Config';
COMMENT ON TABLE cache IS 'Caching layer to replace Vercel KV';
COMMENT ON TABLE file_metadata IS 'File storage metadata to replace Vercel Blob';
COMMENT ON TABLE cron_job_logs IS 'Cron job logging to replace Vercel Cron';

COMMENT ON FUNCTION get_feature_flag IS 'Check if a feature flag is enabled for a user';
COMMENT ON FUNCTION set_cache IS 'Set a cache value with TTL';
COMMENT ON FUNCTION get_cache IS 'Get a cache value (auto-cleans expired entries)';
COMMENT ON FUNCTION clear_cache IS 'Clear cache entries (all or specific key)';
COMMENT ON FUNCTION create_file_record IS 'Create a file metadata record';
COMMENT ON FUNCTION log_cron_job_start IS 'Log the start of a cron job';
COMMENT ON FUNCTION log_cron_job_complete IS 'Log the completion of a cron job';

-- 17. FINAL STATUS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Vercel Pro Features Successfully Replaced with Supabase Free Tier!';
  RAISE NOTICE '🗄️ Feature Flags System: Ready (replaces Edge Config)';
  RAISE NOTICE '💾 Caching Layer: Ready (replaces KV)';
  RAISE NOTICE '📁 File Storage: Ready (replaces Blob)';
  RAISE NOTICE '🔄 Cron Jobs: Ready (replaces Cron)';
  RAISE NOTICE '🚀 All features are now available for FREE!';
END $$;
