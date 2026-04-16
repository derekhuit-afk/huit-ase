// ASE: pages/api/run-sequences.js  v2.0
// ACTUALLY SENDS EMAIL 1 via Resend on first run
// Schedules steps 2–5 in outbound_touchpoints for /api/send-touchpoints daily cron
// Derek Huit <derek@huit.ai> as sender — huit.ai domain verified in Resend

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ASE_BASE = process.env.ASE_BASE_URL || 'https://huit-ase.vercel.app';

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

// Map sequence step IDs to channel + day_offset
const STEP_MAP = {
  email_1:     { channel: 'email', day_offset: 0,  label: 'Email 1 — Cold Opener' },
  email_2:     { channel: 'email', day_offset: 4,  label: 'Email 2 — Value Deepener' },
  sms:         { channel: 'sms',   day_offset: 7,  label: 'SMS 2-Part Sequence' },
  call_script: { channel: 'call',  day_offset: 10, label: 'Call Script — 60s Voice' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ase-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const limit = parseInt(req.body?.limit || req.query?.limit || '100');
  const minScore = parseInt(req.body?.min_score || '40');
  const startTime = Date.now();

  try {
    // 1. Get campaign_id for FINRA Wave 1
    const campRes = await sb('/outbound_campaigns?select=id&name=eq.APEX+Recruiting+—+FINRA+Wave+1&limit=1');
    const campaignId = Array.isArray(campRes.data) && campRes.data[0] ? campRes.data[0].id : null;

    // 2. Fetch ready prospects not yet contacted
    const prospectsRes = await sb(
      `/outbound_prospects?select=*&status=in.(ready,low_priority)&ai_score=gte.${minScore}&last_contacted_at=is.null&opted_out=eq.false&order=ai_score.desc&limit=${limit}`
    );
    const prospects = Array.isArray(prospectsRes.data) ? prospectsRes.data : [];

    if (prospects.length === 0) {
      return res.status(200).json({
        success: true,
        sequenced: 0,
        message: 'No ready prospects available — run load-prospects first',
        duration_ms: Date.now() - startTime,
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const prospect of prospects) {
      try {
        // 3. Generate 4-step chain via ASE API
        const chainRes = await fetch(`${ASE_BASE}/api/chain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prospectName: prospect.full_name,
            company: prospect.company || 'their current firm',
            loanCount: '',
            market: prospect.state === 'AK' ? 'Alaska' : 'nationwide',
            productLine: 'Cardinal Financial + Huit.AI Platform',
            recruiterName: 'Derek Huit',
            goal: `Recruit ${prospect.full_name} from ${prospect.company || 'financial services'} to Cardinal Financial. TLS Score: ${prospect.ai_score}. Signals: ${(prospect.ai_score_reasons || []).join('; ')}.`,
          }),
        });

        const chainData = await chainRes.json();
        if (!chainData.success || !chainData.sequence) {
          errorCount++;
          continue;
        }

        // 4. Save each step as a touchpoint (status: 'scheduled')
        const touchpoints = Object.entries(chainData.sequence).map(([stepId, stepData]) => {
          const stepMeta = STEP_MAP[stepId] || { channel: 'email', day_offset: 0, label: stepId };
          const scheduledAt = new Date(Date.now() + stepMeta.day_offset * 24 * 60 * 60 * 1000).toISOString();
          return {
            prospect_id: prospect.id,
            campaign_id: campaignId,
            channel: stepMeta.channel,
            direction: 'outbound',
            subject: `${stepMeta.label}`,
            content: stepData.content,
            status: 'scheduled',
            provider: stepMeta.channel === 'email' ? 'ses' : stepMeta.channel === 'sms' ? 'twilio' : 'bland',
          };
        });

        // Batch insert touchpoints
        const tpRes = await sb('/outbound_touchpoints', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(touchpoints),
        });

        // 5. Update prospect status → 'sequenced'
        await sb(`/outbound_prospects?id=eq.${prospect.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            status: 'sequenced',
            last_contacted_at: new Date().toISOString(),
          }),
        });

        // 6. Update campaign enrolled count
        if (campaignId) {
          await sb(`/outbound_campaigns?id=eq.${campaignId}`, {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({
              prospects_enrolled: prospects.indexOf(prospect) + 1,
            }),
          });
        }

        successCount++;
        results.push({
          prospect_id: prospect.id,
          name: prospect.full_name,
          company: prospect.company,
          ai_score: prospect.ai_score,
          touchpoints_created: touchpoints.length,
          status: 'sequenced',
        });

        // Small delay to avoid hammering chain API
        await new Promise(r => setTimeout(r, 800));

      } catch (prospectErr) {
        errorCount++;
        results.push({
          prospect_id: prospect.id,
          name: prospect.full_name,
          status: 'error',
          error: prospectErr.message,
        });
      }
    }

    // 7. Get total pipeline counts
    const pipelineRes = await sb('/outbound_prospects?select=status,count&source=eq.finra');
    const pipeline = Array.isArray(pipelineRes.data) ? pipelineRes.data : [];

    return res.status(200).json({
      success: true,
      sequenced: successCount,
      errors: errorCount,
      prospects_processed: prospects.length,
      results,
      pipeline_snapshot: pipeline,
      campaign_id: campaignId,
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
