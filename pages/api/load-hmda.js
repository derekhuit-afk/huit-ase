// ASE: pages/api/load-hmda.js
// Pulls Alaska mortgage loan officers from CFPB HMDA public API
// Maps originator data → outbound_prospects with TLS scoring
// API docs: https://ffiec.cfpb.gov/api/data-browser/

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// CFPB HMDA Data Browser API — free, public, no key needed
const HMDA_API = 'https://ffiec.cfpb.gov/api/data-browser/data';
const HMDA_INSTITUTIONS_API = 'https://ffiec.cfpb.gov/api/data-browser/institutions';

async function sb(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: opts.method === 'POST' ? 'return=minimal' : undefined,
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// Compute LO-specific TLS score based on production signals
function scoreLO(institution, year) {
  let score = 0;
  const reasons = [];

  const loanCount = institution.count || 0;
  const currentYear = 2025;
  const dataAge = currentYear - parseInt(year);

  // Production volume signal
  if (loanCount >= 100) { score += 30; reasons.push(`High volume LO (${loanCount} loans/${year})`); }
  else if (loanCount >= 36) { score += 22; reasons.push(`Active LO (${loanCount} loans/${year})`); }
  else if (loanCount >= 12) { score += 14; reasons.push(`Moderate production (${loanCount} loans/${year})`); }
  else { score += 6; reasons.push(`Low volume (${loanCount} loans/${year})`); }

  // Recency signal
  if (dataAge === 0) { score += 25; reasons.push('Active in current year'); }
  else if (dataAge === 1) { score += 18; reasons.push('Active last year — likely still originating'); }
  else if (dataAge <= 2) { score += 10; reasons.push('Recent origination history'); }
  else { score += 4; reasons.push(`Data is ${dataAge} years old`); }

  // Alaska market — high value, limited competition, CF has strong footprint
  score += 20;
  reasons.push('Alaska market — Cardinal Financial target market');

  // Mortgage professional = direct Huit.AI + CF product fit
  score += 15;
  reasons.push('Mortgage originator — direct APEX/CRMEX/ContentLoop fit');

  return { score: Math.min(100, score), reasons };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ase-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const startTime = Date.now();
  const years = ['2024', '2023', '2022'];
  const states = ['AK']; // Alaska primary; expand to WA, MT later

  try {
    // 1. Get already-loaded HMDA source IDs
    const existingRes = await sb('/outbound_prospects?select=source_id&source=eq.hmda&limit=5000');
    const existingIds = new Set(
      Array.isArray(existingRes.data) ? existingRes.data.map(r => r.source_id) : []
    );

    let totalLoaded = 0;
    let totalSkipped = existingIds.size;
    let totalErrors = 0;
    const allProspects = [];

    for (const state of states) {
      for (const year of years) {
        try {
          // Pull Alaska institutions that originated mortgages in this year
          // Using institutions endpoint to get lender-level data
          const params = new URLSearchParams({
            state_code: state,
            year: year,
            actions_taken: '1', // originated loans only
            loan_types: '1,2,3', // conventional + FHA + VA
            loan_purposes: '1,31,32', // purchase + refinance
            limit: '1000',
            offset: '0',
          });

          const apiRes = await fetch(
            `${HMDA_INSTITUTIONS_API}?${params}`,
            { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(15000) }
          );

          if (!apiRes.ok) {
            // Fallback: use aggregate data endpoint
            const aggRes = await fetch(
              `${HMDA_API}/${year}/aggregations?state_code=${state}&actions_taken=1&loan_types=1,2,3`,
              { signal: AbortSignal.timeout(15000) }
            );
            if (!aggRes.ok) continue;
            const aggData = await aggRes.json();
            const institutions = aggData.data || [];

            for (const inst of institutions) {
              const sourceId = `hmda_${year}_${state}_${inst.lei || inst.respondent_id || inst.name?.replace(/\s+/g,'_')}`;
              if (existingIds.has(sourceId)) { totalSkipped++; continue; }

              const { score, reasons } = scoreLO(inst, year);
              allProspects.push({
                full_name: inst.name || `${inst.respondent_name || 'Loan Officer'} — ${inst.city || state}`,
                first_name: '',
                last_name: '',
                company: inst.name || inst.respondent_name || '',
                title: 'Mortgage Loan Originator',
                industry: 'Mortgage / Real Estate Finance',
                persona: 'mortgage_lo',
                source: 'hmda',
                source_id: sourceId,
                city: inst.city || '',
                state: state,
                ai_score: score,
                ai_score_reasons: reasons,
                product_matches: ['apex-intelligence', 'crmex', 'contentloop', 'hyperloanai'],
                status: score >= 40 ? 'ready' : 'low_priority',
              });
              existingIds.add(sourceId);
            }
            continue;
          }

          const apiData = await apiRes.json();
          const institutions = apiData.institutions || apiData.data || [];

          for (const inst of institutions) {
            const lei = inst.lei || inst.respondent_id || '';
            const sourceId = `hmda_${year}_${state}_${lei}`;
            if (existingIds.has(sourceId)) { totalSkipped++; continue; }

            const { score, reasons } = scoreLO(inst, year);
            const instName = inst.name || inst.respondent_name || 'Mortgage Institution';

            allProspects.push({
              full_name: instName,
              first_name: '',
              last_name: '',
              company: instName,
              title: 'Mortgage Loan Originator',
              industry: 'Mortgage / Real Estate Finance',
              persona: 'mortgage_lo',
              source: 'hmda',
              source_id: sourceId,
              city: inst.city || '',
              state: state,
              ai_score: score,
              ai_score_reasons: reasons,
              product_matches: ['apex-intelligence', 'crmex', 'contentloop', 'hyperloanai'],
              status: score >= 40 ? 'ready' : 'low_priority',
            });
            existingIds.add(sourceId);
          }

        } catch (yearErr) {
          console.error(`HMDA ${year}/${state} error:`, yearErr.message);
          totalErrors++;
        }
      }
    }

    // 2. Batch insert all new prospects — 50 at a time
    const BATCH = 50;
    for (let i = 0; i < allProspects.length; i += BATCH) {
      const batch = allProspects.slice(i, i + BATCH);
      const insertRes = await sb('/outbound_prospects', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(batch),
      });
      if (insertRes.ok) totalLoaded += batch.length;
      else totalErrors += batch.length;
    }

    // 3. Ensure HMDA campaign exists
    const campCheck = await sb('/outbound_campaigns?name=eq.APEX+Recruiting+—+HMDA+Alaska+LOs&limit=1');
    const campaignExists = Array.isArray(campCheck.data) && campCheck.data.length > 0;
    if (!campaignExists && totalLoaded > 0) {
      await sb('/outbound_campaigns', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          name: 'APEX Recruiting — HMDA Alaska LOs',
          product_slug: 'apex-intelligence',
          persona: 'mortgage_lo',
          channels: ['email', 'sms', 'call'],
          status: 'active',
          target_states: ['AK', 'WA', 'MT'],
          target_titles: ['Loan Officer', 'Mortgage Originator', 'Branch Manager'],
          min_ai_score: 40,
          daily_email_limit: 100,
          daily_sms_limit: 50,
          daily_linkedin_limit: 30,
          daily_voice_limit: 20,
        }),
      });
    }

    // 4. Final pipeline count
    const totalRes = await sb('/outbound_prospects?select=count&source=eq.hmda');
    const hmda_total = Array.isArray(totalRes.data) ? (totalRes.data[0]?.count || 0) : 0;

    return res.status(200).json({
      success: true,
      loaded: totalLoaded,
      skipped: totalSkipped,
      errors: totalErrors,
      hmda_total_in_pipeline: hmda_total,
      high_priority: allProspects.filter(p => p.ai_score >= 70).length,
      ready: allProspects.filter(p => p.ai_score >= 40).length,
      years_pulled: years,
      states_pulled: states,
      campaign_created: !campaignExists && totalLoaded > 0,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      duration_ms: Date.now() - startTime,
    });
  }
}
