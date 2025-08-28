const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL() {
  try {
    // Execute the first ALTER statement
    const { data: data1, error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER FUNCTION storage.update_updated_at_column() OWNER TO postgres;'
    });

    if (error1) {
      console.error('Error executing first ALTER:', error1);
    } else {
      console.log('First ALTER executed successfully');
    }

    // Execute the second ALTER statement
    const { data: data2, error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER FUNCTION storage.update_updated_at_column() SET search_path = public;'
    });

    if (error2) {
      console.error('Error executing second ALTER:', error2);
    } else {
      console.log('Second ALTER executed successfully');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

executeSQL();
