-- SOLUTION: Move tables from admin schema to public schema
-- Run this in Supabase SQL Editor

-- 1. Move tables from admin schema to public schema
ALTER TABLE admin.admin_conversations SET SCHEMA public;
ALTER TABLE admin.admin_sessions SET SCHEMA public;

-- 2. Recreate the search functions in public schema
CREATE OR REPLACE FUNCTION search_admin_conversations(
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
    FROM admin_conversations ac
    WHERE (ac.embeddings <=> query_embedding) < (1 - similarity_threshold)
        AND (session_id_filter IS NULL OR ac.session_id = session_id_filter)
    ORDER BY ac.embeddings <=> query_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate conversation context function
CREATE OR REPLACE FUNCTION get_admin_conversation_context(
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
    FROM admin_conversations ac
    WHERE ac.session_id = session_id_param
    ORDER BY ac.created_at DESC
    LIMIT limit_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add RLS policies for service role access
CREATE POLICY "Admin conversations service role only"
ON admin_conversations FOR ALL
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admin sessions service role only"
ON admin_sessions FOR ALL
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 5. Grant permissions
GRANT ALL ON admin_conversations TO service_role;
GRANT ALL ON admin_sessions TO service_role;

-- 6. Verify setup
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('admin_conversations', 'admin_sessions');
