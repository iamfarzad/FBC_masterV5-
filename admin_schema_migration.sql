-- ADMIN SCHEMA MIGRATION - Complete Implementation
-- Run this in Supabase SQL Editor

-- 1. Create admin schema (if not exists)
CREATE SCHEMA IF NOT EXISTS admin;

-- 2. Move admin tables to admin schema (they're currently in public)
-- Note: If tables are already in admin schema, these will be no-ops
ALTER TABLE public.admin_conversations SET SCHEMA admin;
ALTER TABLE public.admin_sessions SET SCHEMA admin;

-- 3. Enable RLS on admin tables
ALTER TABLE admin.admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin.admin_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create service-role-only RLS policies
CREATE POLICY "admin_conversations_service_role_only"
ON admin.admin_conversations FOR ALL
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "admin_sessions_service_role_only"
ON admin.admin_sessions FOR ALL
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 5. Grant permissions to service_role
GRANT USAGE ON SCHEMA admin TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA admin TO service_role;
GRANT ALL ON admin.admin_conversations TO service_role;
GRANT ALL ON admin.admin_sessions TO service_role;

-- 6. Create public views for backward compatibility
-- This allows your code to continue using 'admin_conversations' without schema prefix
CREATE VIEW public.admin_conversations AS
SELECT * FROM admin.admin_conversations;

CREATE VIEW public.admin_sessions AS
SELECT * FROM admin.admin_sessions;

-- 7. Enable RLS on the views (inherits from underlying tables)
ALTER VIEW public.admin_conversations SET (security_barrier = true);
ALTER VIEW public.admin_sessions SET (security_barrier = true);

-- 8. Create the search functions in admin schema
CREATE OR REPLACE FUNCTION admin.search_admin_conversations(
    query_embedding VECTOR(1536),
    session_id_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    session_id TEXT,
    message_content TEXT,
    message_type TEXT,
    context_leads TEXT[],
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.id,
        ac.conversation_id,
        ac.session_id,
        ac.message_content,
        ac.message_type,
        ac.context_leads,
        1 - (ac.embeddings <=> query_embedding) AS similarity
    FROM admin.admin_conversations ac
    WHERE (ac.embeddings <=> query_embedding) < (1 - similarity_threshold)
        AND (session_id_filter IS NULL OR ac.session_id = session_id_filter)
    ORDER BY ac.embeddings <=> query_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create public wrapper function for backward compatibility
CREATE OR REPLACE FUNCTION public.search_admin_conversations(
    query_embedding VECTOR(1536),
    session_id_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    conversation_id UUID,
    session_id TEXT,
    message_content TEXT,
    message_type TEXT,
    context_leads TEXT[],
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM admin.search_admin_conversations(
        query_embedding, session_id_filter, limit_count, similarity_threshold
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create conversation context function
CREATE OR REPLACE FUNCTION admin.get_admin_conversation_context(
    session_id_param TEXT,
    limit_messages INTEGER DEFAULT 50
)
RETURNS TABLE (
    message_type TEXT,
    message_content TEXT,
    context_leads TEXT[],
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.message_type,
        ac.message_content,
        ac.context_leads,
        ac.created_at
    FROM admin.admin_conversations ac
    WHERE ac.session_id = session_id_param
    ORDER BY ac.created_at DESC
    LIMIT limit_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create public wrapper
CREATE OR REPLACE FUNCTION public.get_admin_conversation_context(
    session_id_param TEXT,
    limit_messages INTEGER DEFAULT 50
)
RETURNS TABLE (
    message_type TEXT,
    message_content TEXT,
    context_leads TEXT[],
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM admin.get_admin_conversation_context(
        session_id_param, limit_messages
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION admin.search_admin_conversations TO service_role;
GRANT EXECUTE ON FUNCTION public.search_admin_conversations TO service_role;
GRANT EXECUTE ON FUNCTION admin.get_admin_conversation_context TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_conversation_context TO service_role;

-- 13. Set search_path for service_role to include admin schema
ALTER ROLE service_role SET search_path = admin, public;

-- 14. Verify the setup
SELECT 
    'Schema Check' as check_type,
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('admin_conversations', 'admin_sessions')
ORDER BY schemaname;

SELECT 
    'Policy Check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('admin_conversations', 'admin_sessions')
ORDER BY schemaname, tablename;
