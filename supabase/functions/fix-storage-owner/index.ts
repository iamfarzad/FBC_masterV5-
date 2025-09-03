// fix-storage-owner.ts
import { createClient } from "npm:@supabase/supabase-js@2";
import { Client } from "npm:pg@8";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Extract database connection details from service role key
const url = new URL(supabaseUrl);
const dbConfig = {
  host: url.hostname,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: serviceKey,
  ssl: { rejectUnauthorized: false }
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("POST only", { status: 405 });
  }
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    // Execute the ALTER statements
    await client.query(`
      ALTER FUNCTION storage.update_updated_at_column()
        OWNER TO postgres;
    `);
    
    await client.query(`
      ALTER FUNCTION storage.update_updated_at_column()
        SET search_path = public;
    `);
    
    return new Response(JSON.stringify({ success: true, message: "Function ownership updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.end();
  }
});
