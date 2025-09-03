-- Storage Policies for Session-Based App (No User Accounts)
-- This script sets up storage for file uploads, AI analysis, and session management

-- 1. CREATE STORAGE BUCKETS (run in Supabase Dashboard → Storage)

-- Bucket: uploads
-- Purpose: User file uploads during sessions (PDFs, docs, images)
-- Access: Public read, authenticated write
-- Cleanup: Delete when chat session resets or after 24h inactivity
-- Use Case: File uploads for AI analysis, document processing

-- Bucket: analytics  
-- Purpose: AI-generated summaries, analysis results, downloadable PDFs
-- Access: Public read, authenticated write
-- Cleanup: Keep for 7 days, then auto-delete
-- Use Case: AI summaries, downloadable reports, session results

-- Bucket: temp  
-- Purpose: Temporary processing files, intermediate results
-- Access: Public read, authenticated write
-- Cleanup: Automatic after 2 hours
-- Use Case: Processing uploads, temporary AI outputs

-- Bucket: artifacts
-- Purpose: AI-generated images, charts, visual content
-- Access: Public read, authenticated write  
-- Cleanup: Automatic after 7 days
-- Use Case: AI-generated images, charts, visual summaries

-- 2. STORAGE POLICIES (run after creating buckets)

-- UPLOADS BUCKET POLICIES (session-based files)
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  ('uploads_public_read', 'uploads', '{"action": "SELECT", "definition": "true"}'),
  ('uploads_authenticated_write', 'uploads', '{"action": "INSERT", "definition": "auth.role() = ''authenticated''"}'),
  ('uploads_authenticated_update', 'uploads', '{"action": "UPDATE", "definition": "auth.role() = ''authenticated''"}'),
  ('uploads_authenticated_delete', 'uploads', '{"action": "DELETE", "definition": "auth.role() = ''authenticated''"}')
ON CONFLICT (name) DO NOTHING;

-- ANALYTICS BUCKET POLICIES (AI results, summaries)
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  ('analytics_public_read', 'analytics', '{"action": "SELECT", "definition": "true"}'),
  ('analytics_authenticated_write', 'analytics', '{"action": "INSERT", "definition": "auth.role() = ''authenticated''"}'),
  ('analytics_authenticated_update', 'analytics', '{"action": "UPDATE", "definition": "auth.role() = ''authenticated''"}'),
  ('analytics_authenticated_delete', 'analytics', '{"action": "DELETE", "definition": "auth.role() = ''authenticated''"}')
ON CONFLICT (name) DO NOTHING;

-- TEMP BUCKET POLICIES (with fast cleanup)
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  ('temp_public_read', 'temp', '{"action": "SELECT", "definition": "true"}'),
  ('temp_authenticated_write', 'temp', '{"action": "INSERT", "definition": "auth.role() = ''authenticated''"}'),
  ('temp_authenticated_update', 'temp', '{"action": "UPDATE", "definition": "auth.role() = ''authenticated''"}'),
  ('temp_authenticated_delete', 'temp', '{"action": "DELETE", "definition": "auth.role() = ''authenticated''"}')
ON CONFLICT (name) DO NOTHING;

-- ARTIFACTS BUCKET POLICIES (AI-generated content)
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  ('artifacts_public_read', 'artifacts', '{"action": "SELECT", "definition": "true"}'),
  ('artifacts_authenticated_write', 'artifacts', '{"action": "INSERT", "definition": "auth.role() = ''authenticated''"}'),
  ('artifacts_authenticated_update', 'artifacts', '{"action": "UPDATE", "definition": "auth.role() = ''authenticated''"}'),
  ('artifacts_authenticated_delete', 'artifacts', '{"action": "DELETE", "definition": "auth.role() = ''authenticated''"}')
ON CONFLICT (name) DO NOTHING;

-- 3. SESSION-BASED CLEANUP FUNCTIONS

-- Clean uploads when chat session resets (based on session_id or timestamp)
CREATE OR REPLACE FUNCTION cleanup_session_uploads(session_id TEXT DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- If session_id provided, clean specific session files
  IF session_id IS NOT NULL THEN
    FOR file_record IN 
      SELECT file_path 
      FROM file_metadata 
      WHERE bucket_name = 'uploads' 
        AND metadata->>'session_id' = session_id
    LOOP
      -- Delete from storage
      DELETE FROM storage.objects 
      WHERE bucket_id = 'uploads' AND name = file_record.file_path;
      
      -- Delete metadata
      DELETE FROM file_metadata 
      WHERE bucket_name = 'uploads' AND file_path = file_record.file_path;
      
      deleted_count := deleted_count + 1;
    END LOOP;
  ELSE
    -- Clean uploads older than 24 hours (inactive sessions)
    FOR file_record IN 
      SELECT file_path 
      FROM file_metadata 
      WHERE bucket_name = 'uploads' 
        AND created_at < now() - INTERVAL '24 hours'
    LOOP
      DELETE FROM storage.objects 
      WHERE bucket_id = 'uploads' AND name = file_record.file_path;
      
      DELETE FROM file_metadata 
      WHERE bucket_name = 'uploads' AND file_path = file_record.file_path;
      
      deleted_count := deleted_count + 1;
    END LOOP;
  END IF;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean analytics files older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  FOR file_record IN 
    SELECT file_path 
    FROM file_metadata 
    WHERE bucket_name = 'analytics' 
      AND created_at < now() - INTERVAL '7 days'
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = 'analytics' AND name = file_record.file_path;
    
    DELETE FROM file_metadata 
    WHERE bucket_name = 'analytics' AND file_path = file_record.file_path;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean temp files older than 2 hours (faster cleanup for processing)
CREATE OR REPLACE FUNCTION cleanup_temp_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  FOR file_record IN 
    SELECT file_path 
    FROM file_metadata 
    WHERE bucket_name = 'temp' 
      AND created_at < now() - INTERVAL '2 hours'
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = 'temp' AND name = file_record.file_path;
    
    DELETE FROM file_metadata 
    WHERE bucket_name = 'temp' AND file_path = file_record.file_path;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean artifacts older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_artifacts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  FOR file_record IN 
    SELECT file_path 
    FROM file_metadata 
    WHERE bucket_name = 'artifacts' 
      AND created_at < now() - INTERVAL '7 days'
  LOOP
    DELETE FROM storage.objects 
    WHERE bucket_id = 'artifacts' AND name = file_record.file_path;
    
    DELETE FROM file_metadata 
    WHERE bucket_name = 'artifacts' AND file_path = file_record.file_path;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. COMPREHENSIVE STORAGE CLEANUP

CREATE OR REPLACE FUNCTION run_comprehensive_storage_cleanup()
RETURNS JSONB AS $$
DECLARE
  uploads_cleaned INTEGER;
  analytics_cleaned INTEGER;
  temp_cleaned INTEGER;
  artifacts_cleaned INTEGER;
  result JSONB;
BEGIN
  -- Clean session uploads (inactive sessions)
  uploads_cleaned := cleanup_session_uploads();
  
  -- Clean old analytics
  analytics_cleaned := cleanup_old_analytics();
  
  -- Clean temp files
  temp_cleaned := cleanup_temp_files();
  
  -- Clean old artifacts
  artifacts_cleaned := cleanup_old_artifacts();
  
  result := jsonb_build_object(
    'uploads_cleaned', uploads_cleaned,
    'analytics_cleaned', analytics_cleaned,
    'temp_cleaned', temp_cleaned,
    'artifacts_cleaned', artifacts_cleaned,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. USAGE EXAMPLES FOR YOUR USE CASE

-- Upload a document for AI analysis
-- SELECT create_file_record(
--   'user_document.pdf',
--   'uploads/session_abc123/document.pdf',
--   2048000,
--   'application/pdf',
--   'uploads',
--   NULL, -- no user_id needed
--   false, -- not public initially
--   'private',
--   ARRAY['upload', 'document', 'pdf'],
--   '{"session_id": "abc123", "source": "file_upload", "for_analysis": true}'::jsonb
-- );

-- Store AI analysis result (downloadable summary)
-- SELECT create_file_record(
--   'analysis_summary.pdf',
--   'analytics/session_abc123/summary_20250105.pdf',
--   512000,
--   'application/pdf',
--   'analytics',
--   NULL, -- no user_id needed
--   true, -- public for download
--   'public',
--   ARRAY['ai_analysis', 'summary', 'downloadable'],
--   '{"session_id": "abc123", "ai_model": "gpt-4", "content_type": "summary", "downloadable": true}'::jsonb
-- );

-- Store temporary AI processing file
-- SELECT create_file_record(
--   'temp_processing.json',
--   'temp/session_abc123/processing_step1.json',
--   102400,
--   'application/json',
--   'temp',
--   NULL, -- no user_id needed
--   false, -- not public
--   'private',
--   ARRAY['processing', 'temporary', 'ai_work'],
--   '{"session_id": "abc123", "step": "processing", "auto_delete": true}'::jsonb
-- );

-- Store AI-generated chart/image
-- SELECT create_file_record(
--   'analysis_chart.png',
--   'artifacts/session_abc123/chart_20250105.png',
--   256000,
--   'image/png',
--   'artifacts',
--   NULL, -- no user_id needed
--   true, -- public for viewing
--   'public',
--   ARRAY['ai_generated', 'chart', 'visualization'],
--   '{"session_id": "abc123", "ai_model": "dall-e", "content_type": "chart", "auto_delete": true}'::jsonb
-- );

-- 6. SESSION MANAGEMENT FUNCTIONS

-- Get all files for a specific session
CREATE OR REPLACE FUNCTION get_session_files(session_id TEXT)
RETURNS TABLE (
  bucket_name TEXT,
  file_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fm.bucket_name,
    fm.file_name,
    fm.file_path,
    fm.file_size,
    fm.mime_type,
    fm.is_public,
    fm.created_at
  FROM file_metadata fm
  WHERE fm.metadata->>'session_id' = session_id
  ORDER BY fm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean all files for a specific session (when chat resets)
CREATE OR REPLACE FUNCTION reset_session_files(session_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  total_cleaned INTEGER := 0;
BEGIN
  -- Clean uploads for this session
  total_cleaned := total_cleaned + cleanup_session_uploads(session_id);
  
  -- Clean temp files for this session
  total_cleaned := total_cleaned + (
    SELECT COUNT(*) FROM file_metadata 
    WHERE bucket_name = 'temp' AND metadata->>'session_id' = session_id
  );
  
  -- Delete temp files for this session
  DELETE FROM storage.objects 
  WHERE bucket_id = 'temp' AND name IN (
    SELECT file_path FROM file_metadata 
    WHERE bucket_name = 'temp' AND metadata->>'session_id' = session_id
  );
  
  DELETE FROM file_metadata 
  WHERE bucket_name = 'temp' AND metadata->>'session_id' = session_id;
  
  RETURN total_cleaned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. MONITORING VIEWS

CREATE OR REPLACE VIEW storage_usage_by_session AS
SELECT 
  metadata->>'session_id' as session_id,
  bucket_name,
  COUNT(*) as file_count,
  SUM(file_size) as total_size_bytes,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb,
  MAX(created_at) as last_activity,
  CASE 
    WHEN bucket_name = 'uploads' THEN 'User uploads for analysis'
    WHEN bucket_name = 'analytics' THEN 'AI analysis results'
    WHEN bucket_name = 'temp' THEN 'Processing files'
    WHEN bucket_name = 'artifacts' THEN 'AI-generated content'
    ELSE 'Other'
  END as bucket_purpose
FROM file_metadata
WHERE metadata->>'session_id' IS NOT NULL
GROUP BY metadata->>'session_id', bucket_name
ORDER BY last_activity DESC;

CREATE OR REPLACE VIEW storage_usage_summary AS
SELECT 
  bucket_name,
  COUNT(*) as total_files,
  SUM(file_size) as total_size_bytes,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb,
  COUNT(*) FILTER (WHERE created_at < now() - INTERVAL '2 hours') as files_older_than_2h,
  COUNT(*) FILTER (WHERE created_at < now() - INTERVAL '24 hours') as files_older_than_24h,
  COUNT(*) FILTER (WHERE created_at < now() - INTERVAL '7 days') as files_older_than_7d,
  MAX(created_at) as newest_file,
  MIN(created_at) as oldest_file
FROM file_metadata
GROUP BY bucket_name
ORDER BY total_size_bytes DESC;

-- 8. FINAL STATUS
DO $$
BEGIN
  RAISE NOTICE '✅ Session-Based Storage Setup Complete!';
  RAISE NOTICE '📁 Buckets: uploads, analytics, temp, artifacts';
  RAISE NOTICE '🔄 Session Management: uploads + temp (24h), analytics + artifacts (7d)';
  RAISE NOTICE '🧹 Auto-cleanup: temp (2h), uploads (24h), analytics/artifacts (7d)';
  RAISE NOTICE '📊 Monitoring: session-based tracking included';
  RAISE NOTICE '🚀 Perfect for session-based AI analysis app!';
END $$;
