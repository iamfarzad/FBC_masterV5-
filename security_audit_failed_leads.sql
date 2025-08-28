-- 🔒 SECURITY AUDIT: Failed Conversations System
-- Run this in Supabase SQL Editor to verify security is properly implemented

-- 1. Check RLS Status
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('conversations', 'failed_emails')
    AND schemaname = 'public'
ORDER BY tablename;

-- 2. Check Active RLS Policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('conversations', 'failed_emails')
ORDER BY tablename, policyname;

-- 3. Check Table Permissions
SELECT
    grantee,
    privilege_type,
    table_name
FROM information_schema.role_table_grants
WHERE table_name IN ('conversations', 'failed_emails', 'failed_conversations')
    AND grantee IN ('public', 'service_role', 'authenticated')
ORDER BY table_name, grantee;

-- 4. Check View Definition and Security
SELECT
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE viewname = 'failed_conversations'
    AND schemaname = 'public';

-- 5. Test Data Access (run these queries as different roles)

-- AS PUBLIC/ANON (should return 0 rows):
/*
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM failed_emails;
SELECT COUNT(*) FROM failed_conversations;
*/

-- AS SERVICE_ROLE (should return actual counts):
/*
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM failed_emails;
SELECT COUNT(*) FROM failed_conversations;
*/

-- 6. Check for Sensitive Data Exposure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('conversations', 'failed_emails')
    AND table_schema = 'public'
    AND column_name IN ('email', 'research_json', 'email_content')
ORDER BY table_name, ordinal_position;

-- 7. Security Recommendations Check
WITH security_checks AS (
    SELECT
        'RLS Enabled on conversations' as check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_tables
            WHERE tablename = 'conversations'
            AND rowsecurity = true
        ) THEN '✅ PASS' ELSE '❌ FAIL' END as status
    UNION ALL
    SELECT
        'RLS Enabled on failed_emails' as check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_tables
            WHERE tablename = 'failed_emails'
            AND rowsecurity = true
        ) THEN '✅ PASS' ELSE '❌ FAIL' END as status
    UNION ALL
    SELECT
        'Service role has SELECT on conversations' as check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
            WHERE table_name = 'conversations'
            AND grantee = 'service_role'
            AND privilege_type = 'SELECT'
        ) THEN '✅ PASS' ELSE '❌ FAIL' END as status
    UNION ALL
    SELECT
        'Service role has SELECT on failed_emails' as check_name,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
            WHERE table_name = 'failed_emails'
            AND grantee = 'service_role'
            AND privilege_type = 'SELECT'
        ) THEN '✅ PASS' ELSE '❌ FAIL' END as status
    UNION ALL
    SELECT
        'Public blocked from conversations' as check_name,
        CASE WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
            WHERE table_name = 'conversations'
            AND grantee = 'public'
        ) THEN '✅ PASS' ELSE '❌ FAIL' END as status
    UNION ALL
    SELECT
        'Public blocked from failed_emails' as check_name,
        CASE WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
            WHERE table_name = 'failed_emails'
            AND grantee = 'public'
        ) THEN '✅ PASS' ELSE '❌ FAIL' END as status
)
SELECT * FROM security_checks ORDER BY check_name;

-- 8. Audit Function Results (if it exists)
SELECT * FROM audit_sensitive_data_access() WHERE table_name IS NOT NULL;

-- 9. Sample Data Check (safe preview)
SELECT
    id,
    created_at,
    email_status,
    lead_score,
    -- Mask sensitive data
    CASE WHEN name IS NOT NULL THEN CONCAT(LEFT(name, 1), '***') ELSE NULL END as name_masked,
    CASE WHEN email IS NOT NULL THEN CONCAT(LEFT(email, 2), '***@***') ELSE NULL END as email_masked,
    CASE WHEN summary IS NOT NULL THEN CONCAT(LEFT(summary, 20), '...') ELSE NULL END as summary_preview
FROM conversations
ORDER BY created_at DESC
LIMIT 5;
