const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vvkdnzqgtajeouxlliuk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================
// ASE Lead Writer — writes to the existing `leads` table
// Maps ASE widget fields → CRMEX leads table columns
// Extra data stored in raw_payload jsonb + tags array
// ============================================================

async function writeLead(data) {
  const {
    firstName, lastName, email, phone,
    company, role, product, source,
    qualificationScore, qualificationNotes,
    icpMatch, intent, utmSource, utmMedium,
    utmCampaign, ipAddress, userAgent
  } = data;

  const tags = ['ase_widget'];
  if (product) tags.push(product);
  if (icpMatch) tags.push('icp_match');
  if (intent === 'high' || qualificationScore >= 70) tags.push('hot_lead');

  const { data: lead, error } = await supabase
    .from('leads')
    .insert([{
      first_name: firstName || '',
      last_name: lastName || '',
      email: email || '',
      phone: phone || '',
      source: source || 'ase_widget',
      status: 'new',
      ai_score: qualificationScore || 0,
      utm_source: utmSource || 'ase',
      tags,
      notes: qualificationNotes || '',
      raw_payload: {
        product: product || 'UNKNOWN',
        company: company || '',
        role: role || '',
        icp_match: icpMatch || false,
        intent: intent || 'unknown',
        utm_medium: utmMedium || '',
        utm_campaign: utmCampaign || '',
        ip_address: ipAddress || '',
        user_agent: userAgent || '',
        captured_via: 'huit_ase_widget',
        captured_at: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('CRMEX lead write error:', error);
    return { success: false, error };
  }

  return { success: true, lead };
}

async function updateLeadStatus(id, status, notes) {
  const { error } = await supabase
    .from('leads')
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq('id', id);

  return { success: !error, error };
}

async function getLeads(filters = {}) {
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

  if (filters.product) query = query.contains('tags', [filters.product]);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.source) query = query.eq('source', filters.source);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  return { data, error };
}

module.exports = { writeLead, updateLeadStatus, getLeads };
