import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for security audit
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Check RLS Status
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('audit_sensitive_data_access')

    if (rlsError) {
      console.error('RLS audit error:', rlsError)
    }

    // Check table permissions
    const { data: tablePermissions, error: permissionsError } = await supabase
      .from('information_schema.role_table_grants')
      .select('grantee, privilege_type, table_name')
      .in('table_name', ['conversations', 'failed_emails', 'failed_conversations'])
      .in('grantee', ['public', 'service_role', 'authenticated'])

    // Check RLS enabled status
    const { data: rlsEnabled, error: rlsEnabledError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .in('tablename', ['conversations', 'failed_emails'])
      .eq('schemaname', 'public')

    // Check sample data (masked for security)
    const { data: sampleData, error: sampleError } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        email_status,
        lead_score
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    // Security checks
    const securityChecks = [
      {
        check: 'RLS enabled on conversations',
        status: rlsEnabled?.find(t => t.tablename === 'conversations')?.rowsecurity ? '✅ PASS' : '❌ FAIL',
        description: 'Row Level Security must be enabled'
      },
      {
        check: 'RLS enabled on failed_emails',
        status: rlsEnabled?.find(t => t.tablename === 'failed_emails')?.rowsecurity ? '✅ PASS' : '❌ FAIL',
        description: 'Row Level Security must be enabled'
      },
      {
        check: 'Service role has SELECT on conversations',
        status: tablePermissions?.some(p => p.table_name === 'conversations' && p.grantee === 'service_role' && p.privilege_type === 'SELECT') ? '✅ PASS' : '❌ FAIL',
        description: 'Service role needs SELECT permission'
      },
      {
        check: 'Service role has SELECT on failed_emails',
        status: tablePermissions?.some(p => p.table_name === 'failed_emails' && p.grantee === 'service_role' && p.privilege_type === 'SELECT') ? '✅ PASS' : '❌ FAIL',
        description: 'Service role needs SELECT permission'
      },
      {
        check: 'Public blocked from conversations',
        status: !tablePermissions?.some(p => p.table_name === 'conversations' && p.grantee === 'public') ? '✅ PASS' : '❌ FAIL',
        description: 'Public should not have access'
      },
      {
        check: 'Public blocked from failed_emails',
        status: !tablePermissions?.some(p => p.table_name === 'failed_emails' && p.grantee === 'public') ? '✅ PASS' : '❌ FAIL',
        description: 'Public should not have access'
      },
      {
        check: 'Failed conversations view exists',
        status: tablePermissions?.some(p => p.table_name === 'failed_conversations') ? '✅ PASS' : '❌ FAIL',
        description: 'View should be accessible to service role'
      },
      {
        check: 'Sample data accessible',
        status: sampleData && sampleData.length >= 0 ? '✅ PASS' : '❌ FAIL',
        description: 'Service role should access conversation data'
      }
    ]

    const auditResult = {
      timestamp: new Date().toISOString(),
      security_checks: securityChecks,
      rls_policies: rlsStatus || [],
      table_permissions: tablePermissions || [],
      rls_status: rlsEnabled || [],
      sample_data_count: sampleData?.length || 0,
      overall_security: securityChecks.every(check => check.status === '✅ PASS') ? '🔒 SECURE' : '⚠️  VULNERABLE'
    }

    return NextResponse.json(auditResult)
  } catch (error) {
    console.error('Security audit error:', error)
    return NextResponse.json(
      {
        error: 'Failed to run security audit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST endpoint to test public access (should fail)
export async function POST(request: NextRequest) {
  try {
    // This simulates what a public user would see
    const publicSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // Try to access sensitive data with anon key (should fail)
    const { data: publicData, error: publicError } = await publicSupabase
      .from('failed_conversations')
      .select('count')
      .limit(1)

    const publicAccessTest = {
      test: 'Public access to failed_conversations',
      status: publicError ? '✅ BLOCKED (Expected)' : '❌ VULNERABLE',
      error: publicError?.message || null,
      data_accessible: publicData ? publicData.length : 0
    }

    // Try to access conversations with anon key (should be limited)
    const { data: convData, error: convError } = await publicSupabase
      .from('conversations')
      .select('count')
      .limit(1)

    const conversationsAccessTest = {
      test: 'Public access to conversations',
      status: convError ? '✅ BLOCKED (Expected)' : '❌ VULNERABLE',
      error: convError?.message || null,
      data_accessible: convData ? convData.length : 0
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      public_access_tests: [publicAccessTest, conversationsAccessTest],
      summary: {
        public_blocked: publicError && convError ? '✅ SECURE' : '❌ VULNERABLE',
        message: 'Public access tests completed. Both should show BLOCKED status.'
      }
    })

  } catch (error) {
    console.error('Public access test error:', error)
    return NextResponse.json(
      {
        error: 'Failed to test public access',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
