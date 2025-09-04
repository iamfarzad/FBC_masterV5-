
// Unified RLS policy generator
export function generateRLSPolicies(tableName: string, options: {
  hasUserId?: boolean
  hasSessionId?: boolean
  allowServiceRole?: boolean
  allowPublicRead?: boolean
} = {}) {
  const policies: string[] = []
  
  // Service role bypass (if needed)
  if (options.allowServiceRole) {
    policies.push(`
CREATE POLICY "${tableName}_service_role_all" ON ${tableName}
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
`)
  }
  
  // User-based policies
  if (options.hasUserId) {
    policies.push(`
CREATE POLICY "${tableName}_user_select" ON ${tableName}
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "${tableName}_user_insert" ON ${tableName}
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "${tableName}_user_update" ON ${tableName}
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "${tableName}_user_delete" ON ${tableName}
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
`)
  }
  
  // Session-based policies
  if (options.hasSessionId) {
    policies.push(`
CREATE POLICY "${tableName}_session_select" ON ${tableName}
  FOR SELECT TO anon, authenticated
  USING (session_id = current_setting('app.session_id', true));

CREATE POLICY "${tableName}_session_insert" ON ${tableName}
  FOR INSERT TO anon, authenticated
  WITH CHECK (session_id = current_setting('app.session_id', true));
`)
  }
  
  // Public read policy
  if (options.allowPublicRead) {
    policies.push(`
CREATE POLICY "${tableName}_public_read" ON ${tableName}
  FOR SELECT TO anon, authenticated
  USING (true);
`)
  }
  
  return policies.join('\n')
}

// Standard updated_at trigger function
export const UPDATED_AT_TRIGGER_FUNCTION = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';
`

// Generate updated_at trigger for table
export function generateUpdatedAtTrigger(tableName: string): string {
  return `
-- Add updated_at column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = '${tableName}' AND column_name = 'updated_at') THEN
        ALTER TABLE ${tableName} ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create trigger
DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON ${tableName};
CREATE TRIGGER update_${tableName}_updated_at
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`
}
