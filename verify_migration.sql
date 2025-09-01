-- VERIFICATION QUERY - Run this in Supabase SQL Editor after migration
-- This confirms the admin schema migration was successful

-- Check table locations and RLS status
SELECT 
    'Table Locations' as check_type,
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN schemaname = 'admin' THEN '✅ CORRECT - Admin Schema'
        WHEN schemaname = 'public' AND tablename LIKE 'admin_%' THEN '🔗 VIEW - Backward Compatibility'
        ELSE 'ℹ️ Other'
    END as status
FROM pg_tables 
WHERE tablename IN ('admin_conversations', 'admin_sessions')
ORDER BY schemaname;

-- Check RLS policies
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('admin_conversations', 'admin_sessions')
ORDER BY schemaname, tablename;

-- Check functions created
SELECT 
    'Functions Created' as check_type,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('admin', 'public') 
AND p.proname LIKE '%admin%'
ORDER BY n.nspname, p.proname;

-- Test permissions (should return results if migration successful)
SELECT 
    'Permission Test' as check_type,
    'Migration appears successful - you can access admin tables' as message
WHERE EXISTS (
    SELECT 1 FROM information_schema.table_privileges 
    WHERE grantee = 'service_role' 
    AND table_name IN ('admin_conversations', 'admin_sessions')
);
