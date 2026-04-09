const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vvkdnzqgtajeouxlliuk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.headers['x-migrate-key'] !== process.env.ASE_ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS ase_leads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      first_name TEXT, last_name TEXT, email TEXT, phone TEXT,
      company TEXT, role TEXT, product TEXT,
      source TEXT DEFAULT 'widget',
      qualification_score INTEGER DEFAULT 0,
      qualification_notes TEXT,
      icp_match BOOLEAN DEFAULT false,
      intent TEXT DEFAULT 'unknown',
      utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
      ip_address TEXT, user_agent TEXT,
      status TEXT DEFAULT 'new', notes TEXT,
      email_sequence_step INTEGER DEFAULT 0,
      email_sequence_name TEXT,
      last_email_sent TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_ase_leads_product ON ase_leads(product);
    CREATE INDEX IF NOT EXISTS idx_ase_leads_status ON ase_leads(status);
    CREATE INDEX IF NOT EXISTS idx_ase_leads_email ON ase_leads(email);
    CREATE INDEX IF NOT EXISTS idx_ase_leads_created_at ON ase_leads(created_at DESC);
  `;

  const { error } = await supabase.rpc('exec_sql', { query: sql }).single();
  
  if (error) {
    // Try direct insert approach to test connection
    const { error: insertError } = await supabase
      .from('ase_leads')
      .insert([{ email: 'system@huit.ai', product: 'SYSTEM', source: 'migration_test', status: 'test' }]);
    
    return res.status(200).json({ 
      rpc_error: error.message,
      insert_test: insertError ? insertError.message : 'INSERT WORKS - table exists',
    });
  }

  return res.status(200).json({ success: true, message: 'Migration complete' });
}
