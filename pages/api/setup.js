export default async function handler(req, res) {
  if (req.headers['x-ase-key'] !== process.env.ASE_ADMIN_KEY) {
    return res.status(401).end();
  }

  const SUPABASE_URL = 'https://vvkdnzqgtajeouxlliuk.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Use Supabase's SQL endpoint (available in some plans)
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
    CREATE INDEX IF NOT EXISTS idx_ase_leads_created_at ON ase_leads(created_at DESC);
  `;

  try {
    // Try via Supabase SQL API
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await r.text();

    // Also verify by trying a select
    const verify = await fetch(`${SUPABASE_URL}/rest/v1/ase_leads?limit=1`, {
      headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY }
    });

    const verifyData = await verify.json();
    const tableExists = Array.isArray(verifyData);

    return res.status(200).json({
      sql_result: result.substring(0, 200),
      table_exists: tableExists,
      verify: verifyData
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
