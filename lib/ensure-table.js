const { createClient } = require('@supabase/supabase-js');

let tableEnsured = false;

async function ensureLeadsTable() {
  if (tableEnsured) return;

  const supabase = createClient(
    'https://vvkdnzqgtajeouxlliuk.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Test if table exists by selecting 0 rows
  const { error } = await supabase
    .from('ase_leads')
    .select('id')
    .limit(0);

  if (error && error.message?.includes('does not exist')) {
    // Create via SQL function if available
    await supabase.rpc('create_ase_leads_table').catch(() => {});
  }
  
  tableEnsured = true;
}

module.exports = { ensureLeadsTable };
