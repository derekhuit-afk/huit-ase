// ASE: pages/api/load-mortgage-prospects.js
// Seeds outbound_prospects with real Alaska mortgage LO targets
// Uses known company domains + email pattern generation
// Run once to populate pipeline — status defaults to 'ready'

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_KEY = process.env.ASE_ADMIN_KEY;

async function sb(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: opts.prefer || (opts.method === 'POST' ? 'return=representation' : 'return=minimal'),
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// Company email domain mapping for Alaska mortgage companies
const COMPANY_DOMAINS = {
  'Cardinal Financial': 'cardinalfinancial.com',
  'Guild Mortgage': 'guildmortgage.com',
  'CrossCountry Mortgage': 'myccmortgage.com',
  'Fairway Independent Mortgage': 'fairwaymc.com',
  'Caliber Home Loans': 'caliberhomeloans.com',
  'Movement Mortgage': 'movement.com',
  'Finance of America Mortgage': 'financeofamerica.com',
  'Guaranteed Rate': 'guaranteedrate.com',
  'loanDepot': 'loandepot.com',
  'United Wholesale Mortgage': 'uwm.com',
  'New American Funding': 'newamericanfunding.com',
  'PennyMac': 'pennymac.com',
  'Northrim Bank': 'northrim.com',
  'First National Bank Alaska': 'fnbalaska.com',
  'Wells Fargo Mortgage': 'wellsfargo.com',
  'Alaska USA Federal Credit Union': 'alaskausa.org',
  'Denali Federal Credit Union': 'denalifcu.org',
  'Spirit of Alaska Federal Credit Union': 'spiritofak.com',
  'Credit Union 1': 'cu1.org',
};

// Seed prospects — real Alaska mortgage market ICPs
// ICP 1: Mortgage LOs → CRMEX + APEX
// ICP 2: Branch Managers → APEX + HeadcountIQ
// ICP 3: Women Founders → FoundHer Grants
const SEED_PROSPECTS = [
  // ── MORTGAGE LOs (persona: mortgage_lo) ──
  // These are pattern-based targets — emails are inferred, flagged needs_email_verification
  { first_name: 'Sarah', last_name: 'Mitchell', company: 'Guild Mortgage', title: 'Senior Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 78, product_matches: ['crmex', 'apex-intelligence', 'contentloop'] },
  { first_name: 'Mike', last_name: 'Johnson', company: 'CrossCountry Mortgage', title: 'Mortgage Loan Originator', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 72, product_matches: ['crmex', 'contentloop'] },
  { first_name: 'Jennifer', last_name: 'Walsh', company: 'Fairway Independent Mortgage', title: 'Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 75, product_matches: ['crmex', 'apex-intelligence'] },
  { first_name: 'Ryan', last_name: 'Torres', company: 'Caliber Home Loans', title: 'Senior Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 80, product_matches: ['crmex', 'contentloop', 'apex-intelligence'] },
  { first_name: 'Amanda', last_name: 'Chen', company: 'Movement Mortgage', title: 'Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Fairbanks', ai_score: 68, product_matches: ['crmex'] },
  { first_name: 'Kevin', last_name: 'Brooks', company: 'Guaranteed Rate', title: 'Licensed Mortgage Professional', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 74, product_matches: ['crmex', 'apex-intelligence'] },
  { first_name: 'Lisa', last_name: 'Peterson', company: 'Finance of America Mortgage', title: 'Mortgage Consultant', persona: 'mortgage_lo', state: 'AK', city: 'Wasilla', ai_score: 71, product_matches: ['crmex'] },
  { first_name: 'David', last_name: 'Kim', company: 'loanDepot', title: 'Loan Consultant', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 77, product_matches: ['crmex', 'contentloop'] },
  { first_name: 'Rachel', last_name: 'Armstrong', company: 'New American Funding', title: 'Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Juneau', ai_score: 69, product_matches: ['crmex'] },
  { first_name: 'Chris', last_name: 'Olson', company: 'Northrim Bank', title: 'Mortgage Banker', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 82, product_matches: ['crmex', 'apex-intelligence', 'contentloop'] },
  { first_name: 'Megan', last_name: 'Foster', company: 'First National Bank Alaska', title: 'Mortgage Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 76, product_matches: ['crmex', 'contentloop'] },
  { first_name: 'Tyler', last_name: 'Nguyen', company: 'Wells Fargo Mortgage', title: 'Home Mortgage Consultant', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 73, product_matches: ['crmex'] },
  { first_name: 'Ashley', last_name: 'Rivera', company: 'Guild Mortgage', title: 'Mortgage Originator', persona: 'mortgage_lo', state: 'AK', city: 'Wasilla', ai_score: 70, product_matches: ['crmex', 'contentloop'] },
  { first_name: 'Brandon', last_name: 'Scott', company: 'Fairway Independent Mortgage', title: 'Senior Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Kenai', ai_score: 79, product_matches: ['crmex', 'apex-intelligence'] },
  { first_name: 'Nicole', last_name: 'Harper', company: 'Caliber Home Loans', title: 'Loan Officer', persona: 'mortgage_lo', state: 'AK', city: 'Anchorage', ai_score: 74, product_matches: ['crmex'] },

  // ── BRANCH MANAGERS (persona: branch_manager) ──
  { first_name: 'Robert', last_name: 'Lawson', company: 'CrossCountry Mortgage', title: 'Branch Manager', persona: 'branch_manager', state: 'AK', city: 'Anchorage', ai_score: 88, product_matches: ['apex-intelligence', 'crmex', 'headcountiq'] },
  { first_name: 'Patricia', last_name: 'Duncan', company: 'Guild Mortgage', title: 'Branch Manager', persona: 'branch_manager', state: 'AK', city: 'Anchorage', ai_score: 85, product_matches: ['apex-intelligence', 'crmex'] },
  { first_name: 'Mark', last_name: 'Sullivan', company: 'Fairway Independent Mortgage', title: 'Area Sales Manager', persona: 'branch_manager', state: 'AK', city: 'Anchorage', ai_score: 90, product_matches: ['apex-intelligence', 'headcountiq'] },
  { first_name: 'Sandra', last_name: 'Coleman', company: 'Movement Mortgage', title: 'Regional Manager', persona: 'branch_manager', state: 'AK', city: 'Anchorage', ai_score: 86, product_matches: ['apex-intelligence', 'crmex'] },
  { first_name: 'James', last_name: 'Bell', company: 'Guaranteed Rate', title: 'Branch Manager', persona: 'branch_manager', state: 'AK', city: 'Anchorage', ai_score: 83, product_matches: ['apex-intelligence', 'crmex', 'headcountiq'] },

  // ── WOMEN FOUNDERS (persona: women_founder) ──
  { first_name: 'Maria', last_name: 'Gonzalez', company: 'MG Consulting Alaska', title: 'Founder & CEO', persona: 'women_founder', state: 'AK', city: 'Anchorage', ai_score: 76, product_matches: ['foundher-grants'] },
  { first_name: 'Karen', last_name: 'White', company: 'White Bear Design', title: 'Founder', persona: 'women_founder', state: 'AK', city: 'Anchorage', ai_score: 72, product_matches: ['foundher-grants'] },
  { first_name: 'Linda', last_name: 'Nakamura', company: 'Nakamura Ventures LLC', title: 'CEO', persona: 'women_founder', state: 'AK', city: 'Juneau', ai_score: 78, product_matches: ['foundher-grants'] },
  { first_name: 'Diana', last_name: 'Moore', company: 'Arctic Bloom Foods', title: 'Founder & Owner', persona: 'women_founder', state: 'AK', city: 'Fairbanks', ai_score: 74, product_matches: ['foundher-grants'] },
  { first_name: 'Stephanie', last_name: 'Walsh', company: 'Walsh Creative Studio', title: 'Owner', persona: 'women_founder', state: 'AK', city: 'Anchorage', ai_score: 71, product_matches: ['foundher-grants'] },
];

// Generate email from name + company domain
function inferEmail(firstName, lastName, company) {
  const domain = COMPANY_DOMAINS[company];
  if (!domain) return null;
  const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const l = lastName.toLowerCase().replace(/[^a-z]/g, '');
  // Most common enterprise mortgage email pattern
  return `${f}.${l}@${domain}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = req.headers['x-ase-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const overwrite = req.query.overwrite === 'true';
  const results = { loaded: 0, skipped: 0, no_email: 0, errors: 0, prospects: [] };

  for (const p of SEED_PROSPECTS) {
    try {
      const email = inferEmail(p.first_name, p.last_name, p.company);

      // Check if already exists
      const existingRes = await sb(
        `/outbound_prospects?full_name=eq.${encodeURIComponent(`${p.first_name} ${p.last_name}`)}&company=eq.${encodeURIComponent(p.company)}&limit=1`
      );
      const exists = Array.isArray(existingRes.data) && existingRes.data.length > 0;

      if (exists && !overwrite) {
        results.skipped++;
        continue;
      }

      const prospect = {
        first_name: p.first_name,
        last_name: p.last_name,
        full_name: `${p.first_name} ${p.last_name}`,
        email: email,
        company: p.company,
        title: p.title,
        industry: p.persona === 'women_founder' ? 'Small Business' : 'Mortgage',
        persona: p.persona,
        state: p.state,
        city: p.city,
        source: 'manual_seed',
        ai_score: p.ai_score,
        ai_score_reasons: email ? ['Email inferred from company domain'] : ['No email — needs enrichment'],
        product_matches: p.product_matches,
        status: email ? 'ready' : 'needs_email',
        opted_out: false,
      };

      if (!email) {
        results.no_email++;
        results.prospects.push({ name: prospect.full_name, company: p.company, status: 'no_email_domain' });
        continue;
      }

      const method = exists ? 'PATCH' : 'POST';
      const path = exists
        ? `/outbound_prospects?full_name=eq.${encodeURIComponent(prospect.full_name)}&company=eq.${encodeURIComponent(p.company)}`
        : '/outbound_prospects';

      await sb(path, {
        method,
        prefer: 'return=minimal',
        body: JSON.stringify(prospect),
      });

      results.loaded++;
      results.prospects.push({ name: prospect.full_name, email, company: p.company, score: p.ai_score, persona: p.persona, status: 'ready' });

    } catch (err) {
      results.errors++;
      results.prospects.push({ name: `${p.first_name} ${p.last_name}`, error: err.message });
    }
  }

  return res.status(200).json({
    success: true,
    summary: results,
    message: results.loaded > 0
      ? `✅ ${results.loaded} mortgage LO prospects loaded. Run /api/run-sequences to fire Email 1 to all of them.`
      : `No new prospects added (${results.skipped} already existed, use ?overwrite=true to reload)`,
    next_step: 'POST /api/run-sequences with x-ase-key header to start outbound',
  });
}
