-- Migration for Failed Conversations System
-- Run this in your Supabase SQL Editor

-- 1. Add failed_emails table
CREATE TABLE IF NOT EXISTS failed_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    failure_reason TEXT,
    retries INTEGER NOT NULL DEFAULT 1,
    email_content JSONB,
    recipient_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_failed_emails_conversation_id ON failed_emails(conversation_id);
CREATE INDEX IF NOT EXISTS idx_failed_emails_failed_at ON failed_emails(failed_at);
CREATE INDEX IF NOT EXISTS idx_failed_emails_retries ON failed_emails(retries);

-- 3. Create the failed_conversations view
CREATE OR REPLACE VIEW failed_conversations AS
SELECT
    fe.id as failed_id,
    fe.failed_at,
    fe.retries,
    fe.failure_reason,
    c.id as conversation_id,
    c.name,
    c.email,
    c.summary,
    c.lead_score,
    c.research_json,
    c.pdf_url,
    c.email_status,
    c.created_at as conversation_created_at
FROM failed_emails fe
JOIN conversations c ON fe.conversation_id = c.id
ORDER BY fe.failed_at DESC;

-- 4. Enable RLS (Row Level Security) if needed
ALTER TABLE failed_emails ENABLE ROW LEVEL SECURITY;

-- 5. Create policy for service role access (adjust as needed)
CREATE POLICY "Service role can access failed_emails" ON failed_emails
FOR ALL USING (auth.role() = 'service_role');

-- 6. Grant necessary permissions
GRANT SELECT ON failed_conversations TO authenticated;
GRANT ALL ON failed_emails TO service_role;

-- 7. Enable Row Level Security (RLS) for maximum security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_emails ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies - BLOCK ALL PUBLIC ACCESS BY DEFAULT

-- Conversations table policies
CREATE POLICY "Allow insert for all (public leads)"
ON conversations FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Block all selects by default"
ON conversations FOR SELECT
TO public
USING (false);

CREATE POLICY "Allow select for service role only"
ON conversations FOR SELECT
TO authenticated
USING (auth.role() = 'service_role');

CREATE POLICY "Allow update for service role only"
ON conversations FOR UPDATE
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Failed emails table policies
CREATE POLICY "Allow insert from service role only"
ON failed_emails FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Block all failed_emails selects by default"
ON failed_emails FOR SELECT
TO public
USING (false);

CREATE POLICY "Allow select for service role only"
ON failed_emails FOR SELECT
TO authenticated
USING (auth.role() = 'service_role');

CREATE POLICY "Allow update for service role only"
ON failed_emails FOR UPDATE
TO authenticated
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 9. Grant permissions only to service role
GRANT SELECT, INSERT, UPDATE ON conversations TO service_role;
GRANT SELECT, INSERT, UPDATE ON failed_emails TO service_role;
GRANT SELECT ON failed_conversations TO service_role;

-- 10. Block public access completely
REVOKE ALL ON conversations FROM public;
REVOKE ALL ON failed_emails FROM public;
REVOKE ALL ON failed_conversations FROM public;

-- 11. Add helpful comments
COMMENT ON TABLE failed_emails IS 'Tracks failed email delivery attempts with full context - SERVICE ROLE ONLY';
COMMENT ON VIEW failed_conversations IS 'Combined view of failed emails with conversation context - SERVICE ROLE ONLY';
COMMENT ON COLUMN failed_emails.email_content IS 'The email content that failed to send';
COMMENT ON COLUMN failed_emails.retries IS 'Number of retry attempts for this specific failure';

-- 12. Security audit function
CREATE OR REPLACE FUNCTION audit_sensitive_data_access()
RETURNS TABLE (
    table_name text,
    policy_name text,
    command text,
    roles text[],
    using_expression text,
    check_expression text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.tablename::text,
        p.policyname::text,
        p.cmd::text,
        p.roles,
        p.qual::text,
        p.with_check::text
    FROM pg_policies p
    WHERE p.tablename IN ('conversations', 'failed_emails')
    ORDER BY p.tablename, p.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create admin conversations tables (separate from lead conversations)

-- Admin conversations table - stores admin Q&A with lead context
CREATE TABLE IF NOT EXISTS admin_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    admin_id TEXT,
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    message_content TEXT NOT NULL,
    message_metadata JSONB,
    embeddings VECTOR(1536), -- OpenAI ada-002 embeddings
    context_leads TEXT[], -- Array of conversation_ids used as context
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin sessions table - tracks admin chat sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT,
    session_name TEXT,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    context_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_conversations_session_id ON admin_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_conversations_conversation_id ON admin_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_admin_conversations_created_at ON admin_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_conversations_embeddings ON admin_conversations USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_active ON admin_sessions(is_active);

-- 14. Enable RLS for admin tables
ALTER TABLE admin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 15. RLS Policies for admin tables (service role only)
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

-- 16. Grant permissions
GRANT ALL ON admin_conversations TO service_role;
GRANT ALL ON admin_sessions TO service_role;

-- 17. Create semantic search function
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

-- 18. Create function to get conversation context
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

-- 19. Create function to link admin message to lead conversations
CREATE OR REPLACE FUNCTION link_admin_message_to_leads(
    message_id UUID,
    lead_ids TEXT[]
)
RETURNS VOID AS $$
BEGIN
    UPDATE admin_conversations
    SET context_leads = lead_ids
    WHERE id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 20. Add comments
COMMENT ON TABLE admin_conversations IS 'Admin Q&A conversations - SEPARATE from lead conversations - SERVICE ROLE ONLY';
COMMENT ON TABLE admin_sessions IS 'Admin chat sessions for long-term memory - SERVICE ROLE ONLY';
COMMENT ON COLUMN admin_conversations.embeddings IS 'Vector embeddings for semantic search';
COMMENT ON COLUMN admin_conversations.context_leads IS 'Array of conversation_ids used as context for this message';

-- 21. Test the policies work
-- This should return 0 rows for anon/public users
-- This should return data for service_role users
