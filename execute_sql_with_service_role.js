const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin access
const supabaseUrl = 'https://ksmxqswuzrmdgckwxkvn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbXhxc3d1enJtZGdja3d4a3ZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTc4NTI2MiwiZXhwIjoyMDU3MzYxMjYyfQ.9H3ihs0mEAEDk03d_V-Bt8Ywl4uouVIJ13CFUM3nVxU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL() {
  try {
    console.log('Attempting to execute SQL with service role...');
    
    // Try using rpc with a custom function (this might not exist)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;'
    });
    
    if (error) {
      console.log('RPC method failed, trying alternative approach...');
      
      // Alternative: Try using the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({
          sql: 'ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres; ALTER FUNCTION storage.update_updated_at_column() SET search_path = public;'
        })
      });
      
      const result = await response.json();
      console.log('REST API response:', result);
    } else {
      console.log('First SQL executed successfully:', data);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

executeSQL();
