// ASE: pages/api/load-prospects.js
// Reads FINRA BrokerCheck + Employment History → scores → populates outbound_prospects + campaign
// Called by AutoPilot nightly cron at /api/cron/outreach

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sb(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: opts.method === 'POST' ? 'return=representation' : 'return=minimal',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// TLS proxy score: tenure + activity signals → 0–100
function computeTLSProxy(rep, employmentHistory) {
  let score = 0;
  const reasons = [];

  const currentJobs = employmentHistory.filter(e =>
    e.crd_number === rep.crd_number && (e.end_date === 'None' || !e.end_date)
  );
  const allJobs = employmentHistory.filter(e => e.crd_number === rep.crd_number);

  // Tenure at current employer
  if (currentJobs.length > 0) {
    const tenure = parseInt(currentJobs[0].tenure_months) || 0;
    if (tenure < 12) { score += 45; reasons.push(`Very short tenure (${tenure}mo) — high flight risk`); }
    else if (tenure < 24) { score += 35; reasons.push(`Short tenure (${tenure}mo) — elevated flight risk`); }
    else if (tenure < 36) { score += 20; reasons.push(`Moderate tenure (${tenure}mo)`); }
    else { score += 8; reasons.push(`Long tenure (${tenure}mo) — stable, harder to recruit`); }
  } else {
    score += 18;
    reasons.push('No active employment — actively recruitable');
  }

  // Job change frequency signal
  if (allJobs.length >= 4) { score += 15; reasons.push('High job mobility (4+ roles) — open to change'); }
  else if (allJobs.length >= 2) { score += 8; reasons.push('Some job mobility'); }

  // Current employer quality (empty employer = between jobs)
  if (!rep.current_employer || rep.current_employer.trim() === '') {
    score += 20; reasons.push('Currently unaffiliated — immediate opportunity');
  }

  // Financial services = relevant to Huit.AI products
  const fsKeywords = ['mortgage', 'loan', 'financial', 'lending', 'bank', 'credit', 'capital', 'fund', 'securities', 'invest', 'wealth', 'advisory', 'asset'];
  const employer = (rep.current_employer || '').toLowerCase();
  if (fsKeywords.some(k => employer.includes(k))) {
    score += 15; reasons.push('Financial services professional — strong product fit');
  }

  return { score: Math.min(100, score), reasons };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ase-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const startTime = Date.now();

  try {
    // 1. Fetch all FINRA reps
    const repsRes = await sb('/finra_brokercheck_reps?select=*&limit=1000');
    const reps = Array.isArray(repsRes.data) ? repsRes.data : [];

    // 2. Fetch all employment history
    const empRes = await sb('/finra_employment_history?select=*&limit=5000');
    const employment = Array.isArray(empRes.data) ? empRes.data : [];

    // 3. Get already-loaded source_ids to skip dupes
    const existingRes = await sb('/outbound_prospects?select=source_id&source=eq.finra&limit=2000');
    const existingIds = new Set(
      Array.isArray(existingRes.data) ? existingRes.data.map(r => r.source_id) : []
    );

    // 4. Score and filter
    const toLoad = [];
    for (const rep of reps) {
      if (existingIds.has(rep.crd_number)) continue; // skip already loaded
      const { score, reasons } = computeTLSProxy(rep, employment);
      const nameParts = (rep.full_name || '').trim().split(' ');

      toLoad.push({
        full_name: rep.full_name || `${rep.first_name || ''} ${rep.last_name || ''}`.trim(),
        first_name: rep.first_name || nameParts[0] || '',
        last_name: rep.last_name || nameParts.slice(1).join(' ') || '',
        company: rep.current_employer || '',
        title: 'Financial Professional',
        industry: 'Financial Services',
        persona: 'financial_professional',
        source: 'finra',
        source_id: rep.crd_number,
        ai_score: score,
        ai_score_reasons: reasons,
        product_matches: ['apex-intelligence', 'crmex', 'contentloop', 'huit-ai'],
        status: score >= 55 ? 'ready' : 'low_priority',
        state: 'AK', // Default — enrich later
      });
    }

    if (toLoad.length === 0) {
      return res.status(200).json({
        success: true,
        loaded: 0,
        skipped: reps.length,
        message: 'All FINRA reps already loaded',
        duration_ms: Date.now() - startTime,
      });
    }

    // 5. Batch insert — 50 at a time
    let totalLoaded = 0;
    let totalErrors = 0;
    const BATCH = 50;

    for (let i = 0; i < toLoad.length; i += BATCH) {
      const batch = toLoad.slice(i, i + BATCH);
      const insertRes = await sb('/outbound_prospects', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(batch),
      });
      if (insertRes.ok) totalLoaded += batch.length;
      else totalErrors += batch.length;
    }

    // 6. Ensure campaign exists for this wave
    const campaignCheck = await sb('/outbound_campaigns?name=eq.APEX+Recruiting+—+FINRA+Wave+1&limit=1');
    const existingCampaign = Array.isArray(campaignCheck.data) && campaignCheck.data.length > 0;

    if (!existingCampaign) {
      await sb('/outbound_campaigns', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          name: 'APEX Recruiting — FINRA Wave 1',
          product_slug: 'apex-intelligence',
          persona: 'financial_professional',
          channels: ['email', 'sms', 'call'],
          status: 'active',
          target_states: ['AK', 'WA', 'MT'],
          target_titles: ['Loan Officer', 'Financial Advisor', 'Mortgage Broker'],
          min_ai_score: 55,
          daily_email_limit: 100,
          daily_sms_limit: 50,
          daily_linkedin_limit: 30,
          daily_voice_limit: 20,
        }),
      });
    }

    // 7. Get final counts
    const readyRes = await sb('/outbound_prospects?select=count&source=eq.finra&status=eq.ready');
    const totalReadyCount = Array.isArray(readyRes.data) ? (readyRes.data[0]?.count || 0) : 0;

    return res.status(200).json({
      success: true,
      loaded: totalLoaded,
      errors: totalErrors,
      skipped: existingIds.size,
      ready_for_sequence: totalReadyCount,
      high_priority: toLoad.filter(p => p.ai_score >= 70).length,
      medium_priority: toLoad.filter(p => p.ai_score >= 55 && p.ai_score < 70).length,
      campaign_created: !existingCampaign,
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
