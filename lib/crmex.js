const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vvkdnzqgtajeouxlliuk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function writeLead(data) {
  const {
    firstName, lastName, email, phone,
    company, role, product, source,
    qualificationScore, qualificationNotes,
    icpMatch, intent, utmSource, utmMedium,
    utmCampaign, ipAddress, userAgent
  } = data;

  const { data: lead, error } = await supabase
    .from('ase_leads')
    .insert([{
      first_name: firstName || '',
      last_name: lastName || '',
      email: email || '',
      phone: phone || '',
      company: company || '',
      role: role || '',
      product: product || 'UNKNOWN',
      source: source || 'widget',
      qualification_score: qualificationScore || 0,
      qualification_notes: qualificationNotes || '',
      icp_match: icpMatch || false,
      intent: intent || 'unknown',
      utm_source: utmSource || '',
      utm_medium: utmMedium || '',
      utm_campaign: utmCampaign || '',
      ip_address: ipAddress || '',
      user_agent: userAgent || '',
      status: 'new',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('CRMEX write error:', error);
    return { success: false, error };
  }

  return { success: true, lead };
}

async function updateLeadStatus(id, status, notes) {
  const { error } = await supabase
    .from('ase_leads')
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq('id', id);

  return { success: !error, error };
}

async function getLeads(filters = {}) {
  let query = supabase.from('ase_leads').select('*').order('created_at', { ascending: false });

  if (filters.product) query = query.eq('product', filters.product);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  return { data, error };
}

async function createLeadsTable() {
  // SQL to create the table if it doesn't exist
  const sql = `
    CREATE TABLE IF NOT EXISTS ase_leads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      company TEXT,
      role TEXT,
      product TEXT,
      source TEXT DEFAULT 'widget',
      qualification_score INTEGER DEFAULT 0,
      qualification_notes TEXT,
      icp_match BOOLEAN DEFAULT false,
      intent TEXT DEFAULT 'unknown',
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
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
  return sql;
}

module.exports = { writeLead, updateLeadStatus, getLeads, createLeadsTable };
