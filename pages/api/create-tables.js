import { Pool } from 'pg'

export default async function handler(req, res) {
  if (req.headers['x-ase-key'] !== process.env.ASE_ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const pool = new Pool({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.vvkdnzqgtajeouxlliuk',
    password: process.env.SUPABASE_SERVICE_ROLE_KEY,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ase_leads (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        first_name text, last_name text, email text NOT NULL, phone text,
        company text, role text, product text,
        source text DEFAULT 'widget',
        qualification_score integer DEFAULT 0,
        qualification_notes text,
        icp_match boolean DEFAULT false,
        intent text DEFAULT 'unknown',
        utm_source text, utm_medium text, utm_campaign text,
        ip_address text, user_agent text,
        status text DEFAULT 'new', notes text,
        email_sequence_step integer DEFAULT 0,
        email_sequence_name text,
        last_email_sent timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_ase_leads_email ON public.ase_leads(email);
      CREATE INDEX IF NOT EXISTS idx_ase_leads_product ON public.ase_leads(product);
      CREATE INDEX IF NOT EXISTS idx_ase_leads_created ON public.ase_leads(created_at DESC);
      
      CREATE TABLE IF NOT EXISTS public.checkout_sessions (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id text NOT NULL, customer_id text, email text,
        product text, tier text, amount_cents integer,
        status text DEFAULT 'created',
        metadata jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_checkout_email ON public.checkout_sessions(email);
    `);

    const { rows } = await client.query("SELECT count(*) as c FROM public.ase_leads");
    client.release();
    
    res.json({ success: true, ase_leads_count: rows[0].c, tables: ['ase_leads', 'checkout_sessions'] });
  } catch (err) {
    res.status(500).json({ error: err.message, detail: err.toString(), code: err.code });
  } finally {
    await pool.end();
  }
}
// env refresh 1776146539
