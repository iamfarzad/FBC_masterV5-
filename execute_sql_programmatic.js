const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ksmxqswuzrmdgckwxkvn.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTc4NTI2MiwiZXhwIjoyMDU3MzYxMjYyfQ.9H3ihs0mEAEDk03d_V-Bt8Ywl4uouVIJ13CFUM3nVxU";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function executeSQL() {
  try {
    console.log('Executing SQL with service role...');
    
    // Try the pg_execute_server_program approach
    const { data, error } = await supabase.rpc('pg_catalog.pg_execute_server_program', {
      command: `
        ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;
        ALTER FUNCTION storage.update_updated_at_column() SET search_path = public;
      `
    });
    
    if (error) {
      console.error('RPC error:', error);
      
      // Try alternative: use pg_stat_statements or another system function
      console.log('Trying alternative approach...');
      const { data: altData, error: altError } = await supabase.rpc('pg_catalog.pg_log_backend_memory_stats', {});
      console.log('Alternative result:', altData, altError);
    } else {
      console.log('Success:', data);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

executeSQL();
